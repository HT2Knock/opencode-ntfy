# Idle is a finished execution on a root session

Idle is `session.execution.succeeded` on a root session. `session.idle` is also accepted if a build emits it. `session.execution.succeeded` is the end of the turn, not the end of one model step: the per-step signal is `session.step.ended`, and an execution spans the whole drain from prompt admission to the agent stopping.

This was `session.idle` first. On OpenCode 2.0.16 a live server never publishes `session.idle` (nor `session.status`), so Idle never fired; `session.execution.succeeded` arrives once per turn instead. Fault is `session.execution.failed`, an interrupt or a scheduled retry is not a Fault, and a compaction failure is not a Fault. Permission is `permission.asked` except action `question`. Question is that action, plus `form.created`, and one outstanding wait produces one Notification. Replies and cancellations do not notify.

Idle is held about two seconds so a Block or Fault for that same stop can replace it. A new execution during that hold cancels the Idle. After a Fault, further Idle stays suppressed until the next execution starts. The structured error is how we recognize a Fault. It is never copied into the Notification.
