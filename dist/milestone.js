import { Effect } from "effect";
import { deliver } from "./deliver.js";
import { buildPush } from "./message.js";
import { isQuiet } from "./quiet.js";
const IDLE_HOLD_MS = 2_000;
export function sendMilestone(settings, milestone, facts) {
    return Effect.gen(function* () {
        if (settings.quiet && isQuiet(settings.quiet, new Date())) {
            yield* Effect.logInfo(`ntfy: ${milestone} held by quiet hours`);
            return;
        }
        const push = buildPush(milestone, facts, settings.click);
        yield* deliver({ server: settings.server, topic: settings.topic, token: settings.token }, push).pipe(Effect.catchCause((error) => Effect.logWarning(`ntfy: ${milestone} not sent: ${String(error)}`)));
    });
}
function holdKey(decision) {
    if (decision.kind === "permission")
        return `permission:${decision.requestID}`;
    if (decision.kind === "question")
        return `question:${decision.id}`;
    return `idle:${decision.sessionID}`;
}
function stillOpen(gate, decision) {
    if (decision.kind === "permission") {
        return gate.hasPermission(decision.sessionID, decision.requestID);
    }
    if (decision.kind === "question")
        return gate.hasQuestion(decision.sessionID, decision.id);
    return true;
}
function holdDelay(settings, decision) {
    return decision.kind === "idle" ? IDLE_HOLD_MS : settings.holdMs;
}
export function handleMilestone(settings, gate, holds, decision, facts) {
    return Effect.gen(function* () {
        if (decision.kind === "fault") {
            holds.cancel(`idle:${decision.sessionID}`);
            yield* sendMilestone(settings, decision.kind, facts);
            return;
        }
        if (decision.kind === "idle") {
            if (gate.onIdle(decision.sessionID, facts.root) !== "schedule")
                return;
        }
        else if (decision.kind === "permission") {
            if (gate.onPermission(decision.sessionID, decision.requestID) !== "notify")
                return;
        }
        else if (gate.onQuestion(decision.sessionID, decision.id) !== "notify") {
            return;
        }
        holds.cancel(`idle:${decision.sessionID}`);
        holds.schedule(holdKey(decision), holdDelay(settings, decision), () => {
            if (!stillOpen(gate, decision))
                return;
            Effect.runFork(sendMilestone(settings, decision.kind, facts));
        });
    });
}
//# sourceMappingURL=milestone.js.map