import {ClassicPreset, getUID, NodeEditor} from "rete";
import {Connection, ConnProps, ReteNode, Schemes} from "./nodes/types";
import {AreaPlugin} from "rete-area-plugin";
import {NumberNode} from "./nodes/mathNodes/numberNode";
import {BinaryNode} from "./nodes/mathNodes/binaryNode";
import {NodeFactory} from "./nodeFactory";
import {NodeType} from "@skogkalk/common/dist/src/parseTree";
import {ChooseNode} from "./nodes/controlNodes/chooseNode";
import {ModuleNode} from "./nodes/moduleNodes/moduleNode";

export interface SerializedNode {
    labelOverride?: string,
    id: string;
    label: string;
    xy: [number, number];
    type: string;
    outputs: Record<string, any>;
    inputs: Record<string, any>;
    controls: Record<string, any>;
    connections: any[];
}

export interface SerializedGraph {
    nodes: SerializedNode[];
}

/**
 * Class responsible for writing and reading graph state to a parseable format.
 */
export class GraphSerializer {
    constructor(
        private editor: NodeEditor<Schemes>,
        private factory: NodeFactory,
        private area?: AreaPlugin<Schemes, any>
    ) {}

    /**
     * imports nodes from data exported by exportNodes
     * @param originalData
     * @param freshIDs if true, IDs are replaced with new UIDs
     */
    public importNodes(originalData: SerializedGraph, freshIDs?: boolean){
        return new Promise<void>(async (resolve, reject) => {

            if(!originalData) {
                reject();
                return;
            }

            let deepDataCopy = JSON.parse(JSON.stringify(originalData))


            let totalConnections: ConnProps[]  = [];

            const oldToNewIDMapping = new Map<string, string>();

            for (const { id, controls, type, xy , connections, labelOverride} of deepDataCopy.nodes) {

                let node = this.factory.createNode(type, id);

                node.deserializeControls(controls);
                node.xTranslation = xy[0];
                node.yTranslation = xy[1];
                node.labelOverride = labelOverride;
                if(freshIDs !== undefined && freshIDs){
                    const newID = getUID();
                    oldToNewIDMapping.set(node.id, newID);
                    node.id = newID;
                }

                totalConnections.push(...connections);

                await this.editor.addNode(node);
                if(this.area) {
                    await this.area.translate(node.id, { x: node.xTranslation, y: node.yTranslation });
                }
                if(node.type === NodeType.Module) {
                    await (node as ModuleNode).setModuleAndRefreshPorts()
                }
            }

            for (const connection of totalConnections) {
                if(freshIDs) {
                    const source = oldToNewIDMapping.get(connection.source);
                    if(!source) {reject("couldn't find source" + connection); return;}
                    const target = oldToNewIDMapping.get(connection.target);
                    if(!target) {reject("couldn't find target" + connection); return;}
                    connection.source = source!;
                    connection.target = target!;
                }
                await this.editor.addConnection(connection)
                    .catch((e) => {reject(e); return;})
                    .then((added) => {
                        if(!added) {
                            reject("Failed to add connection" + connection);
                            return;
                        }
                    });
            }

            if(freshIDs) {
                for(const node of this.editor.getNodes()) {
                    if(node.type === NodeType.Choose) {
                        const count =(node as ChooseNode).controls.c.get('comparisonCount');
                        for(let i = 0; i < count; i++) {
                            const control = (node as ChooseNode).getInputControlByIndex(i);
                            control?.set({sourceID: oldToNewIDMapping.get(control?.get('sourceID') || "")})
                        }
                    }
                }
            }

            resolve(); return;
        });
    }


    /**
     * Exports node structure as a data structure that can later be read with importNodes()
     */
    public exportNodes() : SerializedGraph {

        const data: SerializedGraph = { nodes: [] };
        const nodes = this.editor.getNodes() as ReteNode[];
        const connections = this.editor.getConnections() as Connection<NumberNode, BinaryNode>[];

        for (const node of nodes) {
            const inputsEntries = Object.entries(node.inputs).map(([key, input]) => {
                return [key, input && this.serializePort(input)];
            });
            const outputsEntries = Object.entries(node.outputs).map(([key, output]) => {
                return [key, output && this.serializePort(output)];
            });

            data.nodes.push({
                labelOverride: node.labelOverride,
                id: node.id,
                label: node.label,
                xy: [node.xTranslation, node.yTranslation],
                type: node.type,
                outputs: Object.fromEntries(outputsEntries),
                inputs: Object.fromEntries(inputsEntries),
                controls: node.serializeControls(),
                connections: []
            });

            data.nodes.map((node: any) => {
                for(const connection of connections){
                    if(
                        connection.source === node.id &&
                        node.connections.find((e:any)=>e.id === connection.id) === undefined
                    ) {
                        node.connections.push(this.serializeConnection(connection));
                    }
                }
                return node;
            });
        }
        return data;
    }

    private serializePort(
        port:
            | ClassicPreset.Input<ClassicPreset.Socket>
            | ClassicPreset.Output<ClassicPreset.Socket>
    ) {
        return {
            id: port.id,
            label: port.label,
            socket: {
                name: port.socket.name
            }
        };
    }


    private serializeConnection(
        connection: Connection<NumberNode, BinaryNode>
    ) {
        return {
            id: connection.id,
            source: connection.source,
            sourceOutput: connection.sourceOutput,
            target: connection.target,
            targetInput: connection.targetInput
        };
    }
}

