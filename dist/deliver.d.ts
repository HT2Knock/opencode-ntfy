import { Effect } from "effect";
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
export declare class DeliveryFailure extends Error {
    constructor(message: string);
}
export declare function publishUrl(server: URL): string;
export declare function requestBody(topic: string, push: Push): Record<string, unknown>;
export declare function deliver(target: Target, push: Push, fetchImpl?: FetchLike): Effect.Effect<void, DeliveryFailure>;
