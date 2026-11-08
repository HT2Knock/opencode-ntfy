# The install is the options object, not a package string

The documented install is one object in the global `plugins` array, with `package` `ntfy-opencode` and a `topic`. The string `"ntfy-opencode"` is a legal OpenCode entry and it sends nothing, because it cannot carry a Topic.

A one-line package string was the obvious install. It cannot name a Topic, a Broker, or a token without a second config language. The object is the contract. Plugin id is `ntfy-opencode`, so a project disables it with `-ntfy-opencode` and does not add a second entry.
