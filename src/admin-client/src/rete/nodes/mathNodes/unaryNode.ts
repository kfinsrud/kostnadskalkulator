import {ParseableBaseNode} from "../parseableBaseNode";
import {ClassicPreset} from "rete";
import {getUnaryOperation, NodeType, ParseNode} from "@skogkalk/common/dist/src/parseTree";
import {NumberControlData} from "./numberControl/numberControlData";
import {NumberSocket} from "../../sockets";
import {NumberControlComponent} from "./numberControl/numberControlComponent";
import {NodeControl} from "../nodeControl";
import {NumberNodeOutput} from "../types";
import {NodeAction, NodeActionType} from "../../nodeActions";

/**
 * Node for use with any binary math operation, such as +,-, * amd pow.
 */
export class UnaryNode extends ParseableBaseNode<
    { unaryInput: NumberSocket; },
    { out: NumberSocket },
    { c: NodeControl<NumberControlData>}
>
{
    unaryOperation: (input: number) => number;

    constructor(
        type: NodeType,
        private dispatch: (action: NodeAction) => void,
        id?: string,
    ) {
        super(type, 230, 180, type.toString(), id);

        this.unaryOperation = getUnaryOperation(type);

        this.addControl(
            "c",
            new NodeControl(
                {value: 0, readonly: true} as NumberControlData,
                {onUpdate: ()=>{}, minimized: false},
                NumberControlComponent
            )
        );

        this.addInput("unaryInput", new ClassicPreset.Input(new NumberSocket(), "In"));
        this.addOutput("out", new ClassicPreset.Output(new NumberSocket(), "Out"));
    }

    data(inputs: { unaryInput?: NumberNodeOutput[]; }): { out: { value: number, sourceID: string} } {
        const { unaryInput } = inputs;
        const value = this.unaryOperation(unaryInput ? unaryInput[0].value : 0);

        this.controls.c.set({ value })

        this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})
        this.dispatch({type: NodeActionType.StateChange, nodeID: this.id, payload: [{key: "value", value: value}]})

        return { out: { value: value, sourceID: this.id } };
    }

    toParseNode() : ParseNode {
        return {
            id: this.id,
            type: this.type,
            value: this.controls.c.get('value') || 0
        }
    }

    serializeControls(): any {
        return this.controls.c.getData();
    }

    deserializeControls(data: any) {
        this.controls.c.set(data);
    }

}