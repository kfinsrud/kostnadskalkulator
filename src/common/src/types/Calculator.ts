import {ParseNode} from "../parseTree";

/**
 * Database and API structure for a calculator
 */
export interface Calculator {
    name: string,
    version: number,
    dateCreated: number,
    published: boolean,
    disabled: boolean,
    deleted: boolean,
    reteSchema?: {
        store: any,
        graph: any
    },           // required when saving, optional when fetching
    treeNodes?: ParseNode[],    // required when saving, optional when fetching
}