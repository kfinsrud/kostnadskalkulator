import type {ParseNode} from "./parseNode";
import type {OutputNode} from "./outputNode";
import type {ReferenceNode} from "./referenceNode";
import {NodeType} from "./parseNode";


export interface DisplayNode extends ParseNode {
    name: string
    inputs: (OutputNode | ReferenceNode)[]
    inputOrdering: {
        outputID: string,
        outputLabel: string,
        ordering?: number
    }[]
    arrangement: {
        xs: DisplayArrangement,
        md: DisplayArrangement,
        lg: DisplayArrangement,
    }
    decimalPlaces?: number
    infoText?: string
}

export interface DisplayArrangement {
    order: number
    span: number
}

export function isDisplayNode (node: ParseNode) : node is DisplayNode {
    return [NodeType.Display, NodeType.BarDisplay, NodeType.PreviewDisplay, NodeType.ListDisplay, NodeType.GraphDisplay].includes(node.type)
}


export interface DisplayPieNode extends DisplayNode {
    unit: string
    pieType: "pie" | "donut"
}

export interface DisplayBarNode extends DisplayNode {
    unit: string
    max: number
}

export interface DisplayPreviewNode extends DisplayNode {
    unit: string
}

export interface DisplayListNode extends DisplayNode {
    unit: string
}



export interface ResultGroup {
    id: string,
    name: string,
    inputIDs: string[],
    unit: string,
}

export interface GraphDisplayNode extends DisplayNode {
    unit: string
    resultGroups: ResultGroup[]
    displayedInputIDs: string[]
}

