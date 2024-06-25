import {Editor, EditorEvent, EditorSnapshot} from "../../rete/editor";
import {Button, Col, Dropdown, Modal, NavDropdown, Row} from "react-bootstrap";
import React, {useState, useSyncExternalStore} from "react";
import {ModuleEntry} from "../../rete/moduleManager";
import {SingleFileUploader} from "../../components/filePicker";
import Container from "react-bootstrap/Container";
import {MdArrowBack} from "react-icons/md";


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

function ModulePanelContents( props: { editor: Editor }) {

    let moduleSnapshot = useSyncExternalStore(
        props.editor.createEventSubscriber(EditorEvent.ModulesChanged),
        props.editor.getSnapshotRetriever()
    );

    const [showUploadModal, setShowUploadModal] = useState(false);

    const mainLoaded = () => { return !props?.editor.hasModuleLoaded() }

    return <Container style={{ position: "absolute", zIndex: 10, width: "auto"}}
    >
        <Row
            style={{background: "white", width:"auto", boxShadow: "0px 0px 5px gray", borderRadius:"5px", padding:"2px"}}
            className={"align-items-center justify-content-start"}
        >
            <Col sm={"auto"} >
                <b>Modules</b>
            </Col>
            {moduleSnapshot.currentModule && <Col sm={"auto"}>
                <Button
                    disabled={!props.editor?.hasModuleLoaded()}
                    onClick={ ()=>{
                        props.editor?.loadMainGraph();
                    }}
                ><MdArrowBack/></Button>
            </Col>}
            <Col sm={"auto"}>
                <ModuleSelection
                    editor={props.editor}
                    editorSnapshot={moduleSnapshot}
                ></ModuleSelection>
            </Col>
            <Col sm={"auto"}>
                <Button onClick={()=>{
                    const name = prompt("Module name");
                    if(name) {
                        props.editor?.addNewModule(name);
                    }
                }}>new</Button>
                <Button disabled={mainLoaded()} onClick={()=>{
                    props.editor.deleteModule(props.editor.currentModule!).then().catch(()=>{
                        prompt("No module with that name found");
                    });
                }}>delete</Button>
                <Button disabled={mainLoaded()} onClick={()=>{
                    const newName = prompt("New name");
                    if(newName === "" || newName === 'main' || newName === null) return;
                    props.editor?.renameCurrentModule(newName);
                }}>rename</Button>
                <Button
                    disabled={mainLoaded()}
                    onClick={()=>{
                        props.editor?.exportCurrentGraph()
                            .then((data)=>{
                                console.log("exporting", data);
                                downloadModule(moduleSnapshot.currentModule!,
                                    { name: moduleSnapshot.currentModule!, data: data});
                            });
                    }}
                >Export</Button>
                <Button
                    onClick={()=>{setShowUploadModal(true)}}
                >import</Button>
                <Modal
                    onHide={()=>{}}
                    show={showUploadModal}
                >
                    <SingleFileUploader handleFile={(file)=>{
                        if(file && file.name.endsWith(".json")) {
                            file.text()
                                .then( (contents)=> {
                                    const data = JSON.parse(contents);
                                    console.log(data);
                                    if(data.data && data.name) {
                                        props.editor?.addNewModule(data.name, data.data);
                                    }
                                })
                                .catch((

                                )=>{})
                        }
                        setShowUploadModal(false);
                    }}
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