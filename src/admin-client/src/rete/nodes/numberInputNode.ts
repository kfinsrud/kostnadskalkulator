import {BaseNode, NodeControl} from "./baseNode";
import {ClassicPreset} from "rete";
import {InputType, NodeType, ParseNode} from "@skogkalk/common/dist/src/parseTree";
import {NumberInputData} from "../customControls/inputNodeControls/number/numberInputControlData";
import {getLegalValueInRange, isInRange} from "../../components/input/numberInputField";
import {NumberInputNode as ParseNumberInputNode} from "@skogkalk/common/dist/src/parseTree/nodes/inputNode";


/**
 * Node whose value can be set by the user.
 */
export class NumberInputNode extends BaseNode<
    {},
    { value: ClassicPreset.Socket },
    {
        c: NodeControl<NumberInputData>
    }
> {
    legalValues: {min: number, max: number}[] = []

    constructor(
        protected updateNodeRendering: (nodeID: string) => void,
        protected updateDataFlow: () => void
    ) {
        super(NodeType.NumberInput, 400, 400, "Number Input");

        this.addControl( "c",new NodeControl(
            {
                name: "",
                simpleInput: true,
                defaultValue: 0,
                legalValues: []
            } as NumberInputData,
            {
                onUpdate: (newValue: NumberInputData) => {
                    const currentData = this.controls.c.data;
                    currentData.name = newValue.name;
                    currentData.pageName = newValue.pageName;
                    currentData.simpleInput = newValue.simpleInput;
                    currentData.infoText = newValue.infoText;
                    currentData.legalValues = newValue.legalValues;

                    if(currentData.defaultValue !== undefined && newValue.legalValues.length > 0) {
                        if(!newValue.legalValues.some((v) => {
                            return isInRange(currentData.defaultValue!, v);
                        })) {
                            currentData.defaultValue =
                                getLegalValueInRange(this.controls.c.data.defaultValue!, newValue.legalValues[0]);
                        }
                    }


                    if(this.controls.c.options.minimized) {
                        this.width = this.originalWidth * 0.7;
                        this.height = this.originalHeight * 0.5;
                    } else {
                        this.width = this.originalWidth;
                        this.height = this.originalHeight + this.controls.c.data.legalValues.length * 60;
                    }
                    updateNodeRendering?.(this.id);
                    updateDataFlow?.();
                },
                minimized: false
            },
            this.type
        ));

        this.addOutput("value", new ClassicPreset.Output(new ClassicPreset.Socket("socket"), "Number"));
    }

    data(): { value: number } {
        return {
            value: this.controls.c.data.defaultValue || 0
        };
    }

    toParseNode(): ParseNumberInputNode {
        return {
            id: this.id,
            value: this.controls.c.data.defaultValue || 0,
            type: NodeType.NumberInput,
            inputType: InputType.Float, //TODO: add to controller
            defaultValue: this.controls.c.data.defaultValue || 0,
            name: this.controls.c.data.name || "",
            pageName: this.controls.c.data.pageName || "",
            legalValues: this.controls.c.data.legalValues.map(legal=>{return {max: legal.max || null, min: legal.min || null}}) || [], //TODO: Change to undefined
            unit: "", //TODO: Add to controller,
            infoText: this.controls.c.data.infoText || "",
            ordering: 0, // TODO: Add to controller,
            simpleInput: this.controls.c.data.simpleInput
        }
    }
}