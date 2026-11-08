# Notification text excludes session content

A Notification carries the Milestone, the session title, and the project name. The project name is the directory's basename, not its absolute path. Prompt text, tool output, file paths, error stacks, and shell commands are never sent.

The Broker may be ntfy.sh, which is a third party. A useful error line or permission command would leak work onto that server and onto every phone subscribed to the Topic. The session title is the accepted leak, because without it the Installer cannot tell two sessions apart. Anything richer waits until the Installer is on a Broker they trust, and even then it is a new decision.
