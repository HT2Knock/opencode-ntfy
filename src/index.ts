import { Plugin } from "@opencode/plugin/effect";
import { Effect, Schedule, Stream } from "effect";

import { loadSettings } from "./config.js";
import type { IncomingEvent } from "./domain.js";
import { Gate } from "./gate.js";
import { createHandler } from "./handler.js";
import { Holds } from "./hold.js";
import { registerTool } from "./tool.js";

const EVENT_TYPES = [
  "session.execution.started",
  "session.execution.succeeded",
  "session.execution.failed",
  "session.idle",
  "permission.asked",
  "permission.replied",
  "form.created",
  "form.replied",
  "form.cancelled",
] as const;

export default Plugin.define({
  id: "ht2knock.ntfy",
  effect: (ctx) =>
    Effect.gen(function* () {
      const loaded = loadSettings();
      if (!loaded.ok) {
        yield* Effect.logWarning(`ntfy: disabled: ${loaded.reason}`);
        return;
      }

      const holds = new Holds();
      yield* Effect.addFinalizer(() => Effect.sync(() => holds.clear()));

      const handle = createHandler(ctx, loaded.settings, { gate: new Gate(), holds });
      yield* registerTool(ctx, loaded.settings);

      const subscription = ctx.event.subscribe({ types: EVENT_TYPES }).pipe(
        Stream.runForEach((event) => handle(event as IncomingEvent)),
        Effect.retry(Schedule.exponential("1 second")),
        Effect.catchCause((cause) =>
          Effect.logWarning(`ntfy: subscription stopped: ${String(cause)}`),
        ),
      );
      yield* Effect.forkScoped(subscription);

      yield* Effect.logInfo(`ntfy: ready for topic ${loaded.settings.topic}`);
    }),
});
