// src/ckeditor5-react-wrapper.js
import React, { Suspense, lazy } from 'react';
import {Spinner} from "react-bootstrap";

const CKEditor = lazy(() => import('@ckeditor/ckeditor5-react').then(module => ({ default: module.CKEditor })));

export function CKEditorWrapper( props: any  ) {
    return <Suspense fallback={<Spinner></Spinner>}>
        <CKEditor {...props} />
    </Suspense>
}