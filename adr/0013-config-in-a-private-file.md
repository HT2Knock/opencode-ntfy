# The route lives in a private config file

Topic, server, and token are read from `~/.config/opencode/ntfy.json`, not from
the `plugins` options object.

Reason: the OpenCode configuration in a dotfiles repository is often public. A
plugin entry with a broker URL publishes the host name. The config file is
gitignored and mode 600, so one recipe works on every host without exposing the
server.

The file accepts `{env:NAME}` in any string. A missing variable is an error, not
a silent disable, because a typo in the token name should be visible at load
time.

A missing or invalid file disables the plugin with one warning. It does not stop
the server and it does not fail a session.
