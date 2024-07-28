import {ConnProps, ParseableNode, ReteNode, Schemes} from "./nodes/types";
import {getUID, NodeEditor} from "rete";
import {NodeType, ParseNode, ReferenceNode} from "@skogkalk/common/dist/src/parseTree";
import {ModuleNode} from "./nodes/moduleNodes/moduleNode";
import {ModuleInput} from "./nodes/moduleNodes/moduleInput";
import {ModuleOutput} from "./nodes/moduleNodes/moduleOutput";
import {GraphSerializer} from "./graphSerializer";
import {NodeFactory} from "./nodeFactory";
import {ModuleManager} from "./moduleManager";
import {ChooseNode} from "./nodes/controlNodes/chooseNode";


interface NodeConnection {
    id: string
    unaryInput?: string
    left?: string
    right?: string
    child?: string
    inputs?: string[]
}


function split<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
    const left: T[] = [];
    const right: T[] = [];
    arr.forEach((item) => {
        if (predicate(item)) {
            left.push(item);
        } else {
            right.push(item);
        }
    });
    return [left, right];
}


/**
 * Recursively searches for the presence of a named module in a graph
 * @param name
 * @param nodes
 */
export function detectModule(name: string, nodes: ReteNode[]) {
    const modules = nodes.filter(node=>{return node instanceof ModuleNode})
    modules.some(module=>{
        return (module as ModuleNode).controls.c.get('currentModule') === name || detectModule(name, (module as ModuleNode).getNodes())
    })
    return false;
}



/**
 *
 * @param moduleNode
 * @param externalIOConnections
 */
export function resolveIncomingModuleConnections(moduleNode: ModuleNode,  externalIOConnections: ConnProps[], externalNodes: ReteNode[]) {
    const internalNodes = moduleNode.getNodes();
    const internalIOConnections = moduleNode.getConnections();
    const resolvedInputConnections : ConnProps[] = []


    const inputConnections = externalIOConnections.filter(connection=>{return connection.target === moduleNode.id});

    inputConnections.forEach( inputConnection => {
        // finds the ModuleInput node associated with the Module input targeted by connection
        const inputNode = internalNodes.find( node=>
            node.type === NodeType.ModuleInput &&
            (node as ModuleInput).controls.c.get('inputName') === inputConnection.targetInput
        );
        if(inputNode) {
            // finds the connection going from the associated ModuleInput to another node
            const connectionsFromModuleInput = internalIOConnections.filter(conn=>conn.source === inputNode.id);
            connectionsFromModuleInput.forEach(connectionFromModuleInput=>{
                const moduleInputTargetNode = internalNodes.find(node=>node.id === connectionFromModuleInput.target);
                if(moduleInputTargetNode) {
                    if(moduleInputTargetNode.type === NodeType.ModuleOutput) {
                        // finds the outgoing connection matching the targeted ModuleOutput
                        const outputConnections = externalIOConnections.filter(conn=>
                            conn.sourceOutput === (moduleInputTargetNode as ModuleOutput).controls.c.get('outputName'));
                        outputConnections.forEach((outputConnection)=>{
                            //Case: Incoming connection has been rerouted to the target of a moduleOutput
                            // @ts-ignore
                            resolvedInputConnections.push({
                                id: getUID(),
                                source: inputConnection.source,
                                target: outputConnection.target,
                                sourceOutput: inputConnection.sourceOutput,
                                targetInput: outputConnection.targetInput
                            })
                        });
                    } else {
                        //Case: Incoming connection has been rerouted to a regular node in the module
                        // @ts-ignore
                        resolvedInputConnections.push({
                            id: getUID(),
                            source: inputConnection.source,
                            target: connectionFromModuleInput.target,
                            sourceOutput: inputConnection.sourceOutput,
                            targetInput: connectionFromModuleInput.targetInput
                        })
                        if(moduleInputTargetNode.type === NodeType.Choose) {
                            const comparisons = (moduleInputTargetNode as ChooseNode).getComparisonControls();
                            const oldComparison = comparisons.find( c => c.sourceID === inputConnection.target);
                            if(oldComparison) {
                                oldComparison.sourceID = inputConnection.source;
                            }
                        }
                    }
                } else {
                    throw new Error ("resolveIncomingModuleConnections: targeted node does not exist in internalIONodes")
                }
            });
        }
    });

    const outputConnections = externalIOConnections
        .filter(connection=>{return connection.source === moduleNode.id});
    outputConnections.forEach((outputConnection)=> {
        // only interested in resolving a connection if it goes to a regular node in the module.
        // Other cases are handled in the input connection resolution.
        const moduleOutputNode = internalNodes
            .find( node =>
                outputConnection.sourceOutput === (node as ModuleOutput).controls.c.get('outputName')
            );
        if(moduleOutputNode) {
            const moduleOutputInternalConnection = internalIOConnections.find(conn=>conn.target === moduleOutputNode.id);
            if(moduleOutputInternalConnection === undefined) {
                return;
            }
            const connectionSourceNode = internalNodes.find(node=>node.id === moduleOutputInternalConnection.source);
            if(connectionSourceNode?.type === NodeType.ModuleInput) {
                return;
            }
            // @ts-ignore
            resolvedInputConnections.push({
                id: getUID(),
                source: moduleOutputInternalConnection.source,
                target: outputConnection.target,
                sourceOutput: moduleOutputInternalConnection.sourceOutput,
                targetInput: outputConnection.targetInput
            })
            const targetNode = externalNodes.find(n=>n.id === outputConnection.target);
            if(targetNode && targetNode.type === NodeType.Choose) {
                if(outputConnection.targetInput.startsWith("input")) {
                    const inputNumber = (outputConnection.targetInput || "").replace("input", "");
                    const nr = Number.parseInt(inputNumber);
                    console.log("intputnr", inputNumber);
                    const control = (targetNode as ChooseNode).getInputControlByIndex(nr);
                    if(control) {
                        control.setNoUpdate({sourceID: moduleOutputInternalConnection.source})
                    }
                }
            }
        }
    });

    return resolvedInputConnections;
}


function getModuleNonIONodesAndConnections(moduleNode: ModuleNode) {
    const nodes = moduleNode.getNodes();
    const inOutNodes = nodes.filter((node)=> {
        return node instanceof ModuleInput || node instanceof ModuleOutput;
    });
    const inOutNodeIDs = inOutNodes.map(node=>node.id);
    const connections = moduleNode.getConnections();
    return {
        connections: connections.filter((connection)=>{
            return !(inOutNodeIDs.includes(connection.target) || inOutNodeIDs.includes(connection.source));
        }),
        nodes: nodes.filter(node=>!(inOutNodeIDs.includes(node.id)))
    }
}


export async function flattenGraph(serializer: GraphSerializer, moduleManager: ModuleManager) {
    // serializer is used to create a copy of the graph to avoid modifying the original.
    const editor = new NodeEditor<Schemes>();
    const factory = new NodeFactory(moduleManager);
    const copySerializer = new GraphSerializer(editor, factory);
    await copySerializer.importNodes(serializer.exportNodes());

    // in case of ModuleInputs or ModuleOutputs in main graph, ignore.
    const [initialNodes, invalidNodes] = split(editor.getNodes(), n=>!(n instanceof ModuleOutput || n instanceof ModuleInput));
    const [initialConnections] = split(editor.getConnections(), conn=>!invalidNodes.some(node=>node.id == conn.target || node.id == conn.source));

    let [moduleNodes, regularNodes] = split(initialNodes, (node)=>{
        return node instanceof ModuleNode;
    });

    let [moduleConnections, regularConnections] = split(initialConnections, (connection)=>{
        return moduleNodes.find(node=>node.id === connection.target || node.id === connection.source) !== undefined;
    });


    while(moduleNodes.length > 0) {
        // grab the top module from the stack
        const moduleNode = moduleNodes.pop();
        if(moduleNode===undefined) break;
        //separate out connections for current module

        await (moduleNode as ModuleNode).setModuleAndRefreshPorts();
        let [currentModuleConnections, remainingModuleConnections] = split(moduleConnections, (connection)=>{
            return moduleNode.id === connection.target || moduleNode.id === connection.source;
        })

        moduleConnections = remainingModuleConnections;
        // get the internal nodes and connections from module
        let {nodes, connections} = getModuleNonIONodesAndConnections(moduleNode as ModuleNode);
        // sort internal module nodes and insert into regularNodes and moduleNodes.
        nodes.forEach((node)=>{
            if(node instanceof ModuleNode) {
                moduleNodes.push(node);
            } else {
                regularNodes.push(node);
            }
        })

        // resolve connections from nodes connected to module
        const resolvedConnections = resolveIncomingModuleConnections(moduleNode as ModuleNode, currentModuleConnections, regularNodes);
        // sort resolvedConnections into regular connections or module connections.
        for(const connection of resolvedConnections) {
            const node = moduleNodes.find((node)=>{
                return node.id === connection.target || node.id === connection.source
            })
            if(node === undefined) {
                regularConnections.push(connection);
            } else {
                moduleConnections.push(connection);
            }
        }

        for(const connection of connections) {
            const node = moduleNodes.find((node)=>{
                return node.id === connection.target || node.id === connection.source
            })
            if(node === undefined) {
                regularConnections.push(connection);
            } else {
                moduleConnections.push(connection);
            }
        }
    }
    return { nodes: regularNodes, connections: regularConnections }
}


export async function createParseNodeGraph(serializer: GraphSerializer, moduleManager: ModuleManager ) {
    let subtrees: ParseNode[] = [];


    const flattened = await flattenGraph(serializer, moduleManager);


    const nodes = flattened.nodes;

    const connProps = flattened.connections;

    const idToNodeConnection = new Map(nodes.map((node) => {
        const parsed: NodeConnection = {
            id: (node.id)
        }
        return [node.id, parsed]
    }));

    let nodeParentCount = new Map(nodes.map((node) => [node.id, 0]));

    // iterates through connections, setting up child ids for parent nodes
    // on NodeConnection objects.
    connProps.forEach((connection) => {
        let parentNode = idToNodeConnection.get(connection.target);
        const targetPortName = connection.targetInput;


        if(parentNode !== undefined) {
            if(targetPortName === "result") {
                parentNode.child = connection.source;
            } else if(targetPortName === "left") {
                parentNode.left = connection.source;
            } else if(targetPortName === "right") {
                parentNode.right = connection.source;
            } else if(targetPortName === "unaryInput") {
                parentNode.unaryInput = connection.source;
            } else {
                if(parentNode.inputs !== undefined) {
                    parentNode.inputs.push(connection.source)
                } else {
                    parentNode.inputs = [connection.source]
                }
            }

            // target on ConnProp is id of the parent node when translating to ParseNode tree
            idToNodeConnection.set(connection.target, parentNode);
        }

        nodeParentCount.set(connection.source, (nodeParentCount.get(connection.source) ?? 0) + 1);
    });

    const idToParseableNode = new Map((nodes as ParseableNode[]).map((node) => [node.id, {node: node, isRoot: isSubTreeRoot(node, nodeParentCount.get(node.id) || 0)}]));
    nodes.forEach((node) => { // Inserts roots and populates these.
        if (isSubTreeRoot(node, nodeParentCount.get(node.id) || 0)) {
            const subTree = populateTree( idToNodeConnection.get(node.id) ?? {id: node.id}, idToNodeConnection, idToParseableNode )
            subtrees.push(subTree);
        }
    });

    return subtrees;
}

function isSubTreeRoot(node: ReteNode, parentCount: number) {
    return parentCount === 0 || parentCount >=2 || node.type === NodeType.Root;
}


/**
 * populateTree takes a root node and attaches children sequentially until all leaf nodes
 * have been reached.
 *
 * @param startNode A node in the tree represented as a NodeConnection. Can be any node found in connections map.
 * @param nodeConnections A map of node IDs to information about the node's children IDs. The function will throw
 * if startNode cannot be found in connections.
 * @param reteNodes A map from node IDs to actual node data.
 * @return The root node of the built tree represented as a ParseNode.
 */
function populateTree(startNode: NodeConnection, nodeConnections: Map<string, NodeConnection>, reteNodes: Map<string, {node: ParseableNode, isRoot: boolean}>): ParseNode {
    const rootSkogNode = reteNodes.get(startNode.id);
    if(!rootSkogNode) { throw new Error("Start node not found in nodes map")}

    const rootNode = rootSkogNode.node.toParseNode();

    const stack: ParseNode[] = [rootNode];

    const parseNodeFromID: (id: string)=>ParseNode = (id: string) => {
        const result = reteNodes.get(id);
        if(!result) { throw new Error ("node not found in nodes map " + id)}
        const parseNode = result.node.toParseNode();
        if(result.isRoot) {
            return {
                id: getUID(),
                value: parseNode.value,
                type: NodeType.Reference,
                referenceID: result.node.id
            } as ReferenceNode
        } else {
            return parseNode;
        }
    }

    while (stack.length > 0) {
        let currentNode = stack.pop();

        if (!currentNode) {
            break;
        }

        const currentConnection = nodeConnections.get(currentNode.id);

        if (currentConnection?.unaryInput) {
            const inputNode = currentNode.input = parseNodeFromID(currentConnection.unaryInput);
            stack.push(inputNode);
        }

        if (currentConnection?.left) {
            const leftNode = currentNode.left = parseNodeFromID(currentConnection.left);
            stack.push(leftNode);
        }

        if (currentConnection?.right) {
            const rightNode = currentNode.right = parseNodeFromID(currentConnection.right);
            stack.push(rightNode);
        }

        if (currentConnection?.child) {
            const childNode = currentNode.child = parseNodeFromID(currentConnection.child);
            stack.push(childNode);
        }

        if (currentConnection?.inputs) {
            currentNode.inputs = [];
            currentConnection.inputs.forEach((nodeID)=> {
                const node = parseNodeFromID(nodeID);
                currentNode!.inputs?.push(node);
                stack.push(node);
            })
        }
    }
    return rootNode;
}




