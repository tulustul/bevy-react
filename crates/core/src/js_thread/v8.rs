//! The V8 engine (deno_core): the ops as `#[op2]`s over the shared [`Host`]
//! bodies, exposed as `Deno.core.ops` and aliased to `globalThis.__bevyHost`.

use std::cell::RefCell;
use std::rc::Rc;

use deno_core::{Extension, JsRuntime, OpDecl, OpState, RuntimeOptions, op2};
use deno_error::JsErrorBox;

use super::Engine;
use super::host::{self, Host};
use crate::animations::AnimationCommand;
use crate::protocol::outbound::Outbound;

/// Installed before the shared prelude: the op table as `__bevyHost`, and
/// unhandled rejections logged instead of erroring the event loop (returning
/// `true` suppresses deno's `op_dispatch_exception`, which `pump` would treat
/// as a reload). `console` is the prelude's, resolved at call time.
const GLUE: &str = r#"
globalThis.__bevyHost = Deno.core.ops;
Deno.core.setUnhandledPromiseRejectionHandler((_promise, reason) => {
  console.error("[js] unhandled promise rejection:", reason);
  return true;
});
"#;

#[op2(fast)]
fn op_flush(state: &mut OpState, #[string] json: &str, devtools: bool) -> Result<(), JsErrorBox> {
    state
        .borrow::<Host>()
        .flush(json, devtools)
        .map_err(JsErrorBox::type_error)
}

#[op2]
#[serde]
fn op_take_decode_warnings() -> Vec<crate::diag::Warning> {
    host::take_decode_warnings()
}

#[op2]
fn op_emit(state: &mut OpState, #[string] name: String, #[serde] value: serde_json::Value) {
    state.borrow::<Host>().emit(name, value);
}

#[op2(fast)]
fn op_log(#[string] level: String, #[string] msg: String) {
    host::log(&level, &msg);
}

#[op2]
fn op_animate(state: &mut OpState, #[serde] cmd: AnimationCommand) {
    state.borrow::<Host>().animate(cmd);
}

/// `id` is a `BigInt` on the JS side (well under 2^53 in practice).
#[op2]
fn op_request(
    state: &mut OpState,
    #[bigint] id: u64,
    #[string] name: String,
    #[serde] value: serde_json::Value,
) {
    state.borrow::<Host>().request(id, name, value);
}

#[op2]
#[serde]
async fn op_next_event(state: Rc<RefCell<OpState>>) -> Option<Outbound> {
    let next = state.borrow().borrow::<Host>().next_event();
    next.await
}

#[op2]
async fn op_sleep(ms: f64) {
    host::sleep(ms).await;
}

#[op2(fast)]
fn op_now() -> f64 {
    host::now()
}

/// A deno_core runtime with the bridge ops registered.
pub(super) struct V8(JsRuntime);

impl Engine for V8 {
    async fn new(host: Host) -> Result<Self, String> {
        const OPS: &[OpDecl] = &[
            op_flush(),
            op_take_decode_warnings(),
            op_emit(),
            op_request(),
            op_animate(),
            op_next_event(),
            op_sleep(),
            op_log(),
            op_now(),
        ];
        let ext = Extension {
            name: "bevy_react_bridge",
            ops: std::borrow::Cow::Borrowed(OPS),
            ..Default::default()
        };
        let runtime = JsRuntime::new(RuntimeOptions {
            extensions: vec![ext],
            ..Default::default()
        });
        runtime.op_state().borrow_mut().put(host);
        let mut engine = Self(runtime);
        engine.execute("[glue]", GLUE.to_owned()).await?;
        Ok(engine)
    }

    fn version() -> String {
        format!("V8 {}", deno_core::v8::VERSION_STRING)
    }

    async fn execute(&mut self, name: &'static str, code: String) -> Result<(), String> {
        self.0
            .execute_script(name, code)
            .map(drop)
            .map_err(|e| e.to_string())
    }

    async fn run_event_loop(&mut self) -> Result<(), String> {
        self.0
            .run_event_loop(Default::default())
            .await
            .map_err(|e| e.to_string())
    }
}
