import type { Push } from "./deliver.js";
import type { Milestone } from "./domain.js";

const TITLE_LIMIT = 180;

const LABELS: Record<Milestone, string> = {
  permission: "Permission",
  question: "Question",
  fault: "Fault",
  idle: "Idle",
};

const PRIORITIES: Record<Milestone, number> = {
  permission: 4,
  question: 4,
  fault: 4,
  idle: 3,
};

const TAGS: Record<Milestone, ReadonlyArray<string>> = {
  permission: ["lock"],
  question: ["question"],
  fault: ["warning"],
  idle: ["white_check_mark"],
};

export function projectName(directory: string): string {
  const trimmed = directory.replace(/[/\\]+$/u, "");
  const slash = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
  const base = slash >= 0 ? trimmed.slice(slash + 1) : trimmed;
  return base.length > 0 ? base : "project";
}

function shortTitle(title: string | undefined): string {
  const trimmed = title?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Untitled";
}

function clampTitle(title: string): string {
  return title.length > TITLE_LIMIT ? `${title.slice(0, TITLE_LIMIT - 1)}…` : title;
}

export function buildPush(
  milestone: Milestone,
  session: { readonly title: string | undefined; readonly directory: string },
  click?: string,
): Push {
  return {
    title: clampTitle(`${LABELS[milestone]} · ${shortTitle(session.title)}`),
    message: projectName(session.directory),
    priority: PRIORITIES[milestone],
    tags: TAGS[milestone],
    click,
    delay: undefined,
  };
}
