import { Effect } from "effect";
import type { Settings } from "./config.js";
import type { Decision, Milestone, SessionFacts } from "./domain.js";
import type { Gate } from "./gate.js";
import type { Holds } from "./hold.js";
export type MilestoneDecision = Extract<Decision, {
    kind: "idle" | "fault" | "permission" | "question";
}>;
export declare function sendMilestone(settings: Settings, milestone: Milestone, facts: SessionFacts): Effect.Effect<void>;
export declare function handleMilestone(settings: Settings, gate: Gate, holds: Holds, decision: MilestoneDecision, facts: SessionFacts): Effect.Effect<void>;
