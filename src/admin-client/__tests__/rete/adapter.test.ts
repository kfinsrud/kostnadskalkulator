import {NodeFactory} from "../../src/rete/nodeFactory";
import {ModuleManager} from "../../src/rete/moduleManager";
import {getNodeByID, NodeType, treeStateFromData} from "@skogkalk/common/dist/src/parseTree";
import {NumberNode} from "../../src/rete/nodes/mathNodes/numberNode";
import {BinaryNode} from "../../src/rete/nodes/mathNodes/binaryNode";
import {ClassicPreset, NodeEditor} from "rete";
import {Schemes} from "../../src/rete/nodes/types";
import {DataflowEngine} from "rete-engine";
import {createParseNodeGraph, flattenGraph, resolveIncomingModuleConnections} from "../../src/rete/adapters";
import {GraphSerializer} from "../../src/rete/graphSerializer";
import {createTestContext, ModuleName} from "./testUtil";


describe("treeStateFromData()", ()=>{
    it('Should handle simple math nodes', async ()=>{
        const factory = new NodeFactory(new ModuleManager());
        const left = factory.createNode(NodeType.Number) as NumberNode;
        left.controls.c.set({value: 5});
        const right = factory.createNode(NodeType.Number) as NumberNode;
        right.controls.c.set({value: 3});
        const add = factory.createNode(NodeType.Add) as BinaryNode;

        const editor = new NodeEditor<Schemes>();
        const engine = new DataflowEngine<Schemes>();
        editor.use(engine);

        await editor.addNode(left);
        await editor.addNode(right);
        await editor.addNode(add);

        await editor.addConnection(new ClassicPreset.Connection(left, 'out', add, 'left'));
        await editor.addConnection(new ClassicPreset.Connection(right, 'out', add, 'right'));
        const result = await engine.fetch(add.id);
        expect(result.out.value).toEqual(8);

        const moduleManager = new ModuleManager();
        const parseTree = await createParseNodeGraph(new GraphSerializer(editor, new NodeFactory(moduleManager)), moduleManager);
        const treeState = treeStateFromData(parseTree);
        expect(getNodeByID(treeState, add.id)?.value).toEqual(8);
    });
})




describe('flattenGraph', ()=>{
    it('should resolve connections going through a module with connected in out nodes', async ()=>{
        const { editor, engine, outputID, moduleNode } = await createTestContext(ModuleName.passThroughModule);

        const result = await engine.fetch(outputID);
        // Checks that the value has successfully passed through the module to outputNode
        expect(result.out.value).toEqual(5);

        const resolvedConnections = resolveIncomingModuleConnections(
            moduleNode,
            editor.getConnections(),
            []
        );
        // Checks that the connection going into the module has been redirected directly to outputNode
        // numberNode -> Module( ModuleInput -> ModuleOutput ) -> outputNode
        // becomes:
        // numberNode -> outputNode
        expect(resolvedConnections[0]?.target).toEqual(outputID);
        expect(resolvedConnections.length).toEqual(1);
    });

    it("Should discard connections that don't resolve to a node in the module or a node connected to a module output", async ()=>{
        const { editor, engine, outputID, moduleNode } = await createTestContext(ModuleName.deadEndModule);
        const result = await engine.fetch(outputID);
        // Checks that the output node defaults to 0 as the number 5 does not pass through the module
        expect(result.out.value).toEqual(0);

        const resolvedConnections = resolveIncomingModuleConnections(
            moduleNode,
            editor.getConnections(),
            []
        );
        // Checks that the connection going into the module has been discarded
        // numberNode -> Module( ModuleInput -/> ModuleOutput ) -> outputNode
        // becomes:
        // numberNode -/> outputNode
        expect(resolvedConnections.length).toEqual(0);
    })

    it('Should handle multiple connections from a moduleInput to multiple nodes', async ()=>{
        const { editor, engine, outputID, moduleNode } = await createTestContext(ModuleName.singleInputMultipleTargets);
        const result = await engine.fetch(outputID);
        // Checks that the value has successfully passed through the module to outputNode and has been doubled
        // by the Add node.
        expect(result.out.value).toEqual(10);

        const resolvedConnections = resolveIncomingModuleConnections(
            moduleNode,
            editor.getConnections(),
            []
        );
        // Checks that the connection going into the module has been redirected to both addNodes
        // numberNode -> Module( ModuleInput -> 2x AddNode -> ModuleOutput ) -> outputNode
        // becomes:
        //             /-> left \
        // numberNode-|          AddNode -> outputNode
        //             \-> right/
        expect(resolvedConnections.length).toEqual(3);
    });


})

describe('createParseGraph', ()=>{
    it('should handle graph with a properly connected module', async ()=>{
        const { factory, editor, engine, outputID, moduleManager } = await createTestContext(ModuleName.passThroughModule);
        const result = await engine.fetch(outputID);
        const serializer = new GraphSerializer(editor, factory)
        const treeData = await createParseNodeGraph(serializer, moduleManager);
        const flattened = await flattenGraph(serializer, moduleManager);
        expect(flattened.nodes.length).toEqual(2);
        expect(flattened.connections.length).toEqual(1);
        const treeState = treeStateFromData(treeData);
        expect(getNodeByID(treeState, outputID)?.value).toEqual(result.out.value);
    })

    it('should handle module with doubly connected add node', async ()=>{
        const { factory, editor, engine, outputID, moduleManager } = await createTestContext(ModuleName.singleInputMultipleTargets);
        const result = await engine.fetch(outputID);
        const serializer = new GraphSerializer(editor, factory)
        const treeData = await createParseNodeGraph(serializer, moduleManager);
        const flattened = await flattenGraph(serializer, moduleManager);
        expect(flattened.nodes.length).toEqual(3);
        expect(flattened.connections.length).toEqual(3);
        const treeState = treeStateFromData(treeData);
        expect(getNodeByID(treeState, outputID)?.value).toEqual(result.out.value);
    })

    it('should handle nested modules', async ()=>{
        const { factory, editor, engine, outputID, moduleManager } = await createTestContext(ModuleName.nestedModule);

        const serializer = new GraphSerializer(editor, factory)
        const flattened = await flattenGraph(serializer, moduleManager);
        expect(flattened.nodes.length).toEqual(3);
        expect(flattened.connections.length).toEqual(3);

        const treeData = await createParseNodeGraph(serializer, moduleManager);

        const treeState = treeStateFromData(treeData);

        const result = await engine.fetch(outputID);
        expect(getNodeByID(treeState, outputID)?.value).toEqual(result.out.value);
    })
})