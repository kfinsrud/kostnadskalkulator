import {ParseableBaseNode} from "../parseableBaseNode";
import {ClassicPreset} from "rete";
import {NodeType, ParseNode} from "@skogkalk/common/dist/src/parseTree";
import {NumberControlData} from "./numberControl/numberControlData";
import {NumberSocket} from "../../sockets";
import {NumberControlComponent} from "./numberControl/numberControlComponent";
import {NodeControl} from "../nodeControl";
import {NumberNodeOutput} from "../types";
import {NodeAction, NodeActionType} from "../../nodeActions";


/**
 * Node providing a simple number value that can be manually set. Represents a constant.
 */
export class NumberNode extends ParseableBaseNode<
    {},
    { out: NumberSocket },
    { c: NodeControl<NumberControlData> }
> {
    clone: () => NumberNode;
    constructor(
        initialValue: number,
        private dispatch: (action: NodeAction) => void,
        id?: string
    ) {
        super(NodeType.Number, 160, 180, "Constant", id);


        this.clone = () => new NumberNode(this.controls.c.get('value') || 0, this.dispatch);

        this.addControl(
            "c",
            new NodeControl(
                {value: initialValue, readonly: false} as NumberControlData,
                {
                    onUpdate: ()=>{
                        this.dispatch({type: NodeActionType.RecalculateGraph, nodeID: this.id})
                        this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})
                    },
                    minimized: false
                },
                NumberControlComponent
            )
        );
        this.addOutput("out", new ClassicPreset.Output(new NumberSocket(), "Number"));
    }

    data(): { out: NumberNodeOutput } {
        this.clone = () => new NumberNode(this.controls.c.get('value') || 0, this.dispatch);
        return {
            out: { value: this.controls.c.get('value') || 0, sourceID: this.id }
        };
    }

    serializeControls(): any {
        return this.controls.c.getData();
    }

    deserializeControls(data: any) {
        this.controls.c.set(data);
    }

    toParseNode(): ParseNode {
        return {
            id: this.id,
            value: this.controls.c.get('value') || 0,
            type: this.type
        }
    }
}