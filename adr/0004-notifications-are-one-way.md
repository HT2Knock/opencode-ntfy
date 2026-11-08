# Notifications are one-way

A Notification cannot approve a Permission, answer a Question, or send a prompt. v1 has no ntfy action button, no callback URL, and no reserved reply field.

Phone approval is a different product: it would make the plugin a remote control for the session, and ntfy action URLs would have to be authenticated callbacks into OpenCode. Leaving a dead field in the v1 payload would invite that path without designing it. If it happens, it is a new version, not a flag.
