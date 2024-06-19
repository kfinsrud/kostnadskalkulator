import {ParseableBaseNode} from "../../parseableBaseNode";
import {ClassicPreset} from "rete";
import {DropdownInput, NodeType} from "@skogkalk/common/dist/src/parseTree";
import {DropdownInputControlData} from "./dropdownInputControlData";
import {NumberSocket} from "../../../sockets";
import {DropdownInputControlContainer} from "./dropdownInputControlContainer";
import {NodeControl} from "../../nodeControl";
import {NumberNodeOutput} from "../../types";
import {NodeAction, NodeActionType, objectToPayload} from "../../../nodeActions";


/**
 * Node whose value can be set by the user.
 */
export class DropdownInputNode extends ParseableBaseNode<
    {},
    { out: NumberSocket },
    { c: NodeControl<DropdownInputControlData>}
> {

    constructor(
        private dispatch: (action: NodeAction) => void,
        id?: string,
    ) {
        super(NodeType.DropdownInput, 400, 400, "Dropdown Input", id);

        const initialControlData: DropdownInputControlData = {
            id: this.id,
            name: "",
            simpleInput: true,
            dropdownOptions: [],
            defaultKey: "",
            defaultValue: 0,
            infoText: "",
            pageOrdering: 0,
            unit: ""
        }

        this.addControl("c", new NodeControl(
            initialControlData,
            {
                onUpdate: (data) => {
                    if(this.controls.c.options.minimized) {
                        this.width = this.originalWidth * 0.5;
                        this.height = this.originalHeight * 0.5;
                    } else {
                        this.width = this.originalWidth;
                        this.height = this.originalHeight + this.controls.c.get('dropdownOptions').length * 74;
                    }
                    this.dispatch({type:NodeActionType.UpdateRender, nodeID: this.id})
                    if(data.defaultValue != undefined) {
                        this.dispatch({type: NodeActionType.RecalculateGraph, nodeID: this.id})
                    }
                    this.dispatch({type: NodeActionType.StateChange, nodeID: this.id, payload: objectToPayload(this.toParseNode())})
                },
                minimized: false
            },
            DropdownInputControlContainer
        ));

        this.addOutput("out", new ClassicPreset.Output(new NumberSocket(), "Number"));
        this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})
    }


    data(): { out: NumberNodeOutput } {
        return {
            out: {
                sourceID: this.id,
                value: this.controls.c.get('dropdownOptions').find((option)=>{return option.label === this.controls.c.get('defaultKey')})?.value || 0
            }
        };
    }

    serializeControls(): any {
        return this.controls.c.getData();
    }

    deserializeControls(data: any) {
        this.controls.c.set(data);
    }

    toParseNode() : DropdownInput {
        this.controls.c.setNoUpdate({id: this.id})
        return {
            id: this.id,
            value: this.controls.c.get('defaultValue') || 0,
            type: NodeType.DropdownInput,
            defaultValue: this.controls.c.get('defaultValue') || 0,
            name: this.controls.c.get('name') || "",
            pageName: this.controls.c.get('pageName') || "",
            dropdownAlternatives: this.controls.c.get('dropdownOptions')?.map(({value, label})=>{return {value, label}}) || [],
            infoText: this.controls.c.get('infoText') || "",
            ordering: this.controls.c.get('pageOrdering') || 0,
            simpleInput: this.controls.c.get('simpleInput') || false,
            unit: this.controls.c.get('unit') || ""
        }
    }
}