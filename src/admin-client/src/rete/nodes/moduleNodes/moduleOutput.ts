import {ClassicPreset as Classic} from "rete";
import {DataflowNode} from "rete-engine";
import {NumberSocket} from "../../sockets";
import {ModuleOutputControl} from "./moduleControls";
import {BaseNode} from "../baseNode";
import {NodeControl} from "../nodeControl";
import {NodeType} from "@skogkalk/common/dist/src/parseTree";
import {NumberNodeOutput} from "../types";
import {NodeAction, NodeActionType} from "../../nodeActions";


export interface ModuleOutputControlData {
    outputName: string,
    value: number | undefined
}
export class ModuleOutput extends BaseNode<
    { value: NumberSocket },
    {},
    {c : NodeControl<ModuleOutputControlData> }
    >
    implements DataflowNode {
    width = 180;
    height = 140;

    constructor(
        private dispatch: (action: NodeAction) => void,
        initialName?: string,
        id?: string
    ) {
        super(NodeType.ModuleOutput, 140, 180, "Module Output", id);

        const initialState: ModuleOutputControlData = {
            outputName: initialName ?? "",
            value: undefined
        }

        this.addControl("c", new NodeControl(
            initialState,
            {
                onUpdate: () => {
                    this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})
                },
                minimized: false,
            },
            ModuleOutputControl
        ));
        this.addInput("value", new Classic.Input(new NumberSocket(), "Number"));
    }

    data( inputs: { value: NumberNodeOutput[] } ) : NumberNodeOutput  {
        return { value: inputs.value?.[0].value ?? 0, sourceID: this.id };
    }

    serializeControls(): any {
        return this.controls.c.getData();
    }

    deserializeControls(data: any) {
        this.controls.c.set(data);
    }




}
