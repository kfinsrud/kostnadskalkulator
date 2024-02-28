import type {ParseNode} from "./parseNode";
import {NodeType} from "./nodeMeta/node";

export interface ReferenceNode extends ParseNode {
    referenceID: string
}

export function isReferenceNode(node: ParseNode) : node is ReferenceNode {
    return node.type === NodeType.Reference;
}