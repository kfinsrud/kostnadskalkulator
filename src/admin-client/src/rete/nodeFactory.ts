import {ModuleManager} from "./moduleManager";
import {NodeType} from "@skogkalk/common/dist/src/parseTree";
import {ModuleOutput} from "./nodes/moduleNodes/moduleOutput";
import {ModuleNode} from "./nodes/moduleNodes/moduleNode";
import {ModuleInput} from "./nodes/moduleNodes/moduleInput";
import {OutputNode} from "./nodes/IONodes/outputNode/outputNode";
import {NumberNode} from "./nodes/mathNodes/numberNode";
import {NumberInputNode} from "./nodes/IONodes/numberInputNode/numberInputNode";
import {DropdownInputNode} from "./nodes/IONodes/dropdownInputNode/dropdownInputNode";
import {DisplayPieNode} from "./nodes/displayNodes/displayPieNode/displayPieNode";
import {DisplayBarNode} from "./nodes/displayNodes/displayBarNode/displayBarNode";
import {BinaryNode} from "./nodes/mathNodes/binaryNode";
import {NaryNode} from "./nodes/mathNodes/naryNode";
import {ChooseNode} from "./nodes/controlNodes/chooseNode";
import {DisplayPreviewNode} from "./nodes/displayNodes/displayPreviewNode/displayPreviewNode";
import {DisplayListNode} from "./nodes/displayNodes/displayListNode/displayListNode";
import {GraphDisplayNode} from "./nodes/displayNodes/graphDisplayNode/graphDisplayNode";
import {NodeAction} from "./nodeActions";
import {UnaryNode} from "./nodes/mathNodes/unaryNode";
import {CommentNode} from "./nodes/utility/commentNode";


export class NodeFactory {
    constructor(
        private moduleManager: ModuleManager,
        private dispatch: (action: NodeAction) => void = ()=>{}
    ) {}

    public createNode(type: NodeType, id?: string) {
        switch(type) {
            case NodeType.ModuleOutput: return new ModuleOutput(this.dispatch, "", id);
            case NodeType.Module: return new ModuleNode(this.moduleManager, this.dispatch, id);
            case NodeType.ModuleInput: return new ModuleInput(this.dispatch, "", id)
            case NodeType.Output: return new OutputNode(this.dispatch, id);
            case NodeType.Number: return new NumberNode(0, this.dispatch, id);
            case NodeType.NumberInput: return new NumberInputNode(this.dispatch, id);
            case NodeType.DropdownInput: return new DropdownInputNode(this.dispatch, id);
            case NodeType.PieDisplay: return new DisplayPieNode(this.dispatch, id);
            case NodeType.BarDisplay: return new DisplayBarNode(this.dispatch, id);
            case NodeType.PreviewDisplay: return new DisplayPreviewNode(this.dispatch, id);
            case NodeType.ListDisplay: return new DisplayListNode(this.dispatch, id);
            case NodeType.GraphDisplay: return new GraphDisplayNode(this.dispatch, id);
            case NodeType.Add: return new BinaryNode(NodeType.Add, this.dispatch, id);
            case NodeType.Sub: return new BinaryNode(NodeType.Sub, this.dispatch, id);
            case NodeType.Mul: return new BinaryNode(NodeType.Mul, this.dispatch, id);
            case NodeType.Pow: return new BinaryNode(NodeType.Pow, this.dispatch, id);
            case NodeType.Div: return new BinaryNode(NodeType.Div, this.dispatch, id);
            case NodeType.Sqrt: return new BinaryNode(NodeType.Sqrt, this.dispatch, id);
            case NodeType.Sum: return new NaryNode(NodeType.Sum, this.dispatch, id);
            case NodeType.Prod: return new NaryNode(NodeType.Prod, this.dispatch, id);
            case NodeType.Min: return new NaryNode(NodeType.Min, this.dispatch, id);
            case NodeType.Max: return new NaryNode(NodeType.Max, this.dispatch, id);
            case NodeType.Choose: return new ChooseNode(this.dispatch,id);
            case NodeType.Exp: return new UnaryNode(NodeType.Exp, this.dispatch, id);
            case NodeType.Ceil: return new UnaryNode(NodeType.Ceil, this.dispatch, id);
            case NodeType.Floor: return new UnaryNode(NodeType.Floor, this.dispatch, id);
            case NodeType.Round: return new UnaryNode(NodeType.Round, this.dispatch, id);
            case NodeType.Comment: return new CommentNode(this.dispatch, id);
        }
        throw new Error("NodeFactory.createNode() was invoked with " + type + " which has no implementation in createNode().");
    }
}