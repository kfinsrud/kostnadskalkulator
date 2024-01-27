import {FieldData, FieldType} from "../constants/FieldData";
import {InputNumber} from "../components/InputNumber";
import {InputDropdown} from "../components/InputDropdown";
import {Button, InputGroup, Modal} from "react-bootstrap";
import {InfoCircle} from "react-bootstrap-icons";
import {useState} from "react";

export function InputField({fieldData}: {fieldData: FieldData}) {

    // creates a mapping of field type with corresponding jsx component
    const fieldComponents = {
        [FieldType.NUMBERED_INPUT]: InputNumber,
        [FieldType.DROPDOWN_INPUT]: InputDropdown,
    }
    const Component = fieldComponents[fieldData.type]

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


   return (
       <>
           <InputGroup className="mb-3">
               <Button onClick={handleShow}>
                   <InfoCircle />
               </Button>
               {Component ? <Component fieldData={fieldData} /> : null}
           </InputGroup>
           <Modal show={show} onHide={handleClose}>
               <Modal.Header closeButton>
                   <Modal.Title>{fieldData.title}</Modal.Title>
               </Modal.Header>
               <Modal.Body>Her kommer beskrivelse av parameter</Modal.Body>
           </Modal>
       </>
   )
}