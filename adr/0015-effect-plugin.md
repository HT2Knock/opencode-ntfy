# The plugin uses the Effect entry point

The server part is an Effect plugin: `Plugin.define({ id, effect })` from
`@opencode/plugin/effect`.

Reason: the host already runs Effect 4. The event stream is a `Stream`, plugin
lifetime is a `Scope`, and `Effect.retry` covers the reconnect and the delivery
retry. Effect also keeps the typed failure channel honest: delivery failures are
values that are logged, never defects that stop the subscription.

Rules that follow from this:

- `effect` is a peer dependency pinned to the host version. It is never bundled.
- Background work is forked into the plugin scope, so unload interrupts it.
- The stream is retried with an exponential schedule and the failure is logged.
- Timers in the hold registry are injected. Tests use a fake clock instead of
  waiting for real time.
