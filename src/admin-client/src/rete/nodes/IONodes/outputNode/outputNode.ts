import {ParseableBaseNode} from "../../parseableBaseNode";
import {NodeType, OutputNode as ParseOutputNode} from "@skogkalk/common/dist/src/parseTree";
import {ClassicPreset} from "rete";
import {OutputNodeControlData} from "./outputNodeControlData";
import {NumberSocket, ResultSocket} from "../../../sockets";
import {OutputNodeControlContainer} from "./outputNodeControlContainer";
import {NodeControl} from "../../nodeControl";
import {NumberNodeOutput} from "../../types";
import {NodeAction, NodeActionType} from "../../../nodeActions";


export class OutputNode extends ParseableBaseNode <
    { result: NumberSocket },
    { out: ResultSocket },
    { c : NodeControl<OutputNodeControlData>}
> {


    constructor(
        private dispatch: (action: NodeAction) => void,
        id?: string
    ) {
        super(NodeType.Output, 240, 200, "Output", id);

        this.addInput( "result", new ClassicPreset.Input(  new NumberSocket(),  "Result",  false))
        this.addOutput(  "out", new ClassicPreset.Output( new ResultSocket(), "Out", true));

        const initialState: OutputNodeControlData = {
            name: "",
            value: 0,
            color: "#AAAAAA",
            unit: "",
        }
        this.addControl("c",
            new NodeControl(
                initialState,
                {
                    onUpdate: ()=> {
                        this.dispatch({type: NodeActionType.RecalculateGraph, nodeID: this.id})
                        this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})
                    },
                    minimized: false
                },
                OutputNodeControlContainer
            ))
    }

    data( inputs :{ result?: NumberNodeOutput[] }) : { out: {name: string, value: number, id: string, color: string }} {
        const { result } = inputs
        if(result) {
            this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})
            this.dispatch({type: NodeActionType.StateChange, nodeID: this.id, payload: [{key: "value", value: result[0].value}]})
            this.controls.c.setNoUpdate({value: result[0].value});
        }
        return {
            out: {
                id: this.id,
                name: this.controls.c.get('name'),
                value: this.controls.c.get('value') || 0,
                color: this.controls.c.get('color') || ""
            }
        }
    }

    toParseNode(): ParseOutputNode {
        return {
            id: this.id,
            value: this.controls.c.get('value'), // TODO: Somehow turns into an array with the actual value
            type: NodeType.Output,
            child: {id:"", value: 0, type: NodeType.Number }, // Placeholder,
            name: this.controls.c.get('name'),
            color: this.controls.c.get('color') || "",
            unit: this.controls.c.get('unit') || "",
        }
    }

    serializeControls(): any {
        return this.controls.c.getData();
    }

    deserializeControls(data: any) {
        this.controls.c.set(data);
    }
}