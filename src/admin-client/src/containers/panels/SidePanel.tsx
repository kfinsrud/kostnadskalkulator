import {Row, Tab, Tabs} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {PagesWindow} from "../pagesWindow";
import {PageEditor} from "../pageEditor";
import {UnitsWindow} from "../unitsWindow";
import {DisplayArrangementSettings} from "./DisplayArrangementSettings";
import {NodeSearchParent} from "./NodeSearch";
import {ReteFunctions} from "../../rete/createEditor";

export function SidePanel(
    props: { reteFunctions: ReteFunctions | null }
) {
    return (
        <Container className={"h-100"} style={{borderLeft: 'lightgrey solid 1px'}}>
            <h5 className={"pt-2 pb-3"}>{"Properties"}</h5>
                <Tabs>
                    <Tab className={"h-100"} eventKey="Pages" title="Pages">
                        <Container fluid={true} style={{height: "80vh", justifyContent: ""}}>
                            <Row style={{height: "50%"}}>
                                <PagesWindow/>
                            </Row>
                            <Row style={{minHeight: "2%"}}></Row>
                            <Row style={{height: "48%"}}>
                                <PageEditor/>
                            </Row>
                        </Container>
                    </Tab>
                    <Tab eventKey="Units" title="Units">
                        <Container fluid={true} style={{height: "80vh", justifyContent: ""}}>
                            <UnitsWindow/>
                        </Container>
                    </Tab>
                    <Tab eventKey="Displays" title="Displays">
                        <DisplayArrangementSettings />
                    </Tab>
                    <Tab eventKey="Node Search" title="Node Search">
                        <Container style={{height: "80vh"}}>
                            <NodeSearchParent editor={props.reteFunctions?.editor}></NodeSearchParent>
                        </Container>
                    </Tab>
                </Tabs>
        </Container>
    )
}