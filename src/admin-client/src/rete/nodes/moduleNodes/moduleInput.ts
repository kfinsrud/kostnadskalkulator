import {ClassicPreset} from "rete";
import {NodeType} from "@skogkalk/common/dist/src/parseTree";
import {NumberSocket} from "../../sockets";
import {ModuleInputControl} from "./moduleControls";
import {BaseNode} from "../baseNode";
import {NodeControl} from "../nodeControl";
import {NumberNodeOutput} from "../types";
import {NodeAction, NodeActionType} from "../../nodeActions";


export interface ModuleInputControlData {
    inputName: string,
    value: number | undefined
}

export class ModuleInput extends BaseNode<
    {},
    { out: NumberSocket },
    { c : NodeControl<ModuleInputControlData>}
> {
    width = 180;
    height = 140;
    value: any = null;

    constructor(
        private dispatch: (action: NodeAction) => void,
        initial?: string,
        id?: string
    ) {
        super(NodeType.ModuleInput, 140, 180, "Module Input", id);


        const initialState: ModuleInputControlData = {
            inputName: initial ??"",
            value: undefined
        }

        this.addControl("c", new NodeControl<ModuleInputControlData>(
            initialState,
            {
                onUpdate: (data: Partial<ModuleInputControlData>) => {
                    if(data.value) {
                        this.value = data.value;
                        this.dispatch({type: NodeActionType.RecalculateGraph, nodeID: this.id})
                    }
                    this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})
                },
                minimized: false
            },
            ModuleInputControl
        ));

        this.addOutput("out", new ClassicPreset.Output( new NumberSocket(), "Number") );
    }

    data() : { out : NumberNodeOutput } {
        return {
            out: { value: this.value, sourceID: this.id }
        };
    }

    serializeControls(): any {
        return this.controls.c.getData();
    }

    deserializeControls(data: any) {
        this.controls.c.set(data);
    }
}