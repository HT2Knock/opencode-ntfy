# Dedupe lives in a process-global registry

An occurrence is claimed once per OpenCode process via a registry on `globalThis` (`Symbol.for("ntfy-opencode.registry")`), not via module state or `ctx.storage`. Setting up also aborts the previous subscription for the same location directory.

Observed on a live server: `setup()` ran many times for the same location, and each run re-evaluated the plugin module and got its own `ctx.storage` namespace. So neither a module-level `Set` nor `ctx.storage` can make "at most one Notification per occurrence" true; five instances each sent the same form's Question. Module-level `setups` reset to `1` every time, which is how we know the module is re-evaluated per instance.

`globalThis` survives module re-evaluation in the same process and the `has`/`add` pair is synchronous, so exactly one instance wins even under concurrent delivery. The registry is keyed by location so a reload replaces that location's subscription instead of adding one. `ctx.storage` stays as a best-effort guard; it is not the mechanism.
