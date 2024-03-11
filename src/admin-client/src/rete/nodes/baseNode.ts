import {ClassicPreset} from "rete";
import {NodeType, ParseNode} from "@skogkalk/common/dist/src/parseTree";


export class NodeControl<T extends any> extends ClassicPreset.Control{
    constructor(
        public data: T,
        public options: {
            onUpdate: (data: T) => void,
            minimized: boolean
        },
        public type: NodeType,
    ) {
        super();
    }

    public update() : void {
        this.options?.onUpdate?.(this.data);
    }
}


/**
 * Adds extra metadata properties to the Rete.js Node class.
 */
export abstract class BaseNode<
    Inputs extends Record<string, ClassicPreset.Socket>,
    Outputs extends Record<string, ClassicPreset.Socket>,
    Controls extends Record<string, NodeControl<any>>
> extends ClassicPreset.Node<Inputs, Outputs, Controls> {
    xTranslation: number = 0;
    yTranslation: number = 0;
    type: NodeType;
    width: number;
    originalWidth: number;
    height: number;
    originalHeight: number;


    /**
     *
     * @param type NodeType
     * @param height height of the node
     * @param width width of the node
     * @param name
     */
    protected constructor(
        type: NodeType,
        height: number,
        width: number,
        name?: string,
    ) {
        super(name ?? type.toString());
        this.type = type;
        this.originalHeight = this.height = height;
        this.originalWidth = this.width = width;
    }

    abstract data( inputs: any ) : any;
    abstract toParseNode() : ParseNode;
    protected abstract updateNodeRendering(nodeID: string) : void;
    protected abstract updateDataFlow() : void;
}
