# Hold a push until the prompt is still open

The phone push waits for a hold window before it is sent. The default is 60
seconds for a permission or a question. A reply, a form answer, or a new turn
cancels the held push.

Reason: the desktop terminal already shows a system notification when its window
is not focused. A user at the desk answers in a few seconds, so a push would be a
second alert for the same event. A user away from the desk does not answer, so
the hold expires and the phone rings.

The hold is time based, not presence based. It needs no shared state between the
terminal client and the server, no focus protocol, and no new plugin part. It
also covers the case where the user is at the desk but ignores the prompt, which
is when the phone should ring.

Faults are not held. A failed turn has no pending prompt to answer, so a delay
would only make the alert later.
