# An instance notifies only for its own location

A plugin instance sends only when the event's location directory matches `ctx.location`. An event with no location is dropped, not broadcast. A project that disables the plugin has no instance, so that project stays quiet. Two instances that still see the same event dedupe on the event id.

The subscription is the server's public stream, and a global install can load once per location. Filtering is what keeps that from becoming one Notification per open project. Dropping an unscoped event misses a wake; broadcasting it multiplies one. Missing is the failure we chose. Occurrence-level dedupe is a second guard; it lives on `globalThis` (see ADR 0011), not `ctx.storage`.
