import { Effect, Schedule } from "effect";

export type Push = {
  readonly title: string;
  readonly message: string;
  readonly priority: number;
  readonly tags: ReadonlyArray<string> | undefined;
  readonly click: string | undefined;
  readonly delay: string | undefined;
};

export type Target = {
  readonly server: URL;
  readonly topic: string;
  readonly token: string;
};

export type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export class DeliveryFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeliveryFailure";
  }
}

export function publishUrl(server: URL): string {
  const url = new URL(server.toString());
  url.pathname = `${url.pathname.replace(/\/+$/u, "")}/`;
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function requestBody(topic: string, push: Push): Record<string, unknown> {
  const body: Record<string, unknown> = {
    topic,
    title: push.title,
    message: push.message,
    priority: push.priority,
  };
  if (push.tags && push.tags.length > 0) body.tags = push.tags;
  if (push.click !== undefined) body.click = push.click;
  if (push.delay !== undefined) body.delay = push.delay;
  return body;
}

export function deliver(
  target: Target,
  push: Push,
  fetchImpl: FetchLike = fetch,
): Effect.Effect<void, DeliveryFailure> {
  const attempt = Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: (signal) =>
        fetchImpl(publishUrl(target.server), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${target.token}`,
          },
          body: JSON.stringify(requestBody(target.topic, push)),
          signal,
        }),
      catch: (cause) => new DeliveryFailure(`request failed: ${String(cause)}`),
    }).pipe(
      Effect.timeout("5 seconds"),
      Effect.mapError((error) =>
        error instanceof DeliveryFailure ? error : new DeliveryFailure("request timed out"),
      ),
    );

    if (!response.ok) {
      return yield* Effect.fail(new DeliveryFailure(`ntfy returned HTTP ${response.status}`));
    }
  });

  return Effect.retry(attempt, Schedule.recurs(1));
}
