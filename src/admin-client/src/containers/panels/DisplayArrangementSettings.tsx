import {Button, ButtonGroup, Card, Col, Row, Stack, Tab, Tabs} from "react-bootstrap";
import {
    MdGridOn, MdMenu,
    MdOutlineViewAgenda,
    MdOutlineWindow,
} from "react-icons/md";
import {selectTreeState} from "../../state/store";
import {useAppDispatch, useAppSelector} from "../../state/hooks";
import {DisplayNode, NodeType} from "@skogkalk/common/dist/src/parseTree";
import React, {useEffect, useRef, useState} from "react";
import Container from "react-bootstrap/Container";
import {changeSpan, moveDisplay} from "../../state/slices/displayArrangements";

export function DisplayArrangementSettings() {
    return (
        <>
            <p>
                {"Display tiles can be arranged by order and size for different screen sizes. Select the tab that corresponds with how many display tiles can fit in a given window."}
            </p>
            <Tabs>
                <Tab eventKey="Mobile" title={<MdOutlineViewAgenda size={25} />}>
                    <DisplayPreviewContainer widthMultiplier={12} />
                </Tab>

                <Tab eventKey="Tablet" title={<MdOutlineWindow size={25} />}>
                    <DisplayPreviewContainer widthMultiplier={6} />
                </Tab>

                <Tab eventKey="Desktop" title={<MdGridOn size={25} />}>
                    <DisplayPreviewContainer widthMultiplier={4} />
                </Tab>
            </Tabs>
        </>
    )
}


function DisplayPreviewContainer(props: {
    widthMultiplier: number
}) {
    const {tree} = useAppSelector(selectTreeState);

    const getWidth = (widthMultiplier: number) => {
        switch (widthMultiplier) {
            case 12: return "33%"
            case 6: return "66%"
            case 4: return "100%"
        }
    }

    const getSize = (widthMultiplier: number) => {
        switch (widthMultiplier) {
            case 12: return "xs"
            case 6: return "md"
            default: return "lg"
        }
    }


    const [tabHeight, setTabHeight] = useState(0);
    const tabRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (tabRef.current) {
                setTabHeight(window.innerHeight - tabRef.current.getBoundingClientRect().top);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);



    return (
        <div ref={tabRef}>
            <Container style={{height: `${tabHeight}px`, overflowY: 'scroll'}}>
                    <Stack className={"mx-auto p-3"} style={{width: getWidth(props.widthMultiplier), backgroundColor: '#004f59'}} gap={3}>
                        <Row>
                            <Banner />
                            <InputTile widthMultiplier={props.widthMultiplier} />
                            {tree?.displayNodes
                                ?.filter(node => node.type !== NodeType.PreviewDisplay)
                                .sort((a, b) => a.arrangement[getSize(props.widthMultiplier)].order - b.arrangement[getSize(props.widthMultiplier)].order)
                                .map((node, index, arr) => <DisplayPreviewTile node={node} widthMultiplier={props.widthMultiplier} size={getSize(props.widthMultiplier)} order={index} n={arr.length} />)
                            }
                        </Row>
                    </Stack>
            </Container>
        </div>
    )
}

function DisplayPreviewTile(props: {
    node: DisplayNode
    widthMultiplier: number
    size: "xs" | "md" | "lg"
    order: number
    n: number
}) {
    const {tree} = useAppSelector(selectTreeState)
    const dispatch = useAppDispatch()
    const span = props.node.arrangement[props.size].span

    const move = (direction: "forward" | "backward") => {
        if (tree) {
            dispatch(moveDisplay({id: props.node.id, size: props.size, direction, nodes: tree.displayNodes}))
        }
    }

    const changeWidth = (direction: "increase" | "decrease") => {
        if (tree) {
            dispatch(changeSpan({id: props.node.id, size: props.size, widthMultiplier: props.widthMultiplier, direction, nodes: tree.displayNodes}))
        }
    }

    return (
        <Col className={"p-1"} xs={props.node.arrangement[props.size]}>
            <Card className={"h-100"}>
                <Card.Body className={"h-100 d-flex flex-column"}>
                    <Row className={"mb-3"}>
                    <div style={{fontSize: 12}}>
                        {props.node.type}
                    </div>
                    <div style={{fontSize: 14, fontWeight: 600}}>
                        {props.node.name}
                    </div>
                    </Row>
                    <Row className={"mt-auto row-gap-1"}>
                        <Col className={"p-0"} xs={6}>
                            {"Order:"}
                        </Col>
                        <Col className={"d-flex justify-content-end"} xs={6}>
                            <ButtonGroup size={"sm"}>
                                <Button
                                    className={"btn-toggle"}
                                    onClick={() => move("backward")}
                                    disabled={props.order === 0}
                                >
                                    {"-"}
                                </Button>
                                <Button
                                    className={"btn-toggle"}
                                    onClick={() => move("forward")}
                                    disabled={props.order === props.n - 1}
                                >
                                    {"+"}
                                </Button>
                            </ButtonGroup>
                        </Col>
                        <Col className={"p-0"} xs={6}>
                            {"Width:"}
                        </Col>
                        <Col className={"d-flex justify-content-end"} xs={6}>
                            <ButtonGroup size={"sm"}>
                                <Button
                                    className={"btn-toggle"}
                                    disabled={span === props.widthMultiplier}
                                    onClick={() => changeWidth("decrease")}
                                >
                                    {"-"}
                                </Button>
                                <Button
                                    className={"btn-toggle"}
                                    disabled={span === 12}
                                    onClick={() => changeWidth("increase")}
                                >
                                    {"+"}
                                </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Col>
    )
}

function InputTile(props: {
    widthMultiplier: number
}) {
    const width = (props.widthMultiplier === 4) ? 8 : 12

    return (
        <Col className={"p-1"} xs={width}>
            <Card className={"h-100"} style={{opacity: '40%'}}>
                <Card.Body className={"h-100 d-flex flex-column"}>
                    <Row className={"mb-3"}>
                        <div style={{fontSize: 12}}>
                            {"Input fields"}
                        </div>
                        <div className={"pt-3"}>
                            <img src={"/editor/input-fields.svg"} alt={"input fields illustrations"} width={"100px"}/>
                        </div>
                    </Row>
                </Card.Body>
            </Card>
        </Col>
    )
}

function Banner() {
    return (
        <Col className={"p-1 pt-0 text-end"} style={{opacity: '40%'}} xs={12}>
            <MdMenu color={'white'} />
        </Col>
    )
}