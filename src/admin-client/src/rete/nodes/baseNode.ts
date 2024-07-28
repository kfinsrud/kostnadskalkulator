import {BaseSocket} from "../sockets";
import {ClassicPreset} from "rete";
import {DataflowNode} from "rete-engine";
import {NodeType} from "@skogkalk/common/dist/src/parseTree";
import {KeysOfType} from "./types";

import {NodeControl} from "./nodeControl";

export abstract class BaseNode<
    Inputs extends Record<string, BaseSocket>,
    Outputs extends Record<string, BaseSocket>,
    Controls extends Record<string, NodeControl<any>>
> extends ClassicPreset.Node<Inputs, Outputs, Controls> implements DataflowNode {
    labelOverride?: string;
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
     * @param id
     */
    protected constructor(
        type: NodeType,
        height: number,
        width: number,
        name?: string,
        id?: string,
    ) {
        super(name ?? type.toString());
        this.type = type;
        this.originalHeight = this.height = height;
        this.originalWidth = this.width = width;
        if (id) {
            this.id = id;
        }
    }

    abstract data(inputs: Record<KeysOfType<Inputs, any>, any[]>): Record<KeysOfType<Outputs, any>, any>;

    abstract serializeControls() : any;

    abstract deserializeControls(serializedData: any) : void;
}