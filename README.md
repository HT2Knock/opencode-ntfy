# opencode-ntfy

OpenCode V2 server plugin. It sends an ntfy push to your phone when a session
needs you.

## Behavior

| Event                                                  | Push                                 |
| ------------------------------------------------------ | ------------------------------------ |
| `permission.asked`                                     | after the hold window, if still open |
| `form.created`                                         | after the hold window, if still open |
| `session.execution.failed`                             | at once                              |
| `session.execution.succeeded`                          | off by default                       |
| `permission.replied`, `form.replied`, `form.cancelled` | cancels a held push                  |
| quiet hours                                            | suppresses every event push          |
| `ntfy_notify` tool                                     | at once, or with a delay             |

The hold window defaults to 60 seconds. If you answer at the desk, no push is
sent. If you are away, the hold expires and the phone rings.

Notification text carries the milestone, the session title, and the project
directory name. Prompt text, tool output, paths, and error stacks are never sent.

## Install

```sh
opencode plugin add github:HT2Knock/opencode-ntfy#<commit>
```

The package is also a normal plugin entry:

```jsonc
{
  "plugins": ["@ht2knock/opencode-ntfy"],
}
```

## Config

Create `~/.config/opencode/ntfy.json` with mode 600:

```json
{
  "server": "https://ntfy.example.com:8443",
  "topic": "lab",
  "routineTopic": "routine",
  "token": "tk_...",
  "holdMs": 60000,
  "quiet": { "from": "22:30", "to": "06:00", "timezone": "Asia/Ho_Chi_Minh" },
  "click": "https://opencode.example.com/"
}
```

| Key            | Required | Default                             |
| -------------- | -------- | ----------------------------------- |
| `server`       | yes      | none                                |
| `topic`        | yes      | none                                |
| `token`        | yes      | none                                |
| `routineTopic` | no       | `topic`                             |
| `holdMs`       | no       | `60000`                             |
| `milestones`   | no       | `["permission","question","fault"]` |
| `quiet`        | no       | off                                 |
| `click`        | no       | none                                |

Any string may use `{env:NAME}`. A missing variable disables the plugin with a
warning.

A missing or invalid file disables the plugin. It never fails a session.

## Tool

The plugin registers the `notify` tool:

```json
{
  "message": "Stand up and stretch",
  "title": "Reminder",
  "priority": 4,
  "delay": "2h",
  "channel": "needs-you"
}
```

`delay` accepts `30s`, `10m`, `2h`, or `1d`. `channel` is `needs-you` or
`routine`. A failed send returns `{ "sent": false }` with a reason; it does not
fail the turn.

## Develop

```sh
bun install
bun run check   # format, lint, typecheck, test
bun run build
```

`effect` and `@opencode/plugin` are peer dependencies. The host supplies them at
runtime. Never bundle them.

## Credit

Port of [`ntfy-opencode`](https://www.npmjs.com/package/ntfy-opencode) by Alex
Haines. See `NOTICE`.
