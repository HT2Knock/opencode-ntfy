import type { Session } from "@opencode/schema/session";
import { Effect } from "effect";

import type { Context } from "./context.js";
import type { SessionFacts } from "./domain.js";

export function sessionFacts(ctx: Context, sessionID: string): Effect.Effect<SessionFacts | null> {
  return ctx.session.get({ sessionID: sessionID as Session.ID }).pipe(
    Effect.map((session) => ({
      sessionID,
      title: session.title,
      directory: session.location.directory,
      root: session.parentID === undefined || session.parentID === "",
    })),
    Effect.catchCause(() => Effect.succeed(null)),
  );
}
