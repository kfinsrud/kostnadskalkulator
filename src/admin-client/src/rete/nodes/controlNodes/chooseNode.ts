import {ParseableBaseNode} from "../parseableBaseNode";
import {NumberSocket} from "../../sockets";
import {ChooseNodeComparisonData, ChooseNodeControlData} from "./ChooseNodeControlData";
import {compare, Comparison, NodeType} from "@skogkalk/common/dist/src/parseTree";
import {ClassicPreset} from "rete";
import {NodeControl} from "../nodeControl";
import {ChooseNodeContainer, ComparisonControlContainer} from "./ChooseNodeContainer";
import {ChooseNode as ParseChooseNode} from "@skogkalk/common/dist/src/parseTree/nodes/chooseNode";
import {NumberNodeOutput} from "../types";
import {NodeAction, NodeActionType} from "../../nodeActions";


interface CompositeControlData {
    mainControl: ChooseNodeControlData,
    comparisons: ChooseNodeComparisonData[]
}

export class ChooseNode extends ParseableBaseNode<
    Record<string, NumberSocket>,
    { out: NumberSocket },
    { c: NodeControl<ChooseNodeControlData> }
> {
    private readonly defaultInputCount = 2;
    private leftHandValue = 0;
    private defaultValue = 0;

    constructor(
        private dispatch: (action: NodeAction)=>void,
        id?: string
    ) {
        super(NodeType.Choose, 400,400, "Choose", id);


        this.addInput("left", new ClassicPreset.Input(new NumberSocket(), "Left hand", false));
        this.addInput("right", new ClassicPreset.Input(new NumberSocket(), "Default", false));
        this.addOutput("out", new ClassicPreset.Output(new NumberSocket(), "Result"));

        const control = new NodeControl<ChooseNodeControlData>(
            {comparisonCount: 2},
            {
                onUpdate: () => {
                    this.updateComparisonCount();
                    this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})
                },
                minimized: false
            },
            ChooseNodeContainer
        )

        this.addControl(
            "c",
            control
        )

        this.forComparisonCount((i)=>{
            this.addNumberedInput(i);
        });

        this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})
    }


    data( inputs: Record<string, NumberNodeOutput[]>): { out: NumberNodeOutput } {
        let result: NumberNodeOutput | undefined;
        this.leftHandValue = inputs.left?.[0].value || 0;
        this.defaultValue = inputs.right?.[0].value || 0;

        this.forComparisonCount((i) => {
            const control = this.getInputControlByIndex(i);
            const dataInput = inputs["input"+i]
            if(control) {
                control.setNoUpdate({lh: this.leftHandValue});
                control.setNoUpdate({sourceID: dataInput?.[0]?.sourceID || ""})
                if(
                    result === undefined &&
                    compare(this.leftHandValue, control.get('rh'), control.get('comparison'))
                ) {
                    result = {value: dataInput?.[0]?.value ?? 0, sourceID: this.id}
                }
            }
        });
        this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})

        this.dispatch({type: NodeActionType.StateChange, nodeID: this.id, payload: [{key:"value",value: result?.value ?? this.defaultValue}]})
        return { out: result ?? {value: this.defaultValue, sourceID: this.id}}
    }

    toParseNode(): ParseChooseNode {
        const controls = this.getComparisonControls();
        return {
            id: this.id,
            type: NodeType.Choose,
            value: 0,
            inputs: [],
            comparisons: controls.map(control=>{
                return {
                    rh: control.rh,
                    comparison: control.comparison,
                    resultNodeID: control.sourceID ?? ""
                }
            }),
        };
    }

    public getComparisonControls() {
        const controls: ChooseNodeComparisonData[] = [];
        this.forComparisonCount((i)=> {
            const inputControl = this.getInputControlByIndex(i);
            if(inputControl === undefined) { throw new Error ("undefined input control in choose node: " + this.id)}
            controls.push(inputControl.getData());
        });
        return controls;
    }

    serializeControls(): CompositeControlData {
        const controls = this.getComparisonControls();
        return {
            mainControl: this.controls.c.getData(),
            comparisons: controls
        };
    }

    deserializeControls(data: CompositeControlData ) {
        this.controls.c.set({comparisonCount: data.mainControl.comparisonCount});
        this.forComparisonCount((i)=> {
            let control = this.getInputControlByIndex(i);
            if (control === undefined) {
                this.addNumberedInput(i);
                control = this.getInputControlByIndex(i);
            }
            control?.setNoUpdate(data.comparisons[i])
        });
    }


    private updateComparisonCount() {
        const newComparisonCount = this.controls.c.get('comparisonCount');
        if(newComparisonCount < 0) {
            this.controls.c.setNoUpdate({comparisonCount: 0});
            return;
        }
        const oldComparisonCount = Object.keys(this.inputs).length - this.defaultInputCount;
        const difference = newComparisonCount - oldComparisonCount;
        if(difference > 0) {
            for(let i = 0; i < difference; i++) {
                const initial: ChooseNodeComparisonData = {lh: this.leftHandValue, rh: 0, comparison: Comparison.EQ};
                this.addNumberedInput(i + oldComparisonCount, initial);
            }
        } else if(difference < 0) {
            for(let i = 0; i < -difference; i++) {
                this.removeNumberedInput(oldComparisonCount - i - 1);
            }
        }
    }

    private addNumberedInput(number: number, initial?: ChooseNodeComparisonData){
        const input = new ClassicPreset.Input(new NumberSocket());
        const options = {
            onUpdate: () => {
                this.dispatch({type: NodeActionType.RecalculateGraph, nodeID: this.id})
                this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})
            },
            minimized: false
        };
        input.addControl(new NodeControl<ChooseNodeComparisonData>(
            initial ?? {lh: 0, rh: 0, comparison: Comparison.EQ},
            options,
            ComparisonControlContainer
        ));
        this.addInput("input" + number.toString(), input);
    }

    private removeNumberedInput(number: number) {
        const inputName = "input" + number.toString();
        this.removeInput(inputName);
        this.dispatch({type: NodeActionType.Disconnect, nodeID: this.id})
        this.dispatch({type: NodeActionType.UpdateRender, nodeID: this.id})
    }

    public getInputControlByIndex(index: number)  {
        return this.inputs["input"+index.toString()]?.control as NodeControl<ChooseNodeComparisonData> | undefined;
    }

    private forComparisonCount(func: (index: number)=>void) {
        for(let i = 0; i < this.controls.c.get('comparisonCount'); i++) { func(i); }
    }
}