import {ClassicEditor} from "@ckeditor/ckeditor5-editor-classic"
import {MdEdit} from "react-icons/md";
import sanitizeHtml from 'sanitize-html';
import {CKEditorWrapper} from './CKEditorWrapper';
import {Paragraph} from "@ckeditor/ckeditor5-paragraph";
import {Superscript, Subscript, Bold, Italic} from "@ckeditor/ckeditor5-basic-styles";
import {Essentials} from "@ckeditor/ckeditor5-essentials";
import {useState} from "react";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "react-bootstrap";


export function CKEditorUnits(props: { value: string, onSave: (value: string) => void }) {
    const [show, setShow] = useState(false);
    const [editorText, setEditorText] = useState(props.value);
    const editorConfiguration = {
        plugins: [ Essentials, Bold, Italic, Paragraph, Subscript, Superscript ],
        toolbar: [ 'bold', 'italic', 'superscript', 'subscript' ]
    };




    const allowedTags = ['p', 'strong', 'i', 'b', 'sup', 'sub'];

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
                <MdEdit></MdEdit>
            </Button>
            <Modal show={show} disableEnforceFocus onHide={handleShow}>
                <ModalHeader closeButton onHide={()=>{
                    if(props.value != editorText) {

                    }
                }}>
                    <Modal.Title>Unit text</Modal.Title>
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