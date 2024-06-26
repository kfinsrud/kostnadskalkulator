import {Col, Row, Tab, Tabs} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {PagesWindow} from "../pagesWindow";
import {PageEditor} from "../pageEditor";
import {UnitsWindow} from "../unitsWindow";
import {DisplayArrangementSettings} from "./DisplayArrangementSettings";
import {NodeSearchParent} from "./NodeSearch";
import {ReteFunctions} from "../../rete/createEditor";
import {useState} from "react";
import {MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight} from "react-icons/md";

export function SidePanel(
    props: { reteFunctions: ReteFunctions | null }
) {
    const [hovering, setHovering] = useState(false);
    const [show, setShow] = useState(true);
    const [width, setWidth] = useState(500);
    const [mouseX, setMouseX] = useState(0);

    const handleMouseMove = (e: DragEvent) => {
        setMouseX(e.clientX);
    }

    return (
        <Container className={"h-100"} style={{borderLeft: 'lightgrey solid 1px', paddingTop: "10px", width: show? width : 0}}>
            <Row>
                <Col
                    className={"justify-content-center"}
                    draggable={show}
                    sm={"auto"}
                    style={{ minHeight:"100px",borderLeft: (hovering)? "5px" : "0", padding:"0", minWidth: hovering? "5px" : "2px"}}
                    onMouseEnter={()=>{
                        setHovering(true);
                    }}
                    onMouseLeave={()=>{
                        setHovering(false);
                    }}
                    onDrag={()=>{
                        if(!show) return;
                        const w = ((window?.visualViewport?.width || 0) - mouseX);
                        setWidth(w);
                    }}
                    onClick={()=>{
                        setShow(!show);
                        setHovering(false);
                    }}
                    onMouseDown={()=>{
                        if(!show) return;
                        window.addEventListener("dragover", handleMouseMove);
                    }}
                    onMouseUp={()=>{
                        if(!show) return;
                        window.removeEventListener("dragover", handleMouseMove);
                    }}
                >
                    {show?<MdKeyboardDoubleArrowRight size={22} style={hovering?{filter:"drop-shadow( 0 0 2px)"}:{}}></MdKeyboardDoubleArrowRight>
                        : <MdKeyboardDoubleArrowLeft size={22} style={hovering?{filter:"drop-shadow( 0 0 2px)"}:{}}></MdKeyboardDoubleArrowLeft>}
                </Col>
                {show && <Col>
                    <Tabs>
                        <Tab className={"h-101"} eventKey="Pages" title="Pages">
                            <Container fluid={true} style={{height: "79vh", justifyContent: ""}}>
                                <Row style={{height: "49%"}}>
                                    <PagesWindow/>
                                </Row>
                                <Row style={{minHeight: "1%"}}></Row>
                                <Row style={{height: "47%"}}>
                                    <PageEditor/>
                                </Row>
                            </Container>
                        </Tab>
                        <Tab eventKey="Units" title="Units">
                            <Container fluid={true} style={{height: "79vh", justifyContent: ""}}>
                                <UnitsWindow/>
                            </Container>
                        </Tab>
                        <Tab eventKey="Displays" title="Displays">
                            <DisplayArrangementSettings />
                        </Tab>
                        <Tab eventKey="Node Search" title="Node Search">
                            <Container style={{height: "79vh"}}>
                                <NodeSearchParent editor={props.reteFunctions?.editor}></NodeSearchParent>
                            </Container>
                        </Tab>
                    </Tabs>
                </Col>}
            </Row>
        </Container>
    )
}