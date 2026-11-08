import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { Schema } from "effect";

import type { Milestone } from "./domain.js";
import { parseClock, validTimezone, type QuietWindow } from "./quiet.js";

export type Settings = {
  readonly server: URL;
  readonly topic: string;
  readonly routineTopic: string | undefined;
  readonly token: string;
  readonly holdMs: number;
  readonly milestones: ReadonlySet<Milestone>;
  readonly quiet: QuietWindow | undefined;
  readonly click: string | undefined;
};

export type LoadResult =
  | { readonly ok: true; readonly settings: Settings }
  | { readonly ok: false; readonly reason: string };

const DEFAULT_HOLD_MS = 60_000;
const DEFAULT_MILESTONES: ReadonlyArray<Milestone> = ["permission", "question", "fault"];
const ENV_REF = /^\{env:([A-Za-z_][A-Za-z0-9_]*)\}$/u;

const QuietSchema = Schema.Struct({
  from: Schema.String,
  to: Schema.String,
  timezone: Schema.String,
});

const RawSchema = Schema.Struct({
  server: Schema.String,
  topic: Schema.String,
  routineTopic: Schema.optional(Schema.String),
  token: Schema.String,
  holdMs: Schema.optional(Schema.Number),
  milestones: Schema.optional(
    Schema.Array(Schema.Literals(["permission", "question", "fault", "idle"])),
  ),
  quiet: Schema.optional(Schema.Union([Schema.Literal(false), QuietSchema])),
  click: Schema.optional(Schema.String),
});

type Raw = Schema.Schema.Type<typeof RawSchema>;

function substitute(value: unknown, env: NodeJS.ProcessEnv): unknown {
  if (typeof value === "string") {
    const match = ENV_REF.exec(value);
    if (!match) return value;
    const name = match[1] ?? "";
    const resolved = env[name];
    if (!resolved) throw new Error(`missing environment variable ${name}`);
    return resolved;
  }
  if (Array.isArray(value)) return value.map((entry) => substitute(entry, env));
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, substitute(entry, env)]),
    );
  }
  return value;
}

function urlProblem(raw: string, protocols: readonly string[]): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return `not a URL: ${raw}`;
  }
  return protocols.includes(parsed.protocol)
    ? undefined
    : `unsupported protocol: ${parsed.protocol}`;
}

function topicProblem(topic: string): string | undefined {
  if (topic.length === 0) return "is empty";
  if (topic.includes("/")) return "must be one path segment";
  if (/\s/u.test(topic)) return "must not contain whitespace";
  return undefined;
}

function targetProblem(raw: Raw): string | undefined {
  const server = urlProblem(raw.server, ["http:", "https:"]);
  if (server) return `server: ${server}`;
  const topic = topicProblem(raw.topic);
  if (topic) return `topic: ${topic}`;
  const routine = raw.routineTopic === undefined ? undefined : topicProblem(raw.routineTopic);
  if (routine) return `routineTopic: ${routine}`;
  if (raw.token.length === 0) return "token is empty";
  if (raw.click !== undefined) {
    const click = urlProblem(raw.click, ["http:", "https:"]);
    if (click) return `click: ${click}`;
  }
  return undefined;
}

function holdProblem(raw: Raw): string | undefined {
  const holdMs = raw.holdMs ?? DEFAULT_HOLD_MS;
  if (!Number.isInteger(holdMs) || holdMs < 0) return "holdMs must be a whole number";
  return undefined;
}

function quietProblem(raw: Raw): string | undefined {
  if (raw.quiet === undefined || raw.quiet === false) return undefined;
  if (parseClock(raw.quiet.from) === undefined) return "quiet.from is not HH:mm";
  if (parseClock(raw.quiet.to) === undefined) return "quiet.to is not HH:mm";
  if (!validTimezone(raw.quiet.timezone)) return `quiet.timezone is not a time zone`;
  return undefined;
}

function milestoneProblem(raw: Raw): string | undefined {
  if (raw.milestones !== undefined && raw.milestones.length === 0) return "no milestones enabled";
  return undefined;
}

function build(raw: Raw): Settings {
  const quiet = raw.quiet === undefined || raw.quiet === false ? undefined : raw.quiet;
  return {
    server: new URL(raw.server),
    topic: raw.topic,
    routineTopic: raw.routineTopic,
    token: raw.token,
    holdMs: raw.holdMs ?? DEFAULT_HOLD_MS,
    milestones: new Set(raw.milestones ?? DEFAULT_MILESTONES),
    quiet,
    click: raw.click,
  };
}

export function resolveSettings(input: unknown, env: NodeJS.ProcessEnv = process.env): LoadResult {
  let raw: Raw;
  try {
    raw = Schema.decodeUnknownSync(RawSchema)(substitute(input, env));
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "config did not decode" };
  }

  const problem =
    targetProblem(raw) ?? holdProblem(raw) ?? quietProblem(raw) ?? milestoneProblem(raw);
  if (problem) return { ok: false, reason: problem };
  return { ok: true, settings: build(raw) };
}

export function configPath(env: NodeJS.ProcessEnv = process.env): string {
  const base = env.XDG_CONFIG_HOME ?? join(homedir(), ".config");
  return join(base, "opencode", "ntfy.json");
}

export function loadSettings(
  deps: {
    readonly env?: NodeJS.ProcessEnv;
    readonly readFile?: (path: string) => string;
  } = {},
): LoadResult {
  const env = deps.env ?? process.env;
  const path = configPath(env);
  const read = deps.readFile ?? ((target: string) => readFileSync(target, "utf8"));
  let text: string;
  try {
    text = read(path);
  } catch {
    return { ok: false, reason: `cannot read ${path}` };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: `${path} is not valid JSON` };
  }
  return resolveSettings(parsed, env);
}
