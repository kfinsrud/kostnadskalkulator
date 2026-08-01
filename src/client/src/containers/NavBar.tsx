import {Button, Col, Collapse, Container, Row} from "react-bootstrap";
import '../App.css'
import React, {useEffect, useState} from "react";
import {Link, Outlet, useLocation, useNavigate} from "react-router";
import {MdArrowBackIosNew, MdClose, MdMenu} from "react-icons/md";
import {ShareResultButton} from "../components/buttons/ShareResultButton";
import {SaveMenuButton} from "../components/buttons/SaveMenuButton";
import BrandBanner from '../brand-banner.svg?react';

/**
 * The navigation bar for the application
 */
export function NavBar() {
    // The state of the offcanvas
    const [show, setShow] = useState(false)
    // Ensure that the offcanvas is closed when a link is clicked
    const onLinkClick = () => {
        setShow((s) => !s)
    }
    // Check if the current page is the main page
    const onMainPage = useLocation().pathname === "/"
    // The navigation hook
    const navigate = useNavigate()

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    const updateMedia = () => {
        setIsDesktop(window.innerWidth >= 768);
    };

    useEffect(() => {
        window.addEventListener('resize', updateMedia);
        return () => window.removeEventListener('resize', updateMedia);
    })

    const extraNavbarButtons = (
        <>
            <SaveMenuButton />
            <ShareResultButton />
        </>
    )

    return (
        <>

            <Container className={"justify-text-center"} style={{maxWidth: '1200px'}}>
                <Row className={"d-flex align-items-center"}>
                    {!onMainPage &&
                        <Col xs={"auto"} className={"p-0"}>
                            <NavBarButton icon={<MdArrowBackIosNew />} onClick={() => navigate(-1)} />
                        </Col>
                    }
                    <Col className={"pt-1"}>
                        <BrandBanner height={'40px'} style={{cursor: 'pointer' }} onClick={() => navigate('/')} />
                    </Col>
                    <Col xs={"auto"} className={"d-flex text-end"}>
                        {isDesktop && extraNavbarButtons}
                        <NavBarButton icon={!show ? <MdMenu /> : <MdClose />} onClick={onLinkClick} />
                    </Col>
                </Row>
                <Row>
                    <Collapse in={show}>
                        <Row className={"text-center"}>
                            <Link onClick={onLinkClick} to="/forskningsgrunnlag" style={{color: 'white'}}>Forskningsgrunnlag</Link>
                            <Link onClick={onLinkClick} to="/tallgrunnlag" style={{color: 'white'}}>Tallgrunnlag</Link>
                            <Link onClick={onLinkClick} to="/apiinfo" style={{color: 'white'}}>API</Link>
                            <Link onClick={onLinkClick} to="/tilbakemelding" style={{color: 'white'}}>Tilbakemelding</Link>
                            {!isDesktop && <Col>{extraNavbarButtons}</Col>}
                        </Row>
                    </Collapse>
                </Row>
            </Container>
            <Col className={"mt-2 mx-auto ps-2 pe-2"} style={{maxWidth: '1200px'}}>
                <Outlet />
            </Col>
        </>
    )
}

function NavBarButton(props: {icon: JSX.Element, onClick: () => void}) {
    return (
        <Button
            variant={"link"}
            onClick={() => props.onClick()}
            style={{fontSize: '2em', color: "white"}}
        >
            {props.icon}
        </Button>


    )
}
