import {CalculatorData} from "../types/CalculatorData";
import {useAppDispatch, useAppSelector} from "../state/hooks";
import {Form} from "react-bootstrap";
import React from "react";
import {setCalculatorData} from "../state/calculatorSlice";
import {selectCalculatorData} from "../state/calculatorSelectors";

export function CalculatorPickerDropdown(props: {calculations: CalculatorData[]}) {
    // Get the default value for the field from the store
    const data = useAppSelector(selectCalculatorData)
    // Get the dispatch function from the store
    const dispatch = useAppDispatch()

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const calculation = props.calculations.find(calculation => calculation.id === parseInt(event.target.value))
        if (calculation !== undefined) {
            dispatch(setCalculatorData(calculation))
        }

    }

    return (
        <Form.Select
            aria-label={`dropdown ${data.name}`}
            className="field"
            value={data.id ?? ""}
            onChange={e => handleChange(e)}>
            <option value="" disabled>Velg et alternativ</option>
            {props.calculations.map(calculation => <option value={calculation.id}>{calculation.name}</option>)}
        </Form.Select>
    )
}