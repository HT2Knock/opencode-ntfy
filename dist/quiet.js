const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/u;
export function parseClock(value) {
    const match = CLOCK.exec(value);
    if (!match)
        return undefined;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    return hours * 60 + minutes;
}
export function validTimezone(timezone) {
    try {
        new Intl.DateTimeFormat("en-GB", { timeZone: timezone }).format(0);
        return true;
    }
    catch {
        return false;
    }
}
function minutesInWindow(window, at) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: window.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(at);
    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
    return hour * 60 + minute;
}
export function isQuiet(window, at) {
    const from = parseClock(window.from);
    const to = parseClock(window.to);
    if (from === undefined || to === undefined)
        return false;
    if (from === to)
        return false;
    const now = minutesInWindow(window, at);
    if (from < to)
        return now >= from && now < to;
    return now >= from || now < to;
}
//# sourceMappingURL=quiet.js.map