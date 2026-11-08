export type Milestone = "permission" | "question" | "fault" | "idle";

export type IncomingEvent = {
  readonly type: string;
  readonly id?: string;
  readonly data?: unknown;
  readonly location?: { readonly directory?: string };
};

export type Decision =
  | { readonly kind: "ignore" }
  | { readonly kind: "started"; readonly sessionID: string }
  | { readonly kind: "clear-permission"; readonly sessionID: string; readonly requestID: string }
  | { readonly kind: "clear-question"; readonly sessionID: string; readonly id: string }
  | { readonly kind: "idle"; readonly sessionID: string }
  | { readonly kind: "fault"; readonly sessionID: string }
  | { readonly kind: "permission"; readonly sessionID: string; readonly requestID: string }
  | { readonly kind: "question"; readonly sessionID: string; readonly id: string };

export type GateDecision = "schedule" | "drop" | "notify";

export type SessionFacts = {
  readonly sessionID: string;
  readonly title: string | undefined;
  readonly directory: string;
  readonly root: boolean;
};
