import {ParseNode} from "../parseTree";
import {StoreState} from "admin-client/src/state/store";
import {EditorDataPackage} from "admin-client/src/rete/editor";

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
        store: StoreState,
        graph: EditorDataPackage
    },           // required when saving, optional when fetching
    treeNodes?: ParseNode[],    // required when saving, optional when fetching
}