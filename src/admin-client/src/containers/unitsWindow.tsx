import Container from "react-bootstrap/Container";
import {Col, InputGroup, Row} from "react-bootstrap";
import {useAppDispatch, useAppSelector} from "../state/hooks";
import {TextEditor} from "../components/input/textEditor";
import {selectUnits} from "../state/store";
import {addUnit, moveUnit, removeUnit, Unit, updateUnit} from "../state/slices/units";
import parse from 'html-react-parser';
import Button from "react-bootstrap/Button";
import {SlArrowDown, SlArrowUp} from "react-icons/sl";
import {useState} from "react";
import {CKEditorUnits} from "../components/input/CKEditorUnits";

export function UnitBox(props: {
    unit: Unit,
    onChange: (newName: string) => void,
    onMove: (newIndex: number) => void,
    onDelete: () => void,
    totalUnits: number
}) {
    const [unitName, setUnitName] = useState(props.unit.name);
    return <Row>
        <Col sm={4}>
            {parse(unitName)}
        </Col>
        <Col sm={8}>
            <InputGroup>
                <Button
                    disabled={ props.unit.ordering == 0 }
                    onClick={() => {
                    props.onMove(props.unit.ordering - 1)
                }}><SlArrowUp/></Button>
                <Button disabled={ props.unit.ordering == props.totalUnits-1 } onClick={() => {
                    props.onMove(props.unit.ordering + 1)
                }}><SlArrowDown/></Button>
                <Button onClick={() => {
                    props.onDelete()
                }}>X</Button>
                <CKEditorUnits
                    value={unitName}
                    onSave={(newName: string) => {
                        props.onChange(newName)
                        setUnitName(newName)
                    }}/>
            </InputGroup>
        </Col>
    </Row>
}

export function UnitsWindow() {
    const units = useAppSelector(selectUnits);
    const dispatch = useAppDispatch();

    return <>
        <Container style={{minHeight: "100%", overflowY:"scroll", maxHeight:"100%"}}>
            <Row>
                <Col>
                    <Button
                        onClick={()=>{
                            dispatch(addUnit({name: "", ordering: 0}))
                        }}
                    >
                        Add new unit
                    </Button>
                </Col>
            </Row>
            {units.map(({id, unit}) => {
                return <Row key={id}>
                    <UnitBox
                        totalUnits={units.length}
                        unit={unit}
                        onChange={(newName) => {
                            dispatch(updateUnit({...unit, name: newName}))
                        }}
                        onMove={(newIndex: number) => {
                            dispatch(moveUnit({oldIndex: unit.ordering, newIndex: newIndex}))
                        }}
                        onDelete={() => {
                            dispatch(removeUnit(unit.ordering))
                        }}/>
                </Row>
            })}
        </Container>
    </>
}