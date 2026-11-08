import { Effect, Result, Schema } from "effect";
import { deliver } from "./deliver.js";
const DELAY = /^(\d+[smhd]|\d{10})$/u;
const NotifyInput = Schema.Struct({
    message: Schema.NonEmptyString,
    title: Schema.optional(Schema.String),
    priority: Schema.optional(Schema.Int),
    delay: Schema.optional(Schema.String),
    channel: Schema.optional(Schema.Literals(["needs-you", "routine"])),
});
const NotifyOutput = Schema.Struct({
    sent: Schema.Boolean,
    topic: Schema.String,
    detail: Schema.optional(Schema.String),
});
export function registerTool(ctx, settings) {
    return ctx.tool.transform((editor) => {
        editor.namespace({
            name: "ntfy",
            description: "Push notifications to the user's phone through ntfy",
        });
        editor.add({
            name: "notify",
            description: "Send a push notification to the user's phone. Use it when the user asked to be told about something, or to schedule a reminder with a delay.",
            input: NotifyInput,
            output: NotifyOutput,
            execute: (input) => Effect.gen(function* () {
                const channel = input.channel ?? "needs-you";
                const topic = channel === "routine" ? (settings.routineTopic ?? settings.topic) : settings.topic;
                const priority = input.priority ?? 4;
                if (!Number.isInteger(priority) || priority < 1 || priority > 5) {
                    return { output: { sent: false, topic, detail: "priority must be 1 to 5" } };
                }
                if (input.delay !== undefined && !DELAY.test(input.delay)) {
                    return { output: { sent: false, topic, detail: "delay must look like 30m, 2h or 1d" } };
                }
                const push = {
                    title: input.title ?? "OpenCode",
                    message: input.message,
                    priority,
                    tags: ["bell"],
                    click: settings.click,
                    delay: input.delay,
                };
                const result = yield* deliver({ server: settings.server, topic, token: settings.token }, push).pipe(Effect.result);
                if (Result.isSuccess(result))
                    return { output: { sent: true, topic } };
                return { output: { sent: false, topic, detail: result.failure.message } };
            }),
        });
    });
}
//# sourceMappingURL=tool.js.map