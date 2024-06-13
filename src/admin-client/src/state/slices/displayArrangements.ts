import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {DisplayArrangement} from "@skogkalk/common/dist/src/parseTree/nodes/displayNode";
import {DisplayNode, NodeType} from "@skogkalk/common/dist/src/parseTree";

export interface DisplayArrangementsState {
    [id: string]: Arrangements
}
interface Arrangements {
    xs: DisplayArrangement
    md: DisplayArrangement
    lg: DisplayArrangement
}


export const displayArrangementsSlice = createSlice({
    name: 'displayArrangements',
    initialState: {} as DisplayArrangementsState,
    reducers: {
        setDisplayState(state, action:PayloadAction<DisplayArrangementsState>) {

            return action.payload;
        },
        moveDisplay: (_state, action: PayloadAction<{id: string, size: "xs" | "md" | "lg", direction: "forward" | "backward", nodes: DisplayNode[]}>) => {
            const {id, size, direction, nodes} = action.payload
            let arrangements = extractDisplayArrangements(nodes)
            let ids = sortIDsByOrder(size, arrangements)
            ids = shiftID(ids, id, direction)
            return setArrangeOrderByIndex(arrangements, ids, size)
        },
        changeSpan: (_state, action: PayloadAction<{id: string, size: "xs" | "md" | "lg", widthMultiplier: number, direction: "increase" | "decrease", nodes: DisplayNode[]}>) => {
            const {id, size, widthMultiplier, direction, nodes} = action.payload
            let arrangements = extractDisplayArrangements(nodes)
            return {...arrangements, [id]: adjustWidth(arrangements[id], size, widthMultiplier, direction)}
        }
    }
});


function extractDisplayArrangements(nodes: DisplayNode[]): DisplayArrangementsState {
    return nodes
        .filter(node => node.type !== NodeType.PreviewDisplay)
        .reduce((acc, node) => {
        acc[node.id] = node.arrangement
        return acc
    }, {} as DisplayArrangementsState)
}

function sortIDsByOrder(size: "xs" | "md" | "lg", arrangements: DisplayArrangementsState): string[] {
    return Object.keys(arrangements)
        .sort((a, b) => {
            return arrangements[a][size].order - arrangements[b][size].order
        })
}


function shiftID(arr: string[], id: string, direction: "forward" | "backward") {
    const index = arr.indexOf(id)
    if (index === -1) return arr
    let newIndex = index + (direction === 'forward' ? 1 : -1)
    if (newIndex < 0 || newIndex >= arr.length) return arr
    let result = [...arr]
    result[index] = result[newIndex]
    result[newIndex] = id
    return result;
}


function setArrangeOrderByIndex(arrangements: DisplayArrangementsState, ids: string[], size: "xs" | "md" | "lg") {
    return ids.reduce((acc, id, index) => {
        const currentArrangement = acc[id];
        const updatedArrangement = {...currentArrangement, [size]: {...currentArrangement[size], order: index}}
        return {...acc, [id]: updatedArrangement}
    }, {...arrangements})
}

function adjustWidth(arrangements: Arrangements, size: "xs" | "md" | "lg", widthMultiplier: number, direction: "increase" | "decrease") {
    const newSpan = arrangements[size].span + (direction === "increase" ? widthMultiplier : -widthMultiplier)
    if (newSpan < widthMultiplier || newSpan > 12) return arrangements
    return {...arrangements, [size]: {...arrangements[size], span: newSpan}}
}

export const {
    setDisplayState,
    moveDisplay,
    changeSpan
} = displayArrangementsSlice.actions;
export const displayArrangementsReducer = displayArrangementsSlice.reducer;
