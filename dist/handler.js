import { Effect } from "effect";
import { claim } from "./claim.js";
import { classify, eventDirectory, eventID } from "./event.js";
import { handleMilestone } from "./milestone.js";
import { sessionFacts } from "./session.js";
function sameDirectory(left, right) {
    return left.replace(/[/\\]+$/u, "") === right.replace(/[/\\]+$/u, "");
}
export function createHandler(ctx, settings, state) {
    return (event) => Effect.gen(function* () {
        const id = eventID(event);
        if (!id)
            return;
        if (!(yield* claim(ctx, id)))
            return;
        const decision = classify(event);
        if (decision.kind === "ignore")
            return;
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
        if (eventDir && !sameDirectory(ctx.location.directory, eventDir))
            return;
        const facts = yield* sessionFacts(ctx, decision.sessionID);
        if (!facts)
            return;
        if (!sameDirectory(ctx.location.directory, facts.directory))
            return;
        if (!settings.milestones.has(decision.kind))
            return;
        yield* handleMilestone(settings, state.gate, state.holds, decision, facts);
    }).pipe(Effect.catchCause((cause) => Effect.logWarning(`ntfy: handler failed: ${String(cause)}`)));
}
//# sourceMappingURL=handler.js.map