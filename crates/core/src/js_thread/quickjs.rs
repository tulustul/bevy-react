//! The QuickJS engine (quickjs-ng through rquickjs). The ops are Rust
//! functions over the shared [`Host`] bodies, taking and returning only
//! strings and numbers: every structured value crosses as JSON text, the
//! glue below doing the `JSON.stringify` / `JSON.parse` on the JS side (the
//! engine's C JSON beats walking values from Rust, as on V8's `op_flush`).

use rquickjs::{
    AsyncContext, AsyncRuntime, CaughtError, Ctx, Exception, Function, Object, Value,
    context::EvalOptions, prelude::Promised,
};

use super::Engine;
use super::host::{self, Host};

/// The JS stack QuickJS may use (React recurses down the tree). The JS
/// thread's own stack is sized above it (`JS_THREAD_STACK`).
const MAX_STACK: usize = 8 << 20;

/// Installed before the shared prelude: `__bevyHost` (the `BevyHost` surface
/// `bridge.ts` calls) over the raw string-typed functions.
const GLUE: &str = r#"
(() => {
  const raw = globalThis.__bevyRaw;
  delete globalThis.__bevyRaw;
  const json = (v) => JSON.stringify(v) ?? "null";
  globalThis.__bevyHost = {
    op_flush: raw.flush,
    op_emit: (name, value) => raw.emit(name, json(value)),
    op_request: (id, name, value) => raw.request(Number(id), name, json(value)),
    op_animate: (cmd) => raw.animate(json(cmd)),
    op_next_event: () => raw.nextEvent().then((s) => (s == null ? null : JSON.parse(s))),
    op_take_decode_warnings: () => JSON.parse(raw.takeDecodeWarnings()),
    op_sleep: raw.sleep,
    op_log: raw.log,
    op_now: raw.now,
  };
})();
"#;

pub(super) struct QuickJs {
    runtime: AsyncRuntime,
    context: AsyncContext,
}

/// A JSON argument the glue produced; `TypeError` if it doesn't decode.
fn decode<'js, T: serde::de::DeserializeOwned>(ctx: &Ctx<'js>, json: &str) -> rquickjs::Result<T> {
    serde_json::from_str(json).map_err(|e| Exception::throw_type(ctx, &e.to_string()))
}

fn install(ctx: &Ctx<'_>, host: Host) -> rquickjs::Result<()> {
    let raw = Object::new(ctx.clone())?;
    let h = host.clone();
    raw.set(
        "flush",
        Function::new(
            ctx.clone(),
            move |ctx: Ctx, json: String, devtools: bool| {
                h.flush(&json, devtools)
                    .map_err(|e| Exception::throw_type(&ctx, &e))
            },
        )?,
    )?;
    let h = host.clone();
    raw.set(
        "emit",
        Function::new(ctx.clone(), move |ctx: Ctx, name: String, json: String| {
            decode(&ctx, &json).map(|value| h.emit(name, value))
        })?,
    )?;
    let h = host.clone();
    raw.set(
        "request",
        Function::new(
            ctx.clone(),
            move |ctx: Ctx, id: f64, name: String, json: String| {
                decode(&ctx, &json).map(|value| h.request(id as u64, name, value))
            },
        )?,
    )?;
    let h = host.clone();
    raw.set(
        "animate",
        Function::new(ctx.clone(), move |ctx: Ctx, json: String| {
            decode(&ctx, &json).map(|cmd| h.animate(cmd))
        })?,
    )?;
    raw.set(
        "nextEvent",
        Function::new(ctx.clone(), move || {
            let next = host.next_event();
            Promised(async move {
                next.await
                    .map(|ev| serde_json::to_string(&ev).expect("Outbound serializes"))
            })
        })?,
    )?;
    raw.set(
        "takeDecodeWarnings",
        Function::new(ctx.clone(), || {
            serde_json::to_string(&host::take_decode_warnings()).expect("warnings serialize")
        })?,
    )?;
    raw.set(
        "sleep",
        Function::new(ctx.clone(), |ms: f64| Promised(host::sleep(ms)))?,
    )?;
    raw.set(
        "log",
        Function::new(ctx.clone(), |level: String, msg: String| {
            host::log(&level, &msg)
        })?,
    )?;
    raw.set("now", Function::new(ctx.clone(), host::now)?)?;
    ctx.globals().set("__bevyRaw", raw)
}

/// The reason a rejected promise carries, as the prelude's console prints it.
fn describe<'js>(ctx: &Ctx<'js>, reason: Value<'js>) -> String {
    if let Some(e) = reason.as_exception() {
        let head = format!(
            "{}: {}",
            e.get::<_, String>("name")
                .unwrap_or_else(|_| "Error".into()),
            e.message().unwrap_or_default()
        );
        return match e.stack() {
            Some(stack) if !stack.is_empty() => format!("{head}\n{stack}"),
            _ => head,
        };
    }
    match reason.as_string() {
        Some(s) => s.to_string().unwrap_or_default(),
        None => ctx
            .json_stringify(reason)
            .ok()
            .flatten()
            .and_then(|s| s.to_string().ok())
            .unwrap_or_else(|| "undefined".into()),
    }
}

impl Engine for QuickJs {
    async fn new(host: Host) -> Result<Self, String> {
        let runtime = AsyncRuntime::new().map_err(|e| e.to_string())?;
        runtime.set_max_stack_size(MAX_STACK).await;
        // Logged and swallowed, as on V8. QuickJS reports a rejection the
        // moment it has no handler, so a handler attached later (in a later
        // job) still logs once.
        runtime
            .set_host_promise_rejection_tracker(Some(Box::new(
                |ctx, _promise, reason, is_handled| {
                    if !is_handled {
                        let msg = describe(&ctx, reason);
                        host::log("error", &format!("[js] unhandled promise rejection: {msg}"));
                    }
                },
            )))
            .await;
        let context = AsyncContext::full(&runtime)
            .await
            .map_err(|e| e.to_string())?;
        context
            .with(|ctx| {
                install(&ctx, host).map_err(|e| CaughtError::from_error(&ctx, e).to_string())
            })
            .await?;
        let mut engine = Self { runtime, context };
        engine.execute("[glue]", GLUE.to_owned()).await?;
        Ok(engine)
    }

    async fn execute(&mut self, name: &'static str, code: String) -> Result<(), String> {
        self.context
            .with(|ctx| {
                let mut options = EvalOptions::default();
                // Classic, sloppy-mode scripts — what V8's `execute_script` runs.
                options.strict = false;
                options.filename = Some(name.into());
                ctx.eval_with_options::<(), _>(code, options)
                    .map_err(|e| CaughtError::from_error(&ctx, e).to_string())
            })
            .await
    }

    async fn run_event_loop(&mut self) -> Result<(), String> {
        self.runtime.idle().await;
        Ok(())
    }
}
