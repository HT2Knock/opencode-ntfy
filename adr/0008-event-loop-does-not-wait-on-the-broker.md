# The event loop does not wait on the Broker

Classifying an event and sending a Notification are separate. The subscription loop hands the send off and keeps reading. The send is one attempt, aborted at 5 seconds, then dropped. The log may record the Milestone and the HTTP status. It must not record the token or session content.

The V2 event stream is volatile: a slow consumer overflows and the stream fails, and events during the gap are gone. Awaiting `fetch` in the loop would make a stalled Broker drop Idle, Permission, Question, and Fault together. Reconnect with backoff does not replay that gap, so the loop has to stay faster than the Broker.
