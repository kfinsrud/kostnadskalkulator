import {ModuleInputControlData} from "./moduleInput";
import {TextInputField} from "../../../components/input/textInputField";
import {ModuleOutputControlData} from "./moduleOutput";
import {ModuleNodeControlData} from "./moduleNode";
import {FloatingLabel, FormSelect} from "react-bootstrap";
import React from "react";
import {NodeControl} from "../nodeControl";
import {NumberInputField} from "../../../components/input/numberInputField";

export function ModuleInputControl( props: { data: NodeControl<ModuleInputControlData> }) {
    return <>
        <TextInputField
            value={props.data.get('inputName')}
            onChange={(value )=>{
                props.data.set({inputName: value})
            }}
        />
        <NumberInputField
            inputHint={"test value"}
            value={props.data.getData().value}
            onChange={(value)=>{props.data.set({value: value})}}
        />
    </>
}

export function ModuleOutputControl( props: {data: NodeControl<ModuleOutputControlData> }) {
    return <>
        <TextInputField value={props.data.get('outputName')} onChange={(value )=>{
            props.data.set({outputName: value})
        }}/>
    </>
}

export function ModuleNodeControl( props: {data: NodeControl<ModuleNodeControlData>}) {
    return <>
        <FloatingLabel
            label={'module'}
            onPointerDown={(e)=>{e.stopPropagation()}}
            onDoubleClick={e=>{e.stopPropagation()}}
        >
            <FormSelect
                className={"field"}
                aria-label="Default select example"
                value={props.data.get('currentModule')}
                onChange={(e)=> {
                    const selection = e.currentTarget.value;
                    props.data.set({currentModule: selection})
                }}

            >
                <option>...</option>
                {props.data.get('availableModules').map( module => {
                    return <option>{module}</option>
                })
                }
            </FormSelect>
        </FloatingLabel>
    </>
}