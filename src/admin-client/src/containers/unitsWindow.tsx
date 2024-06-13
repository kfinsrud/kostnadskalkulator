import Container from "react-bootstrap/Container";
import {InputGroup, Row} from "react-bootstrap";
import {useAppDispatch, useAppSelector} from "../state/hooks";
import {TextEditor} from "../components/input/textEditor";
import {selectUnits} from "../state/store";
import {addUnit, moveUnit, removeUnit, Unit, updateUnit} from "../state/slices/units";
import parse from 'html-react-parser';
import Button from "react-bootstrap/Button";
import {SlArrowDown, SlArrowUp} from "react-icons/sl";
import {useState} from "react";

export function UnitBox(props: {
    unit: Unit,
    onChange: (newName: string) => void,
    onMove: (newIndex: number) => void,
    onDelete: () => void
}) {
    const [unitName, setUnitName] = useState(props.unit.name);
    return <Row>
        <InputGroup>
            {parse(unitName)}
            <Button onClick={() => {
                props.onMove(props.unit.ordering - 1)
            }}><SlArrowUp/></Button>
            <Button onClick={() => {
                props.onMove(props.unit.ordering + 1)
            }}><SlArrowDown/></Button>
            <Button onClick={() => {
                props.onDelete()
            }}>X</Button>
            <TextEditor
                value={unitName}
                buttonText={"Edit"}
                onSave={(newName: string) => {
                    props.onChange(newName)
                    setUnitName(newName)
                }}/>
        </InputGroup>
    </Row>
}

export function UnitsWindow() {
    const units = useAppSelector(selectUnits);
    const dispatch = useAppDispatch();

    return <>
        <Container style={{minHeight: "100%", overflowY:"scroll", maxHeight:"100%"}}>
            <Row>
                <TextEditor
                    value={""}
                    buttonText={"Add Unit"}
                    onSave={(value: string) => {
                        dispatch(addUnit({name: value, ordering: 1}))
                    }}/>
            </Row>
            {units.map(({id, unit}) => {
                return <Row key={id}>
                    <UnitBox
                        unit={unit}
                        onChange={(newName) => {
                            updateUnit({...unit, name: newName})
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