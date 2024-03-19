import {DisplayBarNodeData} from "./displayPieNodeControlData";
import React, {useEffect, useState} from "react";
import {getNodeByID, NodeType} from "@skogkalk/common/dist/src/parseTree";
import {useAppSelector} from "../../../../state/hooks";
import {selectTreeState, store} from "../../../../state/store";
import {NodeControl} from "../../../nodes/baseNode";
import {Provider} from "react-redux";
import Container from "react-bootstrap/Container";
import {TextInputField} from "../../../../components/input/textInputField";
import { DisplayBarNode as ParseDisplayNode} from "@skogkalk/common/dist/src/parseTree"
import {ResultBar} from "@skogkalk/common/dist/src/visual/resultBar";
import {NumberInputField} from "../../../../components/input/numberInputField";

export function DisplayBarNodeControlContainer(
    props: { data: NodeControl<DisplayBarNodeData> }
) {
    return <Provider store={store}>
        <DisplayBarNodeContent data={props.data}/>
    </Provider>
}

function DisplayBarNodeContent(
    props: { data: NodeControl<DisplayBarNodeData>}
) {
    const treeState = useAppSelector(selectTreeState)
    const nodeID = props.data.get('nodeID');
    const [displayNode, setDisplayNode] = useState(getNodeByID(treeState.tree, nodeID) as ParseDisplayNode | undefined);
    useEffect(()=> {
        if(treeState.tree) {
            setDisplayNode(getNodeByID(treeState.tree, props.data.get('nodeID')) as ParseDisplayNode);
        }
    }, [treeState.tree, nodeID, displayNode, props.data])


    return <>
        <Container>
            <ResultBar
                displayData={displayNode? displayNode : {
                    id:"",
                    value: 0,
                    type: NodeType.BarDisplay,
                    inputOrdering: [],
                    name: "",
                    unit: "",
                    max: 0,
                    inputs:[],

                }}
                treeState={treeState.tree}
            />
            <TextInputField
                inputHint={"Name"}
                value={props.data.get('name')}
                onChange={(value)=>{
                    props.data.set({name: value});
                }}/>
            <TextInputField
                inputHint={"Unit"}
                value={props.data.get('unit')}
                onChange={(value)=>{
                    props.data.set({unit: value});
                }}/>
            <NumberInputField
                inputHint={"Max"}
                value={props.data.get('max')}
                onChange={(value)=>{
                    props.data.set({max: value});
                }}
                onIllegalValue={()=>{}}
                legalRanges={[]}
            />

        </Container>

    </>
}