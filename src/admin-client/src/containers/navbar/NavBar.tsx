import {Col, Nav, Navbar, Row} from "react-bootstrap";
import {NavBarDropdowns} from "./NavBarDropdowns";
import {FormulaInfoContainer} from "../formulaInfoContainer";
import {ReteFunctions} from "../../rete/createEditor";
import React from "react";
import {NavBarUserInfo} from "./NavBarUserInfo";
import Container from "react-bootstrap/Container";

/**
 * The navigation bar for the application
 */
export function NavBar(props: {functions: ReteFunctions | null}) {

    return (
        <Navbar style={{boxShadow: "0px 0px 5px rgba(0,0,0,0.5)", zIndex: 100}} className="bg-body-tertiary">
            <Navbar.Brand className={"ms-4"} style={{alignItems: "center"}}>
                <Container>
                    <Row className ="align-items-center">
                        <Col>
                            <img src={"manifest-icon-192.maskable.png"} width={"52em"} alt={"kostnadskalkulaor"}></img>
                        </Col>
                        <Col>
                            Editor
                        </Col>
                    </Row>
                </Container>
            </Navbar.Brand>
            <Nav className="me-auto align-items-center">
                <NavBarDropdowns functions={props.functions} />
                <FormulaInfoContainer/>
            </Nav>
            <NavBarUserInfo />
        </Navbar>
    )
}