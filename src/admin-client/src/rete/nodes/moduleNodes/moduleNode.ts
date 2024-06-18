import {ClassicPreset as Classic, NodeEditor} from "rete";
import {Schemes} from "../types";
import {NodeType} from "@skogkalk/common/dist/src/parseTree";
import {Module, ModuleManager} from "../../moduleManager";
import {NumberSocket} from "../../sockets";
import {ModuleNodeControl} from "./moduleControls";
import {BaseNode} from "../baseNode";
import {NodeControl} from "../nodeControl";
import {NodeAction, NodeActionType} from "../../nodeActions";


export interface ModuleNodeControlData {
    currentModule: string,
    availableModules: string[]
}


export class ModuleNode extends BaseNode<
    Record<string, NumberSocket>,
    Record<string, NumberSocket>,
    { c : NodeControl<ModuleNodeControlData>}
> {
    module: null | Module<Schemes> = null;
    editor: NodeEditor<Schemes> | undefined;

    constructor(
        private moduleManager: ModuleManager,
        private dispatch: (action: NodeAction) => void,
        id?: string
    ) {
        super(NodeType.Module, 140, 180, "Module", id);

        const initialState : ModuleNodeControlData = {
            currentModule: "",
            availableModules: this.moduleManager.getModuleNames()
        }

        this.addControl(
            "c",
            new NodeControl(
                initialState,
                {
                    onUpdate: (data: Partial<ModuleNodeControlData>)=>{
                        if('currentModule' in data) {
                            this.setModuleAndRefreshPorts().then(()=>{
                                this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})
                                this.dispatch({type: NodeActionType.RecalculateGraph, nodeID: this.id})
                            });
                        }
                    },
                    minimized: false
                },
                ModuleNodeControl
            )
        );

        this.setModuleAndRefreshPorts();
    }

    public getNodes() {
        if(this.editor) {
            return this.editor.getNodes();
        }
        return []
    }

    public getConnections() {
        if(this.editor) {
            return this.editor.getConnections();
        }
        return []
    }

    public async setModuleAndRefreshPorts() {
        this.module = this.moduleManager.getModule(this.controls.c.get('currentModule'));

        this.dispatch({type: NodeActionType.Disconnect, nodeID: this.id})
        if (this.module) {
            const editor = new NodeEditor<Schemes>();
            await this.module.apply(editor);
            this.editor = editor;
            const { inputs, outputs } = ModuleManager.getPorts(editor);
            this.syncPortsWithModule(inputs, outputs);
        } else this.syncPortsWithModule([], []);
    }



    private syncPortsWithModule(inputs: string[], outputs: string[]) {
        Object.keys(this.inputs).forEach((key: keyof typeof this.inputs) =>
            this.removeInput(key)
        );
        Object.keys(this.outputs).forEach((key: keyof typeof this.outputs) =>
            this.removeOutput(key)
        );

        inputs.forEach((key) => {
            this.addInput(key, new Classic.Input(new NumberSocket(), key));
        });
        outputs.forEach((key) => {
            this.addOutput(key, new Classic.Output(new NumberSocket(), key));
        });
        this.setHeightFromPorts();
    }

    private setHeightFromPorts() {
        this.height =
            110 +
            25 * (Object.keys(this.inputs).length + Object.keys(this.outputs).length);
    }

    async data(inputs: Record<string, any>) {
        const data = await this.module?.exec(inputs);
        Object.keys(data).forEach((key) => {
            data[key] = { value: data[key], sourceID: this.id };
        });
        return data || {};
    }

    serializeControls() {
        return this.controls.c.getData();
    }

    deserializeControls(serializedData: any) {
        this.controls.c.set(serializedData);
    }
}
