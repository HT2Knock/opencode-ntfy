# Global config owns the route

Topic, Broker, and token are the Installer's, read from global plugin options. The token is an environment substitution, never a literal in config. A project may disable the plugin. It may not point the plugin at a different Topic or Broker, and a missing Topic means the plugin loads and sends nothing.

OpenCode concatenates `plugins` arrays across config files instead of replacing them, so a project entry can appear beside the global one. Routing still comes from the global options. Project options that try to retarget the phone are ignored. A project-only entry has no global Route, so it sends nothing. That matches an Installer-only audience: a repository must not be able to redirect the Installer's phone, and it must not be the place the Route is defined.

The token is written as `{env:NTFY_TOKEN}`. If the host leaves that literal in plugin options, the plugin resolves it. A literal token in config is not a supported Route.
