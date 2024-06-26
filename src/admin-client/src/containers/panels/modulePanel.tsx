import {Editor, EditorEvent, EditorSnapshot} from "../../rete/editor";
import {Button, Col, Dropdown, Modal, NavDropdown, OverlayTrigger, Row, Tooltip} from "react-bootstrap";
import React, {useState, useSyncExternalStore} from "react";
import {ModuleEntry} from "../../rete/moduleManager";
import {SingleFileUploader} from "../../components/filePicker";
import Container from "react-bootstrap/Container";
import {MdAdd, MdArrowBack, MdDelete, MdDownload, MdDriveFileRenameOutline, MdUpload} from "react-icons/md";


export function ModulePanel( props: { editor: Editor | undefined }) {
    return <>
        {props.editor && <ModulePanelContents editor={props.editor!}/>}
    </>
}

const downloadModule = (filename: string, data: ModuleEntry) => {

    const name = window.prompt("Export as", filename)
    if(!name) {
        return;
    }
    data.name = name!;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);

    // create "a" HTLM element with href to file
    const link = document.createElement("a");
    link.href = href;
    link.download = name + ".json";
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
}


function ModuleSelection(props: { editor: Editor, editorSnapshot: EditorSnapshot} ) {
    return <NavDropdown
        title={"Select"}
        id={"module-selection"}
    >
        {props.editorSnapshot.moduleNames.map((moduleName)=>{
            return <Dropdown.Item
                disabled={moduleName == props.editorSnapshot.currentModule}
                onClick={()=>{
                    props.editor.loadModule(moduleName);
                }}
            >
                {moduleName}
            </Dropdown.Item>
        })}
    </NavDropdown>
}

function SimpleTooltipButton(
    props: {
        buttonContent: JSX.Element
        tooltip: string
        onClick: () => void
        disabled?: boolean
    }
){
    return <OverlayTrigger overlay={<Tooltip>{props.tooltip}</Tooltip>}>
        <Button
            onClick={props.onClick}
            disabled={props.disabled}
        >
            {props.buttonContent}
        </Button>
    </OverlayTrigger>
}

function ModulePanelContents( props: { editor: Editor }) {

    let moduleSnapshot = useSyncExternalStore(
        props.editor.createEventSubscriber(EditorEvent.ModulesChanged),
        props.editor.getSnapshotRetriever()
    );

    const [showUploadModal, setShowUploadModal] = useState(false);

    const mainLoaded = () => { return !props?.editor.hasModuleLoaded() }

    const handleModuleRename = ()=>{
        const newName = prompt("New name");
        if(newName === "" || newName === 'main' || newName === null) return;
        props.editor?.renameCurrentModule(newName);
    }


    const handleDeleteModule = () =>{
        const verified = window.confirm(`Delete module ${props.editor.currentModule}?`);
        if(!verified) return;
        props.editor.deleteModule(props.editor.currentModule!).then().catch(()=>{
        });
    }
    const handleFileUpload = (file?: File) => {
        if(file && file.name.endsWith(".json")) {
            file.text()
                .then( (contents)=> {
                    const data = JSON.parse(contents);
                    if(data.data && data.name) {
                        props.editor?.addNewModule(data.name, data.data);
                    }
                })
                .catch(()=>{
                    window.prompt("File could not be processed.");
                })
        }
        setShowUploadModal(false);
    }

    const handleNewModule = () =>{
        const name = prompt("Module name");
        if(name) {
            props.editor?.addNewModule(name);
        }
    }

    const handleFileDownload = () =>{
        props.editor?.exportCurrentGraph()
            .then((data)=>{
                downloadModule(moduleSnapshot.currentModule!,
                    { name: moduleSnapshot.currentModule!, data: data});
            });
    }


    return <Container style={{ position: "absolute", zIndex: 10, width: "auto"}}>
        <Row
            style={{background: "white", width:"auto", boxShadow: "0px 0px 5px gray", borderRadius:"5px", padding:"2px"}}
            className={"align-items-center justify-content-start"}
        >
            <Col sm={"auto"} >
                <b>Modules</b>
            </Col>
            <Col sm={"auto"}>
                <ModuleSelection
                    editor={props.editor}
                    editorSnapshot={moduleSnapshot}
                ></ModuleSelection>
            </Col>
            <Col sm={"auto"}>
                <SimpleTooltipButton
                    buttonContent={<MdArrowBack/>}
                    tooltip={"Return to main graph"}
                    onClick={()=>{props.editor?.loadMainGraph()}}
                    disabled={!props.editor?.hasModuleLoaded()}
                />
                <SimpleTooltipButton
                    buttonContent={<MdAdd/>}
                    tooltip={"Add new module"}
                    onClick={handleNewModule}
                />
                <SimpleTooltipButton
                    buttonContent={<MdDelete/>}
                    tooltip={"Delete current module"}
                    onClick={handleDeleteModule}
                    disabled={!props.editor?.hasModuleLoaded()}
                />
                <SimpleTooltipButton
                    buttonContent={<MdDriveFileRenameOutline/>}
                    tooltip={"Rename module"}
                    onClick={handleModuleRename}
                    disabled={!props.editor?.hasModuleLoaded()}
                />
                <SimpleTooltipButton
                    buttonContent={<MdDownload></MdDownload>}
                    tooltip={"Download module"}
                    onClick={handleFileDownload}
                    disabled={mainLoaded()}
                />
                <SimpleTooltipButton
                    buttonContent={<MdUpload></MdUpload>}
                    tooltip={"Upload module"}
                    onClick={()=>{
                        setShowUploadModal(true);
                    }} disabled={false}
                />
                <Modal
                    onHide={()=>{}}
                    show={showUploadModal}
                >
                    <SingleFileUploader
                        handleFile={handleFileUpload}
                        abort={()=>{setShowUploadModal(false)}}
                    />
                </Modal>
            </Col>
        </Row>
        <Row>
            <Col>
                <h4 style={{color: "gray"}}>{moduleSnapshot.currentModule }</h4>
            </Col>
        </Row>
    </Container>
}