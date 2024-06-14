import {Editor} from "../../rete/editor";
import {Button, Card, Col, Row} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {selectTreeState} from "../../state/store";
import {useAppSelector} from "../../state/hooks";
import {TreeState} from "@skogkalk/common/dist/src/parseTree";
import {TextInputField} from "../../components/input/textInputField";
import {useState} from "react";

export function NodeSearchParent(
    props: { editor?: Editor }
) {
    const tree = useAppSelector(selectTreeState);
    const [searchTerm, setSearchTerm] = useState("");
    return <Card style={{height: "100%", boxShadow: "inset 0px 0px 10px"}}>
        <Card.Body style={{height: "100%"}}>
            <Card.Title>
                <TextInputField inputHint="Search" value={searchTerm} onChange={(s)=>{
                    setSearchTerm(s);
                }}></TextInputField>
            </Card.Title>
            <Card.Text style={{maxHeight: "100%", height: "90%",overflowY: "scroll"}}>
                {tree.tree && <NodeSearch searchTerm={searchTerm} tree={tree.tree} editor={props.editor}></NodeSearch>}
            </Card.Text>
        </Card.Body>
    </Card>
}

export function NodeSearch(
    props: { tree: TreeState , searchTerm: string, editor?: Editor}
) {
    const displayNodes = props.tree.displayNodes;
    const inputNodes = props.tree.inputs;

    const nodes = [...displayNodes, ...inputNodes];

    nodes.sort((a,b)=>a.name.localeCompare(b.name));

    return <Container style={{maxHeight: "100%"}}>
        {nodes.filter(node=>{
            return props.searchTerm== "" || node.name.toUpperCase().includes(props.searchTerm.toUpperCase())}
        ).map(node=>{
            return <Row>
                <Col sm={9}>{node.name}</Col>
                <Col sm={3}><Button onClick={()=>{
                    console.log(props.editor != undefined);
                    props.editor?.focusViewOnSelectedNode(node.id)
                }}>select</Button></Col>
                </Row>
        })}
    </Container>
}

