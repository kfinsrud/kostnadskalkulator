import {NodeType} from "@skogkalk/common/dist/src/parseTree";
import {NodeFactory} from "../../src/rete/nodeFactory";
import {ModuleManager} from "../../src/rete/moduleManager";
import {ModuleOutput} from "../../src/rete/nodes/moduleNodes/moduleOutput";
import {ModuleNode} from "../../src/rete/nodes/moduleNodes/moduleNode";
import {ModuleInput} from "../../src/rete/nodes/moduleNodes/moduleInput";
import {OutputNode} from "../../src/rete/nodes/IONodes/outputNode/outputNode";
import {NumberNode} from "../../src/rete/nodes/mathNodes/numberNode";
import {NumberInputNode} from "../../src/rete/nodes/IONodes/numberInputNode/numberInputNode";
import {DropdownInputNode} from "../../src/rete/nodes/IONodes/dropdownInputNode/dropdownInputNode";
import {DisplayPieNode} from "../../src/rete/nodes/displayNodes/displayPieNode/displayPieNode";
import {BinaryNode} from "../../src/rete/nodes/mathNodes/binaryNode";
import {ChooseNode} from "../../src/rete/nodes/controlNodes/chooseNode";
import {DisplayBarNode} from "../../src/rete/nodes/displayNodes/displayBarNode/displayBarNode";
import {DisplayPreviewNode} from "../../src/rete/nodes/displayNodes/displayPreviewNode/displayPreviewNode";
import {DisplayListNode} from "../../src/rete/nodes/displayNodes/displayListNode/displayListNode";
import {NaryNode} from "../../src/rete/nodes/mathNodes/naryNode";

describe('NodeFactory', () => {
    it('should create a valid class object for each NodeType except a Reference or Root', () => {
        const factory = new NodeFactory(new ModuleManager());
        Object.values(NodeType).forEach((type) => {
            if(type === NodeType.Reference || type === NodeType.Root) return;
            expect(() => factory.createNode(type)).not.toThrow();
        });

        expect(factory.createNode(NodeType.ModuleOutput)).toBeInstanceOf(ModuleOutput);
        expect(factory.createNode(NodeType.Module)).toBeInstanceOf(ModuleNode);
        expect(factory.createNode(NodeType.ModuleInput)).toBeInstanceOf(ModuleInput);
        expect(factory.createNode(NodeType.Output)).toBeInstanceOf(OutputNode);
        expect(factory.createNode(NodeType.Number)).toBeInstanceOf(NumberNode);
        expect(factory.createNode(NodeType.NumberInput)).toBeInstanceOf(NumberInputNode);
        expect(factory.createNode(NodeType.DropdownInput)).toBeInstanceOf(DropdownInputNode);
        expect(factory.createNode(NodeType.PieDisplay)).toBeInstanceOf(DisplayPieNode);
        expect(factory.createNode(NodeType.BarDisplay)).toBeInstanceOf(DisplayBarNode);
        expect(factory.createNode(NodeType.PreviewDisplay)).toBeInstanceOf(DisplayPreviewNode);
        expect(factory.createNode(NodeType.ListDisplay)).toBeInstanceOf(DisplayListNode);
        expect(factory.createNode(NodeType.Add)).toBeInstanceOf(BinaryNode);
        expect(factory.createNode(NodeType.Prod)).toBeInstanceOf(NaryNode);
        expect(factory.createNode(NodeType.Choose)).toBeInstanceOf(ChooseNode);
    });

    it('should throw an error when creating a node with an invalid NodeType', () => {
        const factory = new NodeFactory(new ModuleManager());
        expect(() => factory.createNode('invalid' as NodeType)).toThrow();
        expect(() => factory.createNode(NodeType.Reference)).toThrow();
        expect(() => factory.createNode(NodeType.Root)).toThrow();
    });
});