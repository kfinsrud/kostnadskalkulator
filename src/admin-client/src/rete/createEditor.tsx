import {ParseNode, treeStateFromData} from "@skogkalk/common/dist/src/parseTree";
import {Editor, EditorDataPackage} from "./editor";

/**
 * Creates a new editor and returns a promise with an object containing functions to
 * control the editor.
 * @param container HTML element to contain the editor
 * @returns Promise with an object containing functions destroy(), load(), save(), clear() and testJSON()
 */
export async function createEditor(container: HTMLElement) {

    const editor = new Editor(container);

    return {
        destroy: ()=> {editor.destroyArea()},
        load: async () => {
            if(localStorage) {
                const data = localStorage.getItem('graph');
                if(data) {
                    const parsedData = JSON.parse(data);
                    console.log("load", parsedData);
                    if(parsedData.main === undefined) {
                        throw new Error("No main in loaded data");
                    }
                    if(parsedData.modules === undefined) {
                        throw new Error("No modules in loaded data");
                    }
                    editor.importWithModules(JSON.parse(data));
                }
            }
        },
        save: () => {
            if(localStorage) {
                editor.exportWithModules().then(data=>{
                    localStorage.setItem('graph', JSON.stringify(data));
                });
            }
        },
        clear: () =>  {
            editor.clearNodes();
        },
        import: (data: EditorDataPackage) => {
            editor.importWithModules(data);
        },
        export: async () => {
            const nodes = await editor.exportAsParseTree();
            return {
                graph: await editor.exportWithModules(),
                parseNodes: nodes ?? []
            }
        },
        testJSON: () => {
            editor.exportAsParseTree().then(
                data=>console.log(treeStateFromData(data)?.subTrees)
            );
        },
        deleteSelected: async () => {
            editor.deleteSelected().then();
        },
        registerCallBack: (id: string, newCallback: (nodes?: ParseNode[]) => void) => {
            editor.registerOnChangeCallback({id: id, call: newCallback})
        },
        viewControllers: {
            resetView: () => {
                editor.resetView();
            },
            focusSelectedNode: () => {
                editor.focusViewOnSelectedNode();
            },
        },
        getCurrentTree: ()=> {
            return editor.exportAsParseTree();
        },
        editor: editor
    } as ReteFunctions;
}


export interface ReteFunctions {
    destroy: () => void,
    load: (onLoading?: () => void, onLoaded?: () => void, onUnsavedProgress?: () => void, onPotentialOverwrite?: () => void, onFailedToLoad?: () => void) => Promise<void>,
    save: () => void,
    clear: () => void,
    import: (data: EditorDataPackage) => void,
    export: () => Promise<{graph: EditorDataPackage, parseNodes: ParseNode[]}>,
    testJSON: () => ParseNode[] | undefined,
    deleteSelected: () => void,
    registerCallBack: (id: string, newCallback: (nodes?: ParseNode[]) => void) => void,
    viewControllers: {
        resetView: () => void,
        focusSelectedNode: () => void
    },
    getCurrentTree: () => Promise<ParseNode[] | undefined>,
    editor: Editor
}