function record(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value))
        return undefined;
    return value;
}
function text(source, key) {
    const value = source?.[key];
    return typeof value === "string" && value.length > 0 ? value : undefined;
}
function permissionDecision(sessionID, data, fallbackID) {
    if (!sessionID)
        return { kind: "ignore" };
    const requestID = text(data, "id") ?? fallbackID;
    if (!requestID)
        return { kind: "ignore" };
    if (text(data, "action") === "question")
        return { kind: "question", sessionID, id: requestID };
    return { kind: "permission", sessionID, requestID };
}
function formDecision(data) {
    const form = record(data?.form);
    const sessionID = text(form, "sessionID");
    const id = text(form, "id");
    if (!sessionID || !id)
        return { kind: "ignore" };
    return { kind: "question", sessionID, id };
}
function replyDecision(sessionID, data, permission) {
    const id = text(data, permission ? "requestID" : "id");
    if (!sessionID || !id)
        return { kind: "ignore" };
    return permission
        ? { kind: "clear-permission", sessionID, requestID: id }
        : { kind: "clear-question", sessionID, id };
}
export function eventID(event) {
    return typeof event.id === "string" && event.id.length > 0 ? event.id : undefined;
}
export function eventDirectory(event) {
    const directory = event.location?.directory;
    return typeof directory === "string" && directory.length > 0 ? directory : undefined;
}
export function classify(event) {
    if (typeof event.type !== "string")
        return { kind: "ignore" };
    const data = record(event.data);
    const sessionID = text(data, "sessionID");
    switch (event.type) {
        case "session.execution.started":
            return sessionID ? { kind: "started", sessionID } : { kind: "ignore" };
        case "session.idle":
        case "session.execution.succeeded":
            return sessionID ? { kind: "idle", sessionID } : { kind: "ignore" };
        case "session.execution.failed":
            return sessionID ? { kind: "fault", sessionID } : { kind: "ignore" };
        case "permission.asked":
            return permissionDecision(sessionID, data, eventID(event));
        case "form.created":
            return formDecision(data);
        case "permission.replied":
            return replyDecision(sessionID, data, true);
        case "form.replied":
        case "form.cancelled":
            return replyDecision(sessionID, data, false);
        default:
            return { kind: "ignore" };
    }
}
//# sourceMappingURL=event.js.map