import React, {useState} from "react";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "react-bootstrap";
import {ClassicEditor} from "@ckeditor/ckeditor5-editor-classic"
import {MdEdit} from "react-icons/md";
import sanitizeHtml from 'sanitize-html';
import {CKEditorWrapper} from './CKEditorWrapper';
import {Paragraph} from "@ckeditor/ckeditor5-paragraph";
import {Link} from '@ckeditor/ckeditor5-link';
import {BlockQuote} from '@ckeditor/ckeditor5-block-quote';
import {UndoUI} from '@ckeditor/ckeditor5-undo';
import {List, ListUI} from '@ckeditor/ckeditor5-list';
import {Alignment, AlignmentUI} from '@ckeditor/ckeditor5-alignment'
import {Heading, HeadingUI} from '@ckeditor/ckeditor5-heading'
import {Table, TableUI, TableEditing, TableMouse, TableToolbar} from '@ckeditor/ckeditor5-table'
import {Bold, Italic, Strikethrough, Underline} from "@ckeditor/ckeditor5-basic-styles";
import {Essentials} from "@ckeditor/ckeditor5-essentials";


export function CKTextEditorFull(props: { value: string, onSave: (value: string) => void }) {
    const [show, setShow] = useState(false);
    const [editorText, setEditorText] = useState(props.value);
    const editorConfiguration = {
        plugins: [
            Essentials, Bold, Italic, Table, Paragraph, Underline, Strikethrough,
            BlockQuote, Link, Heading, HeadingUI,
            TableUI, TableEditing, TableMouse, TableToolbar,
            UndoUI, Alignment, AlignmentUI, List, ListUI
        ],
        toolbar: [
            'undo','redo', '|',
            'heading', '|',
            'bold', 'italic', 'strikethrough', 'underline', 'blockQuote', '|',
            'link', 'insertTable', '|',
            'numberedList', 'bulletedList', 'alignment'
        ]
    };

    const allowedTags = [
        'p', 'a',
        'h2', 'h3', 'h4',
        'strong', 'i',
        'figure', 'table', 'tbody', 'td', 'tr',
        'blockquote',
        'li', 'ul', 'ol']

    const handleShow = () => setShow(!show);
    const handleSave = () => {
        const cleanHTML = sanitizeHtml(editorText, {
            allowedTags: allowedTags
        })
        props.onSave(cleanHTML);
        handleShow();
    }


    return <>
        <div>
            <Button
                onClick={handleShow}
            >
                Edit info <MdEdit></MdEdit>
            </Button>
            <Modal onHide={()=>{
                if(props.value != editorText) {
                    const save = window.confirm("There are unsaved changes. Do you want to save them?");
                    if(save) {
                        props.onSave(editorText);
                    } else {
                        setEditorText(props.value);
                    }
                }
                handleShow()
                }}
               dialogClassName={"text-editor-modal"}
               show={show}
               disableEnforceFocus
            >
                <ModalHeader closeButton >
                    <Modal.Title>Edit info text</Modal.Title>
                </ModalHeader>
                <ModalBody style={{overflowY: "scroll", minHeight: "60vh", maxHeight:"60vh"}}>
                    <div className={"ck-body-wrapper"}>
                        <CKEditorWrapper
                            editor={ClassicEditor}
                            config={editorConfiguration}
                            data={editorText}
                            onChange={(event:any, editor:any) => {
                                setEditorText(editor.getData());
                            }}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant={"danger"}
                        onClick={()=> {
                            handleShow();
                            setEditorText(props.value);
                        }}
                    >
                        Discard Changes
                    </Button>
                    <Button
                        variant={"primary"}
                        onClick={handleSave}>
                        Save Changes
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    </>
}