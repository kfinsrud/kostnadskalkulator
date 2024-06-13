import Container from "react-bootstrap/Container";
import {Card, InputGroup, Row} from "react-bootstrap";
import {useAppDispatch, useAppSelector} from "../state/hooks";
import {selectPages} from "../state/store";
import {TextInputField} from "../components/input/textInputField";
import {addPage, movePage, Page, removePage, setPageSelection, updatePage} from "../state/slices/pages";
import Button from "react-bootstrap/Button";
import {SlArrowDown, SlArrowUp, SlPencil} from "react-icons/sl";

export function PageBox(
    props: {
        page: Page,
        onChange: (newTitle: string) => void,
        onMove: (newIndex: number) => void,
        onDelete: () => void
    }
) {
    const dispatch = useAppDispatch();



    return <Row>
        <InputGroup>
            <TextInputField value={props.page.title} inputHint={"Page name"} onChange={(newTitle) => {props.onChange(newTitle);}}/>
            <Button onClick={()=>{props.onMove(props.page.ordering-1)}}><SlArrowUp/></Button>
            <Button onClick={()=>{props.onMove(props.page.ordering+1)}}><SlArrowDown/></Button>
            <Button onClick={()=>{props.onDelete()}}>X</Button>
            <Button onClick={()=>{dispatch(setPageSelection(props.page.ordering))}}><SlPencil/></Button>
        </InputGroup>
    </Row>
}


export function PagesWindow() {
    const pages = useAppSelector(selectPages);
    const dispatch = useAppDispatch();


    return <>
        <Card style={{height: "100%", boxShadow: "inset 0px 0px 10px"}} >
            <Card.Body style={{height:"100%"}}>
                <Card.Title style={{height:"10%"}}>
                    <Button onClick={()=>{dispatch(addPage({title: "", ordering: -1, subPages:[], inputIds:[]}))}}>Add page</Button>
                </Card.Title>
                <Card.Text style={{height:"90%"}}>
                    <Container style={{ minHeight: "100%", maxHeight:"100%", overflowY: "scroll"}}>
                        {pages.map(({id, page}) => {
                            return <Row key={id}>
                                <PageBox
                                    page={page}
                                    onChange={(newTitle)=>{
                                        dispatch(updatePage({...page, title: newTitle}))
                                    }}
                                    onMove={(newIndex)=>{
                                        dispatch(movePage({oldIndex: page.ordering, newIndex: newIndex}))
                                    }}
                                    onDelete={()=>{dispatch(removePage(page.ordering))}}
                                />
                            </Row>
                        })}
                    </Container>
                </Card.Text>
            </Card.Body>
        </Card>
    </>
}