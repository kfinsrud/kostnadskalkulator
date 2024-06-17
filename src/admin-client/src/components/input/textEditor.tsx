import React from "react";
import {CKTextEditor} from "./CKEditor";

export function TextEditor(
    props: {value: string, buttonText: string, onSave: (value: string) => void
    }
) {
    return <CKTextEditor value={props.value} onSave={props.onSave}/>
}