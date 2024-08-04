import {Col, Dropdown, Nav, Navbar, NavDropdown, Row} from "react-bootstrap";
import {NavBarDropdowns} from "./NavBarDropdowns";
import {FormulaInfoContainer} from "../formulaInfoContainer";
import {ReteFunctions} from "../../rete/createEditor";
import React, {useState} from "react";
import {NavBarUserInfo} from "./NavBarUserInfo";
import Container from "react-bootstrap/Container";
import {ReactCountryFlag} from 'react-country-flag';
import i18n from "../../i18n";
import {useTranslation} from "react-i18next";

const languages = [
    {flagCode:"NO", langCode:"no"},
    {flagCode:"GB", langCode:"en"},
];

function CountryFlag(
    props: {flagCode: string}
) {
    return <ReactCountryFlag
            countryCode={props.flagCode}
            style={{
                fontSize: "2em"
            }}
        />
}

/**
 * The navigation bar for the application
 */
export function NavBar(props: {functions: ReteFunctions | null}) {
    const {t} = useTranslation();
    const [language, setLanguage] = useState({flagCode:"NO",langCode:"no"})
    return (
        <Navbar style={{boxShadow: "0px 0px 5px rgba(0,0,0,0.5)", zIndex: 100}} className="bg-body-tertiary">
            <Navbar.Brand className={"ms-4"} style={{alignItems: "center"}}>
                <Container>
                    <Row className ="align-items-center">
                        <Col>
                            <img src={"manifest-icon-192.maskable.png"} width={"52em"} alt={"kostnadskalkulaor"}></img>
                        </Col>
                        <Col>
                            {t('titles.main_ui.nav.tool_name')}
                        </Col>
                    </Row>
                </Container>
            </Navbar.Brand>
            <Nav className="me-auto align-items-center">
                <NavBarDropdowns functions={props.functions} />
                <FormulaInfoContainer/>
            </Nav>
            <Nav className={"me-auto alignt-items-end"}>
                <CountryFlag flagCode={language.flagCode}></CountryFlag>
                <NavDropdown
                    title={language.flagCode}
                    id={"nav-language-dropdown"}>
                    {languages.map(lang=>{
                        return <Dropdown.Item>
                            <Container
                                onClick={()=>{
                                    setLanguage(lang);
                                    i18n.changeLanguage(lang.langCode);
                                }}
                            >
                                <Row>
                                    <Col>
                                        <CountryFlag flagCode={lang.flagCode}/>
                                    </Col>
                                    <Col>
                                        {lang.flagCode}
                                    </Col>
                                </Row>
                            </Container>
                        </Dropdown.Item>
                    })}
                </NavDropdown>
            </Nav>
            <NavBarUserInfo />
        </Navbar>
    )
}