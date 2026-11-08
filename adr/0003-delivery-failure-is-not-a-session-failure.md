# A failed send is not a session failure

If the Broker is slow, down, or rejects a Notification, the plugin logs the failure and moves on. It does not fail the turn, delay a permission prompt, unload itself, or kill its event loop. There is no durable retry queue.

A queue would make a dead Broker the plugin's problem instead of the Installer's, and it would be the first thing a later reader "fixes" by throwing into the session. The session must never learn that the phone was not reached.
