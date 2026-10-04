# Issue tracker: TODO file (PlainTasks)

Issues for this repo live in the single `TODO` file at the repo root, written in
PlainTasks syntax.

## Syntax

- Open task: `☐ short description`
- Done: `✔ description @done(YY-MM-DD HH:MM)`
- Cancelled: `✘ description @cancelled(YY-MM-DD HH:MM)`
- Sections are project headers ending in a colon (`Bugs:`, `Performance:`), nested
  by 2-space indentation; subtasks indent under their parent task the same way.
- Tags are `@word` annotations on the task line (used for triage state — see
  `triage-labels.md`).

## Conventions (observed in the existing file — preserve them)

- **Open items stay short.** The file's own rule: "Keep the descriptions short and
  to the point. Don't put any details here until required." One line, gist only,
  a `file.rs:line` anchor when it helps.
- **Completion notes are detailed.** When marking `✔ @done`, the description is
  expanded in place into a retrospective: what was done, key file/test names,
  gotchas. Match the density of existing done items.
- File into the existing section that fits (`Bugs:`, `Correctness:`,
  `Performance:`, `Leaks:`, `Cleanup / docs:`, `Features:`, …); create a new
  section only when none fits. `Archive:` and `Verified non-issues` are
  append-only history — don't file new work there.

## When a skill says "publish to the issue tracker"

Append a `☐` line under the appropriate section of `TODO`. For work that needs a
real spec (multi-paragraph), put the spec at `.scratch/<feature-slug>/spec.md`
and keep the TODO line short with a pointer to it.

## When a skill says "fetch the relevant ticket"

Find the task line in `TODO` (the user will normally quote or paraphrase it).
Its section, indentation parents, and any pointed-to `.scratch/` files are its
context.

## Wayfinding operations

Used by `/wayfinder`. Multi-ticket efforts don't fit one-line tasks, so they use
the local-markdown layout under `.scratch/`, with a single `☐` line in `TODO`
pointing at the effort:

- **Map**: `.scratch/<effort>/map.md` — the Notes / Decisions-so-far / Fog body.
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`,
  with the question in the body. A `Type:` line records the ticket type
  (`research`/`prototype`/`grilling`/`task`); a `Status:` line records
  `claimed`/`resolved`.
- **Blocking**: a `Blocked by: NN, NN` line near the top. A ticket is unblocked
  when every file it lists is `resolved`.
- **Frontier**: scan `.scratch/<effort>/issues/` for files that are open,
  unblocked, and unclaimed; first by number wins.
- **Claim**: set `Status: claimed` and save before any work.
- **Resolve**: append the answer under an `## Answer` heading, set
  `Status: resolved`, then append a context pointer to the map's
  Decisions-so-far in `map.md`.
