import {Card, Col, Row} from "react-bootstrap";
import {selectPages, selectPageSelection, selectTreeState} from "../state/store";
import {useAppSelector} from "../state/hooks";
import Container from "react-bootstrap/Container";
import {getNodeByID, InputNode} from "@skogkalk/common/dist/src/parseTree";
import {InputFieldPreview} from "@skogkalk/common/dist/src/visual/inputField/InputField";
import Button from "react-bootstrap/Button";


export function PageEditor() {
    const tree = useAppSelector(selectTreeState);
    const pages = useAppSelector(selectPages);
    const selectedPageIndex = useAppSelector(selectPageSelection);
    const selectedPage = pages[selectedPageIndex??0]?.page;

    return (
        <Card>
            <Card.Title>
                {`Page: ${selectedPage?.title || "No page selected"}`}
            </Card.Title>
            <Card.Body>
                <Container>
                    {selectedPage?.inputIds.map((id) => {
                        console.log(id);
                        if(tree.tree) {
                            const input = getNodeByID(tree.tree, id) as InputNode;
                            if(!input) { return null }
                            return <Row key={id}  >
                                <Col lg={10}>
                                    <InputFieldPreview node={input}/>
                                </Col>
                                <Col lg={2}>
                                    <Button>Up</Button>
                                </Col>

                            </Row>
                        } else {
                            throw new Error("Tree not loaded");
                        }

                    })}
                </Container>
            </Card.Body>
        </Card>
    );
}