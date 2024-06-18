
export enum NodeActionType {
    UpdateRender = "UPDATE_RENDER",
    RecalculateGraph = "RECALCULATE_GRAPH",
    Disconnect = "DISCONNECT",
    StateChange = "STATE_CHANGE"
}


export function objectToPayload(object: Record<string, any>) : { key: string, value: any }[] {
    const keyValuePairs = [];
    const keys = Object.keys(object);
    for(const key of keys) {
        keyValuePairs.push({key: key, value: object[key]})
    }
    return keyValuePairs;
}

export type NodeAction =
    {nodeID: string, type: NodeActionType.Disconnect, payload?: { input?: string, output?: string}} |
    {nodeID: string, type: NodeActionType.UpdateRender } |
    {nodeID: string, type: NodeActionType.RecalculateGraph } |
    {nodeID: string, type: NodeActionType.StateChange, payload: { key: string, value: any }[] }