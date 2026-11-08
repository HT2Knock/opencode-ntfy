# Quiet hours suppress every event push

Between the configured start and end time, in the configured time zone, no event
push is sent. The window wraps over midnight. The tool is not suppressed when it
is called with priority 5.

Reason: a blocked agent can wait until morning. A permission or a question at
03:00 is not worth a wake-up, and a fault at 03:00 is not either. An explicit
request from the user is different, so the tool can override the window.

The window is evaluated when the push would be sent, not when the event arrives.
A permission that arrives at 22:29 and would send at 22:30 is suppressed.
