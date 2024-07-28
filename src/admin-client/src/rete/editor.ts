import {NodeEditor} from "rete";
import {ReteNode, Schemes} from "./nodes/types";
import {AreaExtensions, AreaPlugin} from "rete-area-plugin";
import {ConnectionPlugin, Presets as ConnectionPresets} from "rete-connection-plugin";
import {Presets, ReactArea2D, ReactPlugin} from "rete-react-plugin";
import {DataflowEngine} from "rete-engine";
import {Presets as ScopesPresets, ScopesPlugin} from "rete-scopes-plugin";
import {AutoArrangePlugin, Presets as ArrangePresets} from "rete-auto-arrange-plugin";
import {createParseNodeGraph} from "./adapters";
import {createRoot} from "react-dom/client";
import {getNodeByID, NodeType, ParseNode, TreeState, treeStateFromData} from "@skogkalk/common/dist/src/parseTree";
import {ItemDefinition} from "rete-context-menu-plugin/_types/presets/classic/types";
import {ContextMenuExtra, ContextMenuPlugin, Presets as ContextMenuPresets} from "rete-context-menu-plugin";
import {ModuleEntry, ModuleManager} from "./moduleManager";
import {GraphSerializer, SerializedGraph} from "./graphSerializer";
import {NodeFactory} from "./nodeFactory";
import {canCreateConnection} from "./sockets";
import {ModuleNode} from "./nodes/moduleNodes/moduleNode";
import {CustomNode} from "./nodes/CustomNode";
import {NodeAction, NodeActionType} from "./nodeActions";
import {HistoryActions, HistoryExtensions, HistoryPlugin, Presets as HistoryPresets} from "rete-history-plugin";


export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;


export enum EditorEvent {
    ModulesChanged = "ModulesChanged"
}

export interface EditorSnapshot {
    readonly currentModule: string | undefined,
    moduleNames: ReadonlyArray<string>
}

export interface EditorContext {
    history: HistoryPlugin<Schemes, HistoryActions<Schemes>>
    editor: NodeEditor<Schemes>,
    area: AreaPlugin<Schemes,  AreaExtra>,
    connection: ConnectionPlugin<Schemes, AreaExtra>,
    render: ReactPlugin<Schemes, AreaExtra>,
    engine: DataflowEngine<Schemes>,
    scopes: ScopesPlugin<Schemes>,
    arrange: AutoArrangePlugin<Schemes>
}


export interface EditorDataPackage {
    main: SerializedGraph,
    modules: ModuleEntry[]
}


export class Editor {
    private editorSnapshot: EditorSnapshot = {
        currentModule: undefined,
        moduleNames: []
    };
    private context!: EditorContext;
    private factory!: NodeFactory;
    private eventSubscriptions = {
        ModulesChanged: new Set<any>()
    }
    private selectedNode: string | undefined;
    private onChangeCalls: {id: string, call: (nodes?: ParseNode[])=>void}[] = []
    private loading = false;
    private readonly moduleManager: ModuleManager;
    private serializer!: GraphSerializer;
    private stashedMain: SerializedGraph | undefined;
    public  currentModule: Readonly<string> | undefined;

    public destroyArea = () => {this.context.area.destroy()}
    private currentTreeState?: TreeState
    private isDataflowUpdateActive = false





    constructor (
        private container: HTMLElement
    ) {
        this.moduleManager = new ModuleManager();
        this.initializeEditor();
        //@ts-ignore
        AreaExtensions.zoomAt(this.context.area, this.context.editor.getNodes()).then(() => {});
        this.exportAsParseTree().then(state=>this.currentTreeState=treeStateFromData(state))
    }


    private initializeEditor() {
        this.context = {
            history: new HistoryPlugin<Schemes, HistoryActions<Schemes>>(),
            editor: new NodeEditor<Schemes>(),
            area: new AreaPlugin<Schemes, AreaExtra>(this.container),
            engine: new DataflowEngine<Schemes>(),
            connection: new ConnectionPlugin<Schemes, AreaExtra>(),
            render: new ReactPlugin<Schemes, AreaExtra>({ createRoot }),
            arrange:  new AutoArrangePlugin<Schemes>(),
            scopes: new ScopesPlugin<Schemes>()
        };

        this.factory = new NodeFactory(
            this.moduleManager,
            (action: NodeAction) => { this.dispatchAction(action)},
        );

        this.setUpEditor();
        this.setUpDataflowEngine();
        this.setUpArea();
        this.setUpConnection();
        this.setUpRendering();
        this.setUpScopes();
        this.setUpAutoArrange();
        this.setUpHistory();

        this.serializer = new GraphSerializer(
            this.context.editor,
            this.factory,
            this.context.area
        )
    }


    public async loadMainGraph() {
        await this.saveCurrentMainOrModule(this.currentModule);
        this.currentModule = undefined;
        if(this.stashedMain !== undefined) await this.importNodes(this.stashedMain)

        this.signalEventAndUpdateSnapshot(EditorEvent.ModulesChanged);
    }

    public async loadModule(name: string) {
        if(this.currentModule === name) { return; }
        if(!this.moduleManager.hasModule(name)) { throw new Error("No module with name " + name); }
        await this.saveCurrentMainOrModule(this.currentModule);
        this.currentModule = name;
        const data = this.moduleManager.getModuleData(name);
        if(data === undefined) {
            return;
        } else {
            await this.importNodes(data);
        }
        this.signalEventAndUpdateSnapshot(EditorEvent.ModulesChanged);
    }

    public async deleteModule(name: string) {
        if(!this.moduleManager.hasModule(name)) return;

        this.moduleManager.removeModule(name);
        if(this.currentModule === name) {
            await this.loadMainGraph();
        } else {
            this.synchronizeModuleNodes();
        }
        this.signalEventAndUpdateSnapshot(EditorEvent.ModulesChanged);
    }

    public renameCurrentModule(newName: string) {
        if(!this.hasModuleLoaded()) return;
        this.moduleManager.renameModule(this.currentModule!, newName);
        this.currentModule = newName;
        this.signalEventAndUpdateSnapshot(EditorEvent.ModulesChanged);
    }


    public async saveCurrentMainOrModule(module: string | undefined) {
        if(module === undefined) {
            this.stashedMain = await this.exportMainGraph();
            // this.stashedMain = { nodes: [] }
        } else {
            const data = await this.exportCurrentGraph();
            this.moduleManager.setModuleData(module, data);
        }
    }


    public addNewModule(name: string, data?: any) {
        if(this.moduleManager.hasModule(name)) {
            return
        }
        this.moduleManager.addModuleData(name, data);
        this.signalEventAndUpdateSnapshot(EditorEvent.ModulesChanged);
    }

    private synchronizeModuleNodes() {
        this.context.editor.getNodes().forEach(node=>{
            if(node instanceof ModuleNode) {
                node.controls.c.set({availableModules: this.moduleManager.getModuleNames()})
            }
        })
    }



    private async dispatchAction(action: NodeAction) {
        console.log(action, this.context.editor.getNode(action.nodeID));
        if(this.loading ) return;

        switch(action.type) {
            case NodeActionType.Disconnect: {
                await this.removeNodeConnections(action.nodeID);
            } break;
            case NodeActionType.RecalculateGraph: {
                await this.updateDataFlow().catch(e=>console.log(e));
            } break;
            case NodeActionType.UpdateRender: {
                await this.context.area.update('node', action.nodeID);
            } break;
            case NodeActionType.StateChange: {
                if(this.hasModuleLoaded()) {
                    return;
                }
                this.updateNodeWithAction(action);
                this.signalOnChange(action.type);
            } break;
        }

    }


    private updateNodeWithAction(action: NodeAction) {
        if(action.type != NodeActionType.StateChange) return;

        const node = getNodeByID(this.currentTreeState, action.nodeID);
        if(node == undefined || action.payload == undefined) return;

        for( const { key, value } of action.payload ) {
            if((node as any)[key] != undefined) {
                switch(key) {
                    case "id" : break;
                    case "inputs" : break;
                    case "right" : break;
                    case "left" : break;
                    default: (node as any)[key] = value; break;
                }
            }
        }
    }



    /**
     * Causes an update of values throughout the tree structure
     */
    private async updateDataFlow() {
        if(this.loading || this.isDataflowUpdateActive) return;

        this.context.engine.reset();
        this.isDataflowUpdateActive = true;
        for(const node of this.context.editor.getNodes()) {
            await this.context.engine.fetch(node.id);
        }
        this.isDataflowUpdateActive = false;
        // for(const action of this.queuedActions.reverse()) {
        //     this.updateNodeWithAction(action);
        //     await this.context.area.update('node', action.nodeID);
        // }
        const trees = await this.exportAsParseTree();
        this.currentTreeState = treeStateFromData(trees);
        if(this.currentModule == undefined) {
            await this.signalOnChange("update dataflow");
        }
    }


    /**
     * Registers a function that is called whenever a node needs to be synchronized with
     * redux store for the purpose of previewing a ParseNode tree
     * @param entry
     */
    public registerOnChangeCallback(entry: {id: string, call: ()=>void}) {
        if(this.onChangeCalls.find(({id})=>{return id === entry.id})) {
            return
        }
        this.onChangeCalls.push(entry);
    }


    public createEventSubscriber(eventType: EditorEvent) {
        const registerCallback = (callback: ()=>void) =>{
            this.eventSubscriptions[eventType]?.add(callback);
        }
        const unregister = ((callback: ()=>void) => {
            return ()=>{
                this.eventSubscriptions[eventType]?.delete(callback);
            }
        });


        let func = (callback: ()=>void) => {
            registerCallback(callback);
            return () => { unregister(callback)(); }
        }

        return func.bind(this);
    }

    private updateSnapshot() {
        this.editorSnapshot = {
            currentModule: this.currentModule,
            moduleNames: this.moduleManager.getModuleNames()
        }
    }

    private signalEventAndUpdateSnapshot(eventType: EditorEvent) {
        this.updateSnapshot();
        this.eventSubscriptions[eventType]?.forEach(callback=>{
            callback();
        })
    }

    public getSnapshotRetriever() :  ()=>EditorSnapshot {
        const snapFn = ()=>{
            return this.editorSnapshot;
        }
        return snapFn.bind(this);
    }

    /**
     * Invokes all callbacks if not in the process of loading a file.
     */
    private async signalOnChange(reason?: string ) {
        console.log("signalOnChange: " + reason);
        if(!this.loading && !this.hasModuleLoaded()) {
            const nodes = this.currentTreeState?.subTrees;
            this.onChangeCalls.forEach(({call})=>{
                call(nodes)
            })
        }
    }






    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // DATA SERIALIZATION AND UTILITIES
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Loads data previously created through exportNodes() back into the editor.
     * @param data nodes
     */
    public async importNodes(data: SerializedGraph) {
        this.loading = true;
        console.log("import starts");
        // await this.context.editor.clear();
        this.context.area.destroy();
        this.initializeEditor();
        await this.serializer.importNodes(data);
        this.resetView();
        this.synchronizeModuleNodes();
        for(const node of this.context.editor.getNodes()) {
            await this.context.area.update('node', node.id);
        }
        this.loading = false;
        if(!this.hasModuleLoaded()) {
            this.currentTreeState = treeStateFromData(await this.exportAsParseTree());
            await this.signalOnChange("main graph load");
        }
        console.log("import ends");
    }


    /**
     * Exports the main graph.
     */
    public async exportMainGraph() : Promise<SerializedGraph>{
        if(!this.hasModuleLoaded()) {
            return this.serializer.exportNodes();
        } else {
            await this.saveCurrentMainOrModule(this.currentModule);
            const tempEditor = new NodeEditor<Schemes>();
            const tempSerializer = new GraphSerializer(tempEditor, new NodeFactory(this.moduleManager));
            if(!this.stashedMain) {
                return {nodes: []}
            } else {
                await tempSerializer.importNodes(this.stashedMain);
                return tempSerializer.exportNodes();
            }
        }
    }

    public async exportCurrentGraph() : Promise<SerializedGraph> {
        return this.serializer.exportNodes();
    }



    public async exportWithModules() : Promise<EditorDataPackage> {
        return {
            main: await this.exportMainGraph(),
            modules: this.moduleManager.getAllModuleData()
        }
    }

    public async importWithModules(data: EditorDataPackage) : Promise<void> {
        const deepDataCopy = JSON.parse(JSON.stringify(data));
        let oldFormatData = {
            main: { nodes: [] },
            modules: []
        }
        let useOldFormat = false;
        //@ts-ignore
        if(deepDataCopy.graph?.main !== undefined) {
            //@ts-ignore
            oldFormatData.main = deepDataCopy.graph.main;
            useOldFormat = true;
        }
        //@ts-ignore
        if(deepDataCopy.nodes !== undefined) {
            useOldFormat = true;
            //@ts-ignore
            oldFormatData.main = { nodes: deepDataCopy.nodes };
        }
        //@ts-ignore
        if(deepDataCopy.graph?.modules !== undefined) {
            //@ts-ignore
            oldFormatData.modules = deepDataCopy.graph.modules
        }

        const uploadData = (useOldFormat)? oldFormatData : deepDataCopy;
        this.moduleManager.overwriteModuleData(uploadData.modules);
        await this.importNodes(uploadData.main);
        this.currentModule = undefined;
        this.signalEventAndUpdateSnapshot(EditorEvent.ModulesChanged);

        this.synchronizeModuleNodes();
    }


    /**
     * Exports the current data structure as its equivalent ParseNode structure
     */
    public async exportAsParseTree() : Promise<ParseNode[]> {
        if(!this.hasModuleLoaded()) {
            return createParseNodeGraph(this.serializer, this.moduleManager);
        } else {
            const tempEditor = new NodeEditor<Schemes>();
            const tempSerializer = new GraphSerializer(tempEditor, new NodeFactory(this.moduleManager));
            await tempSerializer.importNodes(this.stashedMain || {nodes: []});
            return createParseNodeGraph(tempSerializer, this.moduleManager);
        }
    }


    /**
     * Removes all nodes from the current canvas
     */
    public clearNodes() {
        this.loading = true;
        this.context.editor.clear().then(()=>{
            this.moduleManager.overwriteModuleData([])
            this.loading = false;
            this.currentModule = undefined;
            this.signalEventAndUpdateSnapshot(EditorEvent.ModulesChanged);
            }
        );
    }


    /**
     * Deletes the currently selected node on the canvas
     */
    public async deleteSelected() {
        if(this.selectedNode && ( this.context.editor.getNode(this.selectedNode)) ) {
            await this.removeNodeConnections(this.selectedNode);
            this.context.editor.removeNode(this.selectedNode).then(()=>{});
        }
    }


    private async removeNodeConnections(nodeID: string, connection?: { input?: string, output?: string }) {
        if( this.context.editor.getNode(nodeID) ) {
            const connections = this.context.editor.getConnections().filter(c => {
                if(connection === undefined) {
                    return c.source === nodeID || c.target === nodeID;
                } else {
                    if(connection.input !== undefined) {
                        return c.target === nodeID && c.targetInput === connection.input;
                    }
                    if(connection.output !== undefined) {
                        return c.source === nodeID && c.sourceOutput === connection.output;
                    }
                    return false;
                }
            })
            for (const connection of connections) {
                await this.context.editor.removeConnection(connection.id)
            }
        }
    }

    public hasModuleLoaded() {
        return this.currentModule !== undefined;
    }





    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // VIEW MANIPULATION
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Brings all nodes on the canvas into view
     */
    public resetView () {
        AreaExtensions.zoomAt(this.context.area, this.context.editor.getNodes()).then(() => {});
    }

    /**
     * Focuses the view on the last selected node, or on another node if
     * provided id results in a match.
     */
    public focusViewOnSelectedNode(id?: string) {
        this.selectedNode = (id != undefined) ? id : this.selectedNode;
        let node = this.context.editor.getNode(this.selectedNode ?? "");
        if(node != undefined) {
            this.context.area.emit({type:"nodepicked", data: node});
            for( let n of this.context.editor.getNodes() ) {
                n.selected = n.id == node.id;
                this.context.area.update('node', n.id);
            }
            //ensures node behaves as if selected by cursor
            AreaExtensions.zoomAt(this.context.area, [node]).catch(()=>{}).then(() => {});
        }
    }






    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    // NODE CREATION
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Creates a menu with nodes the user can create
     * @private
     */
    private createContextMenu() {
        const nodeTypesToDefinition : (nodeTypes: NodeType[])=>ItemDefinition<Schemes>[] = (types) =>{
            return types.map(node=>{
                return [node.toString(), ()=>{return this.factory.createNode(node) as ReteNode}]
            })
        }
        const mathNodes = nodeTypesToDefinition ([
            NodeType.Add,
            NodeType.Div,
            NodeType.Mul,
            NodeType.Sub,
            NodeType.Prod,
            NodeType.Pow,
            NodeType.Sum,
            NodeType.Number,
            NodeType.Choose,
            NodeType.Min,
            NodeType.Max,
            NodeType.Sqrt,
            NodeType.Exp,
            NodeType.Round,
            NodeType.Ceil,
            NodeType.Floor
        ])
        const inputNodes = nodeTypesToDefinition ([
            NodeType.DropdownInput,
            NodeType.NumberInput
        ])
        const moduleNodes = nodeTypesToDefinition ([
            NodeType.Module,
            NodeType.ModuleInput,
            NodeType.ModuleOutput
        ])
        const displayNodes = nodeTypesToDefinition ( [
            NodeType.Display,
            NodeType.BarDisplay,
            NodeType.PreviewDisplay,
            NodeType.ListDisplay,
            NodeType.GraphDisplay
        ])


        return new ContextMenuPlugin<Schemes>({
            items: ContextMenuPresets.classic.setup([
                ["Math", mathNodes],
                ["Inputs", inputNodes],
                ["Displays", displayNodes],
                ["Module", moduleNodes],
                ["Output", ()=>{ return this.factory.createNode(NodeType.Output) as ReteNode}]
            ])
        });
    }






    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // SETUP FUNCTIONS
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    private setUpEditor() {
        this.context.editor.use(this.context.area);
        this.context.editor.use(this.context.engine);

        this.context.editor.addPipe((context) => {
            if(context.type === "connectioncreate" && !canCreateConnection(this.context.editor, context.data)) {
                return;
            }
            if (["connectioncreated", "connectionremoved", "noderemoved", "nodecreated"].includes(context.type) &&
                !this.loading
            ) {
                this.updateDataFlow().then(()=>{
                    this.exportAsParseTree().then(state=>{
                        this.currentTreeState = treeStateFromData(state);
                        this.signalOnChange(context.type);
                    })
                });
            }
            return context;
        });
    }

    private setUpConnection() {
        this.context.connection.addPreset(ConnectionPresets.classic.setup());
    }

    private setUpRendering() {
        this.context.render.addPreset(Presets.contextMenu.setup({delay:10}));
        this.context.render.addPreset(
            Presets.classic.setup({
                customize: {
                    control(data) {
                        return data.payload.controlContainer
                    },
                    node() {
                        return CustomNode;
                        // return Presets.classic.Node;
                    },
                    socket(context) {
                        return context.payload.component;
                    }
                }
            })
        );
    }

    private setUpScopes() {
        this.context.scopes.addPreset(ScopesPresets.classic.setup());
    }

    private setUpAutoArrange() {
        this.context.arrange.addPreset(ArrangePresets.classic.setup());
    }

    private setUpHistory() {
        this.context.history.addPreset(HistoryPresets.classic.setup())
        HistoryExtensions.keyboard(this.context.history)
    }


    private setUpArea() {
        this.context.area.use(this.context.connection);
        this.context.area.use(this.createContextMenu());
        this.context.area.use(this.context.render);
        this.context.area.use(this.context.scopes);
        this.context.area.use(this.context.arrange);
        this.context.area.use(this.context.history);

        AreaExtensions.selectableNodes(this.context.area, AreaExtensions.selector(), {
            accumulating: AreaExtensions.accumulateOnCtrl()
        });

        this.context.area.addPipe((context)=> {
            if(context.type === "nodepicked") {
                this.selectedNode = context.data.id;
                console.log(this.context.editor.getNode(context.data.id))
                this.context.engine.fetchInputs(this.selectedNode);
            }
            if (context.type === "nodetranslated") {
                const node = this.context.editor.getNode(context.data.id);
                if(node) {
                    [node.yTranslation, node.xTranslation] = [context.data.position.y, context.data.position.x]
                }
            }
            return context;
        })

    }

    private setUpDataflowEngine() {
    }

}