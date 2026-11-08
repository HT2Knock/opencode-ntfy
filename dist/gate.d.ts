import type { GateDecision } from "./domain.js";
export declare class Gate {
    #private;
    onStarted(sessionID: string): void;
    onIdle(sessionID: string, root: boolean): GateDecision;
    onFault(sessionID: string, root: boolean): GateDecision;
    onPermission(sessionID: string, requestID: string): GateDecision;
    onQuestion(sessionID: string, id: string): GateDecision;
    clearPermission(sessionID: string, requestID: string): void;
    clearQuestion(sessionID: string, id: string): void;
    hasBlock(sessionID: string): boolean;
    hasPermission(sessionID: string, requestID: string): boolean;
    hasQuestion(sessionID: string, id: string): boolean;
}
