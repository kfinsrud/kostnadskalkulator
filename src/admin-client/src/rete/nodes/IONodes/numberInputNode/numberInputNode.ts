import {ParseableBaseNode} from "../../parseableBaseNode";
import {ClassicPreset} from "rete";
import {InputType, NodeType} from "@skogkalk/common/dist/src/parseTree";
import {NumberInputControlData} from "./numberInputControlData";
import {getLegalValueInRange, isInRange} from "../../../../components/input/numberInputField";
import {NumberInputNode as ParseNumberInputNode} from "@skogkalk/common/dist/src/parseTree/nodes/inputNode";
import {NumberSocket} from "../../../sockets";
import {NumberInputControlContainer} from "./numberInputControlContainer";
import {NodeControl} from "../../nodeControl";
import {NumberNodeOutput} from "../../types";
import {NodeAction, NodeActionType, objectToPayload} from "../../../nodeActions";


/**
 * Node whose value can be set by the user.
 */
export class NumberInputNode extends ParseableBaseNode<
    {},
    { out: NumberSocket },
    { c: NodeControl<NumberInputControlData> }
> {

    constructor(
        private dispatch: (action: NodeAction) => void,
        id?: string
    ) {
        super( NodeType.NumberInput, 400, 400, "Number Input", id);

        const initialData: NumberInputControlData = {
            id: this.id,
            name: "",
            simpleInput: true,
            defaultValue: 0,
            legalValues: [],
            infoText: "",
            pageOrdering: 0,
            unit: "",
            allowDecimals: true,
        }

        this.addControl( "c",new NodeControl(
            initialData,
            {
                onUpdate: (newValue: Partial<NumberInputControlData>) => {
                    const defaultValue = this.controls.c.get('defaultValue');
                    if(newValue.legalValues !== undefined && defaultValue !== undefined && newValue.legalValues.length > 0) {
                        if(!newValue.legalValues.some((v) => {
                            return isInRange(defaultValue!, v);
                        })) {
                            this.controls.c.setNoUpdate({defaultValue: getLegalValueInRange(defaultValue, newValue.legalValues[0])})
                        }
                    }


                    if(this.controls.c.options.minimized) {
                        this.width = this.originalWidth * 0.7;
                        this.height = this.originalHeight * 0.5;
                    } else {
                        this.width = this.originalWidth;
                        this.height = this.originalHeight + this.controls.c.get('legalValues').length * 74;
                    }
                    this.dispatch({type:NodeActionType.UpdateRender, nodeID: this.id})
                    if(newValue.defaultValue !== undefined) {
                        this.dispatch({type: NodeActionType.RecalculateGraph, nodeID: this.id})
                    }
                    this.dispatch({type: NodeActionType.StateChange, nodeID: this.id, payload:objectToPayload(this.toParseNode())})
                },
                minimized: false
            },
            NumberInputControlContainer
        ));

        this.addOutput("out", new ClassicPreset.Output(new NumberSocket(), "Number"));
        this.dispatch({type:NodeActionType.UpdateRender, nodeID: this.id})
    }

    data(): { out: NumberNodeOutput } {
        return {
            out: { value: this.controls.c.get('defaultValue') || 0, sourceID: this.id}
        };
    }

    serializeControls(): any {
        return this.controls.c.getData();
    }

    deserializeControls(data: any) {
        this.controls.c.set(data);
    }

    toParseNode(): ParseNumberInputNode {
        this.controls.c.setNoUpdate({id: this.id});
        return {
            id: this.id,
            value: this.controls.c.get('defaultValue') || 0,
            type: NodeType.NumberInput,
            inputType: this.controls.c.get('allowDecimals') ? InputType.Float : InputType.Integer,
            defaultValue: this.controls.c.get('defaultValue') || 0,
            name: this.controls.c.get('name') || "",
            pageName: this.controls.c.get('pageName') || "",
            legalValues: this.controls.c.get('legalValues').map(legal=>{return {max: legal.max || null, min: legal.min || null}}) || [], //TODO: Change to undefined
            unit: this.controls.c.get('unit') || "",
            infoText: this.controls.c.get('infoText') || "",
            ordering: this.controls.c.get('pageOrdering'),
            simpleInput: this.controls.c.get('simpleInput') || false,
        }
    }
}