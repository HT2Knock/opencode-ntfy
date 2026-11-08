const TITLE_LIMIT = 180;
const LABELS = {
    permission: "Permission",
    question: "Question",
    fault: "Fault",
    idle: "Idle",
};
const PRIORITIES = {
    permission: 4,
    question: 4,
    fault: 4,
    idle: 3,
};
const TAGS = {
    permission: ["lock"],
    question: ["question"],
    fault: ["warning"],
    idle: ["white_check_mark"],
};
export function projectName(directory) {
    const trimmed = directory.replace(/[/\\]+$/u, "");
    const slash = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
    const base = slash >= 0 ? trimmed.slice(slash + 1) : trimmed;
    return base.length > 0 ? base : "project";
}
function shortTitle(title) {
    const trimmed = title?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : "Untitled";
}
function clampTitle(title) {
    return title.length > TITLE_LIMIT ? `${title.slice(0, TITLE_LIMIT - 1)}…` : title;
}
export function buildPush(milestone, session, click) {
    return {
        title: clampTitle(`${LABELS[milestone]} · ${shortTitle(session.title)}`),
        message: projectName(session.directory),
        priority: PRIORITIES[milestone],
        tags: TAGS[milestone],
        click,
        delay: undefined,
    };
}
//# sourceMappingURL=message.js.map