import {ClassicPreset as Classic, NodeEditor} from "rete";
import {Schemes} from "../types";
import {NodeType} from "@skogkalk/common/dist/src/parseTree";
import {Module, ModuleManager} from "../../moduleManager";
import {NumberSocket} from "../../sockets";
import {ModuleNodeControl} from "./moduleControls";
import {BaseNode} from "../baseNode";
import {NodeControl} from "../nodeControl";
import {NodeAction, NodeActionType} from "../../nodeActions";
import {DataflowEngine} from "rete-engine";
import {ModuleInput} from "./moduleInput";
import {ModuleOutput} from "./moduleOutput";


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
    engine: DataflowEngine<Schemes> | undefined;

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
            this.editor = new NodeEditor<Schemes>();
            this.engine = new DataflowEngine<Schemes>();
            this.editor.use(this.engine);
            await this.module.apply(this.editor);

            const { inputs, outputs } = ModuleManager.getPorts(this.editor);
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
        if(!this.editor || !this.engine) {
            return {};
        }
        const data = await this.execute(inputs, this.editor, this.engine);
        Object.keys(data).forEach((key) => {
            data[key] = { value: data[key], sourceID: this.id };
        });
        return data || {};
    }


    /**
     * Injects inputs into module graph and retrieves values of outputs
     * @param inputs
     * @param editor
     * @param engine
     * @private
     */
    private async execute(
        inputs: Record<string, any>,
        editor: NodeEditor<Schemes>,
        engine: DataflowEngine<Schemes>
    ) {
        const nodes = editor.getNodes();

        this.injectInputs(nodes, inputs);

        return this.retrieveOutputs(nodes, engine);
    }

    /**
     * Injects input values from ModuleNode into inputs in module graph
     * @param moduleGraph
     * @param inputData
     * @private
     */
    private injectInputs(moduleGraph: Schemes["Node"][], inputData: Record<string, any>) {
        const inputNodes = moduleGraph.filter(
            (node): node is ModuleInput => node instanceof ModuleInput
        );

        inputNodes.forEach((node) => {
            const key = node.controls.c.get('inputName');
            if (key) {
                node.value = inputData[key] && inputData[key][0].value;
            }
        });
    }


    /**
     * Retrieves outputs in module graph, returning an object of key value pairs for the combined outputs
     * @param moduleGraph
     * @param engine
     * @private
     */
    private async retrieveOutputs(moduleGraph: Schemes["Node"][], engine: DataflowEngine<Schemes>) {
        const moduleOutputs = moduleGraph.filter(
            (node): node is ModuleOutput => node instanceof ModuleOutput
        );
        const moduleOutputKeyWithValues = await Promise.all(
            moduleOutputs.map(async (outNode) => {
                const data = await engine.fetchInputs(outNode.id);
                return [outNode.controls.c.get('outputName') || "", data.value?.[0].value] as const;
            })
        );

        return Object.fromEntries(moduleOutputKeyWithValues);
    }
    serializeControls() {
        return this.controls.c.getData();
    }

    deserializeControls(serializedData: any) {
        this.controls.c.set(serializedData);
    }
}
