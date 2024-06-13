import {Calculator} from "@skogkalk/common/dist/src/types/Calculator";
import {createSelector} from "@reduxjs/toolkit";
import {RootState} from "./store";
import {RootNode} from "@skogkalk/common/dist/src/parseTree/nodes/rootNode";
import {NodeType, ParseNode} from "@skogkalk/common/dist/src/parseTree";
import {EditorDataPackage} from "../rete/editor";

export const selectCalculator = (rete: {graph: EditorDataPackage, parseNodes: ParseNode[]} | undefined) => createSelector(
    (state: RootState) => state,
    (state) => {
        const rootNode = selectRootNode(state)
        return {
            name: state.formulaInfo.name,
            version: rootNode.version,
            dateCreated: state.formulaInfo.dateCreated,
            published: false,
            deleted: false,
            disabled: false,
            reteSchema: {
                store: {
                    formulaInfo: state.formulaInfo,
                    pages: state.pages,
                    treeState: state.treeState,
                    units: state.units,
                    displayArrangements: state.displayArrangements
                },
                graph: rete?.graph ?? {}
            },
            treeNodes: [rootNode, ...(rete?.parseNodes ?? [])]
        } as Calculator
    }
)


export const selectRootNode = createSelector(
    (state: RootState) => state,
    (state) => {
        return  {
            id: "0",
            type: NodeType.Root,
            value: 0,
            formulaName: state.formulaInfo.name,
            version: (
                state.formulaInfo.version.major * 1000000
                + state.formulaInfo.version.minor * 1000
                + state.formulaInfo.version.patch
            ),
            pages: state.pages.pages.map(({page}, index)=>{return {pageName: page.title, ordering: index }}),
            inputs:[]
        } as RootNode
    }
)