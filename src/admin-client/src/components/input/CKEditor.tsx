import React, {useState} from "react";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "react-bootstrap";
// import {CKEditor} from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {MdEdit} from "react-icons/md";
import sanitizeHtml from 'sanitize-html';
import {CKEditorWrapper} from './CKEditorWrapper';

export function CKTextEditor(props: { value: string, onSave: (value: string) => void }) {
    const [show, setShow] = useState(false);
    const [editorText, setEditorText] = useState(props.value);

    const editorConfiguration = {
        toolbar: {
            removeItems: ['uploadImage', 'mediaEmbed']
        }
    }

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
            <Modal show={show} disableEnforceFocus onHide={handleShow}>
                <ModalHeader closeButton onHide={()=>{
                    if(props.value != editorText) {

                    }
                }}>
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