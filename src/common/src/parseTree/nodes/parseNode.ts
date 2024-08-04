import type {ReferenceNode} from "./referenceNode";

/**
 * Basis for an N-ary parse tree with basic information about a node's
 * id, type, description and value.
 */
export type ParseNode = {
    id: string
    type: NodeType
    value: number
    input?: ParseNode
    left?: ParseNode | ReferenceNode
    right?: ParseNode | ReferenceNode
    child?: ParseNode | ReferenceNode
    inputs?: (ReferenceNode | ParseNode)[]
}


export function isParseNode(node: any): node is ParseNode {
    return (
        typeof node.id === 'string' &&
        typeof node.type === 'string' &&
        (node.left === undefined || typeof node.left === 'object') &&
        (node.right === undefined || typeof node.right === 'object') &&
        (node.child === undefined || typeof node.child === 'object') &&
        (node.inputs === undefined || Array.isArray(node.inputs))
    );
}

export function isBinaryNode(node: ParseNode) : boolean {
    return [
        NodeType.Sqrt,
        NodeType.Add,
        NodeType.Sub,
        NodeType.Pow,
        NodeType.Div,
        NodeType.Mul
    ].includes(node.type);
}

export function isNaryNode(node: ParseNode) : boolean {
    return [
        NodeType.Sum,
        NodeType.Prod,
        NodeType.Min,
        NodeType.Max
    ].includes(node.type);
}

export function isUnaryNode(node: ParseNode) : boolean {
    return [
        NodeType.Exp,
        NodeType.Floor,
        NodeType.Ceil,
        NodeType.Round
    ].includes(node.type);
}

export enum NodeType {
    Reference = "Reference",
    Root = "Root",
    PieDisplay = "PieDisplay",
    GraphDisplay = "GraphDisplay",
    BarDisplay = "BarDisplay",
    PreviewDisplay = "PreviewDisplay",
    ListDisplay = "ListDisplay",
    NumberInput = "NumberInput",
    DropdownInput = "DropdownInput",
    Output = "Output",
    Number = "Number",
    Add = "Add",
    Sub = "Sub",
    Mul = "Mul",
    Pow = "Pow",
    Sum = "Sum",
    Prod = "Prod",
    Div = "Div",
    Min = "Min",
    Max = "Max",
    Sqrt = "Sqrt",
    Choose = "Choose",
    Module = "Module",
    ModuleOutput = "ModuleOutput",
    ModuleInput = "ModuleInput",
    Exp = "Exp",
    Ceil = "Ceil",
    Floor = "Floor",
    Round = "Round",
    Comment = "Commment"
}
