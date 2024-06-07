import {ParseableBaseNode} from "../../parseableBaseNode";
import {ResultSocket} from "../../../sockets";
import {NodeControl} from "../../nodeControl";
import {NodeType} from "@skogkalk/common/dist/src/parseTree";
import {ClassicPreset, getUID} from "rete";
import {GraphDisplayGroupData, GraphDisplayNodeControlData} from "./graphDisplayNodeControlData";
import {GraphDisplayGroupControlContainer, GraphDisplayNodeControlContainer} from "./graphDisplayNodeControlContainer";
import {GraphDisplayNode as ParseGraphDisplayNode} from "@skogkalk/common/src/parseTree";
import {ResultGroup} from "@skogkalk/common/dist/src/parseTree/nodes/displayNode";


interface SerializedControls {
    mainControlData: GraphDisplayNodeControlData,
    inputControlData: { key: string, data: GraphDisplayGroupData }[]
}


export class GraphDisplayNode extends ParseableBaseNode <
    Record<string, ResultSocket>,
    {},
    { c: NodeControl<GraphDisplayNodeControlData> }
> {
    constructor(
        protected updateNodeRendering: (nodeID: string) => void,
        private updateStore: () => void,
        private removeConnection: (nodeID: string, connection?:{input?:string, output?:string}) => void,
        id?: string,
    ) {
        super(NodeType.GraphDisplay, 600, 400, "Graph Display", id);

        const initialControlData: GraphDisplayNodeControlData = {
            shouldAddGroup: false,
            inputFieldShow: [],
            nodeID: this.id,
            name: "",
            unit: "",
            inputs: [],
        }
        this.addControl("c",
            new NodeControl(
                initialControlData,
                {
                    onUpdate: (data: Partial<GraphDisplayNodeControlData>) => {
                        if(data.shouldAddGroup) {
                            this.controls.c.set({shouldAddGroup: false})
                            this.addInputGroup();
                        }
                        updateNodeRendering(this.id);
                        updateStore();
                    },
                    minimized: false
                },
                GraphDisplayNodeControlContainer
            )
        );
        this.addInputGroup();
    }

    data( inputs : Record<string, {name: string, value: number, id: string , color: string}[]>) : {} {
        for(const key of Object.keys(this.inputs)) {
            ((this.inputs[key]!.control) as NodeControl<GraphDisplayGroupData>).set({resultIDs: []})
        }
        const groupIDs = Object.keys(inputs);
        for(const groupID of groupIDs) {
            const results = inputs[groupID];
            const resultIDs = results.map(result=>result.id);

            const group = this.inputs[groupID]?.control as NodeControl<GraphDisplayGroupData>;
            group.setNoUpdate({resultIDs: resultIDs});
        }
        this.updateStore();

        this.updateNodeRendering?.(this.id);
        return {}
    }


    addInputGroup(inputID?: string) {
        if(!inputID) inputID = getUID();
        this.addInput(inputID, new ClassicPreset.Input(new ResultSocket(), "Result", true));
        const control = new NodeControl<GraphDisplayGroupData>(
            { id: inputID, name: "", shouldDelete: false, unit: "", resultIDs: []},
            {
                onUpdate: (data: Partial<GraphDisplayGroupData>) => {
                    if(data.shouldDelete) {
                        this.removeInput(inputID!);
                        this.removeConnection(this.id, {input: inputID});
                    }

                    this.updateNodeRendering(this.id);
                    this.updateStore();
                },
                minimized: false,
            },
            GraphDisplayGroupControlContainer
        )
        this.inputs[inputID]?.addControl(control);
    }

    serializeControls(): SerializedControls {
        const inputKeys = Object.keys(this.inputs);
        let inputControls = [];
        for(const key of inputKeys) {
            inputControls.push({ key: key, data: (this.inputs[key]?.control as NodeControl<GraphDisplayGroupData>).getData()});
        }
        return {
            mainControlData: this.controls.c.getData(),
            inputControlData: inputControls
        }
    }

    deserializeControls(data: SerializedControls) {
        this.inputs = {};
        data.inputControlData.forEach(({key, data})=>{
            this.addInputGroup(key);
            (this.inputs[key]?.control as NodeControl<GraphDisplayGroupData>).setNoUpdate(data);
        })
        this.controls.c.set(data.mainControlData);
    }

    toParseNode() : ParseGraphDisplayNode {
        this.controls.c.setNoUpdate({nodeID: this.id})

        const resultGroups: ResultGroup[] = [];
        for(const key of Object.keys(this.inputs)) {
            const group = this.inputs[key]!.control as NodeControl<GraphDisplayGroupData>;
            const data = group.getData();
            resultGroups.push({
                unit: data.unit,
                id: data.id,
                inputIDs: data.resultIDs,
                name: data.name
            })
        }
        return {
            resultGroups: resultGroups,
            displayedInputIDs: this.controls.c.get('inputFieldShow').filter(field=>field.show).map(field=>field.id),
            unit: this.controls.c.get('unit'),
            name: this.controls.c.get('name'),
            inputs: [],
            inputOrdering: [],
            id: this.id,
            type: NodeType.GraphDisplay,
            value: 0,
            arrangement: {
                xs: this.controls.c.get('arrangement')?.xs ?? {order: 0, span: 12},
                md: this.controls.c.get('arrangement')?.md ?? {order: 0, span: 6},
                lg: this.controls.c.get('arrangement')?.lg ?? {order: 0, span: 4},
            }
        }
    }

    protected updateDataFlow: () => void = () => {}
}