import {ButtonGroup, Card, Col, Row} from "react-bootstrap";
import {selectPages, selectPageSelection, selectTreeState} from "../state/store";
import {useAppDispatch, useAppSelector} from "../state/hooks";
import Container from "react-bootstrap/Container";
import {getNodeByID, InputNode} from "@skogkalk/common/dist/src/parseTree";
import {InputFieldPreview} from "@skogkalk/common/dist/src/visual/inputField/InputField";
import Button from "react-bootstrap/Button";
import {SlArrowDown, SlArrowUp} from "react-icons/sl";
import {moveInputOnPage} from "../state/slices/pages";


export function PageEditor() {
    const tree = useAppSelector(selectTreeState);
    const pages = useAppSelector(selectPages);
    const selectedPageIndex = useAppSelector(selectPageSelection);
    const selectedPage = pages[selectedPageIndex ?? 0]?.page;
    const dispatch = useAppDispatch();

    return (
        <Card style={{height: "100%", boxShadow: "inset 0px 0px 10px"}}>
            <Card.Body style={{height:"100%"}}>
                <Card.Title>
                    {`Page Preview: ${selectedPage?.title || "No page selected"}`}
                </Card.Title>
                <Card.Text style={{height: "90%"}}>
                    <Container style={{overflowY: 'scroll', maxHeight: "100%", minHeight:"100%"}}>
                        {selectedPage?.inputIds.map((id, index) => {
                            if (tree.tree) {
                                const input = getNodeByID(tree.tree, id) as InputNode;
                                if (!input) {
                                    return null
                                }
                                return <Row key={id}>
                                    <Col md={8}>
                                        <InputFieldPreview node={input}/>
                                    </Col>
                                    <Col>
                                        <ButtonGroup>
                                            <Button disabled = {index == 0} onClick={() => {
                                                dispatch(moveInputOnPage({title: selectedPage.title, newIndex: index - 1, oldIndex: index}))
                                            }
                                            }>
                                                <SlArrowUp/>
                                            </Button>
                                            <Button disabled = {index == selectedPage?.inputIds.length-1} onClick={() => {
                                                dispatch(moveInputOnPage({title: selectedPage.title, newIndex: index + 1, oldIndex: index}))
                                            }
                                            }>
                                                <SlArrowDown/>
                                            </Button>
                                        </ButtonGroup>
                                    </Col>
                                </Row>
                            } else {
                                throw new Error("Tree not loaded");
                            }

                        })}
                    </Container>
                </Card.Text>
            </Card.Body>
        </Card>
    );
}