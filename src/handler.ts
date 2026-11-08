import { Effect } from "effect";

import { claim } from "./claim.js";
import type { Settings } from "./config.js";
import type { Context } from "./context.js";
import type { IncomingEvent } from "./domain.js";
import { classify, eventDirectory, eventID } from "./event.js";
import type { Gate } from "./gate.js";
import type { Holds } from "./hold.js";
import { handleMilestone } from "./milestone.js";
import { sessionFacts } from "./session.js";

export type HandlerState = {
  readonly gate: Gate;
  readonly holds: Holds;
};

function sameDirectory(left: string, right: string): boolean {
  return left.replace(/[/\\]+$/u, "") === right.replace(/[/\\]+$/u, "");
}

export function createHandler(ctx: Context, settings: Settings, state: HandlerState) {
  return (event: IncomingEvent): Effect.Effect<void> =>
    Effect.gen(function* () {
      const id = eventID(event);
      if (!id) return;
      if (!(yield* claim(ctx, id))) return;

      const decision = classify(event);
      if (decision.kind === "ignore") return;

      if (decision.kind === "started") {
        state.gate.onStarted(decision.sessionID);
        return;
      }
      if (decision.kind === "clear-permission") {
        state.gate.clearPermission(decision.sessionID, decision.requestID);
        state.holds.cancel(`permission:${decision.requestID}`);
        return;
      }
      if (decision.kind === "clear-question") {
        state.gate.clearQuestion(decision.sessionID, decision.id);
        state.holds.cancel(`question:${decision.id}`);
        return;
      }

      const eventDir = eventDirectory(event);
      if (eventDir && !sameDirectory(ctx.location.directory, eventDir)) return;

      const facts = yield* sessionFacts(ctx, decision.sessionID);
      if (!facts) return;
      if (!sameDirectory(ctx.location.directory, facts.directory)) return;
      if (!settings.milestones.has(decision.kind)) return;

      yield* handleMilestone(settings, state.gate, state.holds, decision, facts);
    }).pipe(
      Effect.catchCause((cause) => Effect.logWarning(`ntfy: handler failed: ${String(cause)}`)),
    );
}
