import React from "react";
import {CKTextEditorFull} from "./CKEditor";

export function TextEditor(
    props: {value: string, buttonText: string, onSave: (value: string) => void
    }
) {
    return <CKTextEditorFull value={props.value} onSave={props.onSave}/>
}