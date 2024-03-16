import {createRoot} from "react-dom/client";
import {NodeEditor} from "rete";
import {AreaExtensions, AreaPlugin} from "rete-area-plugin";
import {ConnectionPlugin, Presets as ConnectionPresets} from "rete-connection-plugin";
import {Presets, ReactArea2D, ReactPlugin} from "rete-react-plugin";
import {AutoArrangePlugin, Presets as ArrangePresets} from "rete-auto-arrange-plugin";
import {ContextMenuExtra, ContextMenuPlugin, Presets as ContextMenuPresets} from "rete-context-menu-plugin";
import {Presets as ScopesPresets, ScopesPlugin} from "rete-scopes-plugin";
import {DataflowEngine} from "rete-engine";
import {Schemes} from "./nodes/types";
import {exportGraph, importGraph} from "./serialization";
import {createJSONGraph} from "./adapters";
import {NodeType, ParseNode} from "@skogkalk/common/dist/src/parseTree";
import {NumberNode} from "./nodes/numberNode";
import {BinaryNode} from "./nodes/binaryNode";
import {NaryNode} from "./nodes/naryNode";
import {NumberInputNode} from "./nodes/numberInputNode";
import {OutputNode} from "./nodes/outputNode";
import {DropdownInputNode} from "./nodes/dropdownInputNode";
import {DisplayPieNode} from "./nodes/displayPieNode";
import {
    DisplayPieNodeControlContainer
} from "./customControls/displayNodeControls/pieDisplayNode/displayPieNodeControlContainer";
import {NumberControlComponent} from "./customControls/numberControl/numberControlComponent";
import {OutputNodeControlContainer} from "./customControls/outputNodeControls/outputNodeControlContainer";
import {NumberInputControlContainer} from "./customControls/inputNodeControls/number/numberInputControlContainer";
import {DropdownInputControlContainer} from "./customControls/inputNodeControls/dropdown/dropdownInputControlContainer";
import {Module, Modules} from "./nodes/moduleSystem/modules";




export type AreaExtra = ReactArea2D<Schemes> | ContextMenuExtra;


/**
 * Processes the graph to update the engine with the latest values.
 * process() is called when the value of a node controller changes.
 * NB: Make sure process is not called before the graph is done loading,
 * as engine.reset() being called will cause cancellation errors to be raised
 * if a fetch() call is in progress.
 * @param engine engine
 * @param editor editor
 */
export function process (engine: DataflowEngine<Schemes>, editor: NodeEditor<Schemes>) {
    return function () {
        engine.reset();
        editor
            .getNodes()
            .forEach(async (node) => {
                await engine.fetch(node.id).catch(() => {});
            });
    }
}


/**
 * Loads a graph from the browser's local storage.
 * If the file does not exist, the function will reject.
 * @param fileName name of the file to load
 * @param editor editor
 * @param engine engine
 * @param area area
 * @param updateStore function to call when rete has updated treeState data
 */
async function  loadGraphFromLocalStorage(
    fileName: string,
    editor: NodeEditor<Schemes>,
    engine: DataflowEngine<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    updateStore: () =>void
) : Promise<ParseNode[] | undefined> {
    return new Promise((resolve, reject) => {
        if(!localStorage) {
            reject("Local storage not available");
        }
        const graph = localStorage.getItem(fileName);
        if(graph) {
            importGraph(JSON.parse(graph), editor, engine, area, updateStore)
                .then(() => {
                    resolve(createJSONGraph(editor));
                })
                .catch(() => {
                    reject("Failed to load graph from existing file");
                });
        } else {
            reject("No graph found");
        }
    });
}


/**
 * Saves the current graph to the browser's local storage.
 * @param fileName name of the file to save
 * @param onOverwriteVerification function to call to verify if the user wants to overwrite the file
 * @param editor editor
 */
async function saveGraphToLocalStorage(
    fileName: string,
    onOverwriteVerification: ()=>boolean = ()=>true,
    editor: NodeEditor<Schemes>
): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const data = exportGraph(editor)
            if (localStorage) {
                if(localStorage.getItem(fileName) &&
                    !onOverwriteVerification()) {
                    reject();
                } else {
                    localStorage.setItem(fileName, JSON.stringify(data));
                    resolve();
                }
            } else {
                reject("Local storage not available");
            }
        } catch (e) {
            console.log("error", e)
        }

        // exportGraph(editor)
        //     .catch((e) => console.log("error", e))
        //     .then((data) => {
        //             if (localStorage) {
        //                 if(localStorage.getItem(fileName) &&
        //                     !onOverwriteVerification()) {
        //                     reject();
        //                 } else {
        //                     localStorage.setItem(fileName, JSON.stringify(data));
        //                     resolve();
        //                 }
        //             } else {
        //                 reject("Local storage not available");
        //             }
        //         }
        //     );
    });
}


/**
 * Creates a context menu for use with the area plugin. Allows the user to create
 * new nodes with the set schemes.
 * @param editor
 * @param area
 * @param updateDataFlow
 * @param updateStore
 */
function createContextMenu(
    editor: NodeEditor<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    updateDataFlow: () => void,
    updateStore: () => void
) : ContextMenuPlugin<Schemes> {
    // NB: For a node to be copyable, it must implement clone() in a way
    // that does not require 'this' to be valid in its context.
    const updateNodeRender =
        (id: string) => { area.update("node", id) }
    return new ContextMenuPlugin<Schemes>({
        items: ContextMenuPresets.classic.setup([
            ["Math",
                [["Number", () => new NumberNode(0, updateNodeRender, updateDataFlow)],
                ["Add", () => new BinaryNode(NodeType.Add, updateNodeRender)],
                ["Sub", () => new BinaryNode(NodeType.Sub, updateNodeRender)],
                ["Mul", () => new BinaryNode(NodeType.Mul, updateNodeRender)],
                ["Pow", () => new BinaryNode(NodeType.Pow, updateNodeRender)],
                ["Div", () => new BinaryNode(NodeType.Div, updateNodeRender)],
                ["Sum", () => new NaryNode(NodeType.Sum, updateNodeRender)],
                ["Prod", () => new NaryNode(NodeType.Prod, updateNodeRender)]]],
            ["Inputs",
                [["Dropdown", () => new DropdownInputNode(updateNodeRender, updateDataFlow, updateStore)],
                ["Number", () => new NumberInputNode(updateNodeRender, updateDataFlow, updateStore)],]],
            ["Output", () => new OutputNode(updateNodeRender, updateDataFlow)],
            ["Pie Display", ()=> new DisplayPieNode(updateNodeRender, updateStore)],
            // ["Label", ()=> new LabelNode(onInputChange)]
        ])
    });
}




/**
 * Creates a new editor and returns a promise with an object containing functions to
 * control the editor.
 * @param container HTML element to contain the editor
 * @returns Promise with an object containing functions destroy(), load(), save(), clear() and testJSON()
 */
export async function createEditor(container: HTMLElement) {
    const editor = new NodeEditor<Schemes>();
    const area = new AreaPlugin<Schemes, AreaExtra>(container);
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
    const arrange = new AutoArrangePlugin<Schemes>();
    const engine = new DataflowEngine<Schemes>();
    const scopes = new ScopesPlugin<Schemes>();


    let selectedNode: string = "";
    const onReteStateChangeWrapper = {
        call: ()=>{}
    }


    AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
        accumulating: AreaExtensions.accumulateOnCtrl()
    });

    render.addPreset(
        Presets.classic.setup({
            customize: {
                control(data) {
                    switch(data.payload.type) {
                        case NodeType.Display: return DisplayPieNodeControlContainer
                        case NodeType.NumberInput: return NumberInputControlContainer
                        case NodeType.DropdownInput: return DropdownInputControlContainer
                        case NodeType.Output: return OutputNodeControlContainer
                    }
                    return NumberControlComponent;
                },
                node() {
                    // Custom node goes here
                    return Presets.classic.Node;
                }
            }
        })
    );


    // context menu can be customized here by adding a Customize object inside
    // object passed to setup(), with customize : { ... }
    render.addPreset(Presets.contextMenu.setup({delay:10}));



    connection.addPreset(ConnectionPresets.classic.setup());
    arrange.addPreset(ArrangePresets.classic.setup());

    editor.use(area);
    editor.use(engine);
    editor.addPipe((context) => {
        if (["connectioncreated", "connectionremoved"].includes(context.type)) {
            process(engine, editor)();
            currentJSONTree = createJSONGraph(editor);
        }
        return context;
    });

    scopes.addPreset(ScopesPresets.classic.setup());


    area.use(connection);

    const updateParseTree = ()=> {
        console.log('updating currentJSONTree');
        currentJSONTree = createJSONGraph(editor)
        onReteStateChangeWrapper.call();
    }

    area.use(createContextMenu(editor, area, process(engine, editor), updateParseTree));
    area.use(render);

    area.use(scopes);

    area.use(arrange);


    // For testing purposes
    let currentJSONTree: ParseNode[] | undefined;


    area.addPipe((context)=> {
        if(context.type === "nodepicked") {
            selectedNode = context.data.id;
        }
        if (context.type === "nodetranslated") {
            const x = context.data.position.x;
            const y = context.data.position.y;
            const node = editor.getNode(context.data.id);
            node.yTranslation = y;
            node.xTranslation = x;
        }
        return context;
    })



    AreaExtensions.zoomAt(area, editor.getNodes()).then(() => {});




    return {
        destroy: () => area.destroy(),
        load: async (
            onLoading: ()=>void = ()=>{},
            onLoaded: ()=>void = ()=>{},
            onUnsavedProgress: ()=>void = ()=>{},
            onPotentialOverwrite: ()=>void = ()=>{},
            onFailedToLoad: ()=>void = ()=>{}
        ) => {
            engine.reset();
            onLoading();
            await editor.clear();

            loadGraphFromLocalStorage("graph", editor, engine, area, updateParseTree)
                .then(async () => {
                    onLoaded();
                    currentJSONTree = createJSONGraph(editor);
                    onReteStateChangeWrapper.call();
                })
                .catch(() => {onFailedToLoad()});
        },
        save: () => {
            saveGraphToLocalStorage(
                "graph",
                ()=>{return window.confirm("Overwrite existing graph?");},
                editor
            )
                .then(() => {
                    console.log("Saved");
                })
                .catch(() => {
                    console.log("Failed to save");
                });
        },
        clear: () =>  {

            editor.clear();
        },
        import: (data: any) => {
            importGraph(data, editor, engine, area, updateParseTree)
        },
        export: () => {
            return {
                graph: exportGraph(editor),
                parseNodes: currentJSONTree ?? []
            }
        },
        testJSON: () => {
            currentJSONTree = createJSONGraph(editor);
            console.log(JSON.stringify(currentJSONTree, null, 2));
            return currentJSONTree;
        },
        deleteSelected: async () => {
            if(editor.getNode(selectedNode)) {
                const connections = editor.getConnections().filter(c => {
                    return c.source === selectedNode || c.target === selectedNode
                })
                for (const connection of connections) {
                    await editor.removeConnection(connection.id)
                }
                editor.removeNode(selectedNode).then(()=>{});
            }
        },
        registerCallBack(newCallback: () => void) {
            onReteStateChangeWrapper.call = newCallback;
        },
        viewControllers: {
            resetView: () => {
                AreaExtensions.zoomAt(area, editor.getNodes()).then(() => {});
            },
            focusSelectedNode: () => {
                AreaExtensions.zoomAt(area, [editor.getNode(selectedNode)]).catch(()=>{}).then(() => {});
            },
        },
        getCurrentTree: ()=> currentJSONTree
    } as ReteFunctions;
}


export interface ReteFunctions {
    destroy: () => void,
    load: (onLoading?: () => void, onLoaded?: () => void, onUnsavedProgress?: () => void, onPotentialOverwrite?: () => void, onFailedToLoad?: () => void) => Promise<void>,
    save: () => void,
    clear: () => void,
    import: (data: any) => void,
    export: () => {graph: any, parseNodes: ParseNode[]},
    testJSON: () => ParseNode[] | undefined,
    deleteSelected: () => void,
    registerCallBack: (newCallback: () => void) => void,
    viewControllers: {
        resetView: () => void,
        focusSelectedNode: () => void
    },
    getCurrentTree: () => ParseNode[] | undefined
}