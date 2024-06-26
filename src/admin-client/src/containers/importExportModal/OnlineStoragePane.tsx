import {Calculator} from "@skogkalk/common/dist/src/types/Calculator";
import {useAddCalculatorMutation, useGetCalculatorSchemaQuery, useGetCalculatorsInfoQuery} from "../../state/store";
import {FormulaInfoContainer} from "../formulaInfoContainer";
import {Button, ButtonGroup, Dropdown, DropdownButton, Spinner, Stack, Table} from "react-bootstrap";
import {useEffect, useRef, useState} from "react";
import {useServices} from "../../contexts/ServiceContext";

/**
 * A pane for importing and exporting calculators from/to the online database through the API
 */
export function OnlineStoragePane(props: {
    onLoad: (schema: Calculator["reteSchema"]) => void,
    calculator: Calculator
}) {

    // fetch metadata of stored calculators from the API
    const {data, error, isLoading, refetch} = useGetCalculatorsInfoQuery()
    return (
        <>
            <h3>{"Database Storage"}</h3>
            <p>
                {"The recommended way to save a calculator. The calculator can be saved with or without publishing it to customer app."}
            </p>
            <Stack className={"mb-4"} direction={"horizontal"} gap={3}>
                <FormulaInfoContainer/>
                <SaveToAPI onSaved={() => refetch()} calculator={props.calculator} />
            </Stack>
            <h5>{"Database stored calculators"}</h5>
            <Table size={"sm"}>
                <thead>
                <tr>
                    <th>Name</th>
                    <th className={"text-end"}>Version</th>
                    <th className={"text-end"}>Published</th>
                </tr>
                </thead>
                <tbody>
                {data && data.map((calculator) => <TableRow key={calculator.name + calculator.version} onLoad={props.onLoad} calculator={calculator} />)}
                {data && !data.length &&
                    <tr>
                        <td colSpan={3}>
                            {"No calculators found"}
                        </td>
                    </tr>
                }
                </tbody>
            </Table>
            {error && <p>{"Error in communication with API"}</p>}
            {isLoading && <Spinner />}
            <Button onClick={refetch}>
                {"Force Refresh"}
            </Button>
        </>
    )
}


/**
 * A button for saving the current calculator to the online database through the API
 * @param props.onSaved A callback function to be called when the calculator is saved
 */
function SaveToAPI(props: {
    calculator: Calculator,
    onSaved: () => void,
}) {
    const [addCalculator, {isLoading}] = useAddCalculatorMutation()
    const {authService} = useServices()


    const sendToAPI = async (publish: boolean, developerMode: boolean) => {
        if (!props.calculator.reteSchema?.graph || props.calculator.treeNodes?.length === 1) {

            window.alert("Cannot save empty graph to database")
        } else if (!props.calculator.name || !props.calculator.version) {
            window.alert("Cannot save a calculator without a name and version")
        } else {
            const updatedCalculator = {...props.calculator, published: publish, disabled: developerMode}
            authService.getToken()
                .then(token =>
                    addCalculator({calculator: updatedCalculator, token: token})
                        .unwrap()
                        .then(() => window.alert("Successfully saved to database"))
                        .catch((err) => {
                            if ('status' in err && err.status === 401) {
                                window.alert("Invalid authentication token, try logging in and out again")
                            } else {
                                window.alert("Error saving to database")
                            }
                        })
                )
                .catch(() => window.alert("Error getting authentication token, try logging in and out again"))
        }
    }


    // // keep a reference to the latest onSaved function
    // const onSaved = useRef(props.onSaved)
    //
    // // keep the onSaved function up to date without causing a rerender
    // useEffect(() => {
    //     onSaved.current = props.onSaved
    // }, [props.onSaved]);
    //
    // // call the onSaved function when the data is fetched
    // useEffect(() => {
    //     if (success) {
    //         window.alert("Successfully saved to database")
    //         onSaved.current()
    //     } else if (addCalculatorStatus.isError) {
    //         if ('') {
    //
    //         }
    //         window.alert("Error saving to database")
    //     }
    // }, [addCalculatorStatus])


    return (
        <>
            <DropdownButton id={"save options"} as={ButtonGroup} title={isLoading ? "Exporting..." : "Export"} style={{height: '58px'}}>
                <Dropdown.Item onClick={() => sendToAPI(false, false)}>Save only</Dropdown.Item>
                <Dropdown.Item onClick={() => sendToAPI(true, false)}>Save and publish</Dropdown.Item>
                <Dropdown.Item onClick={() => sendToAPI(true, true)}>Save and publish as WIP</Dropdown.Item>
            </DropdownButton>
        </>
    )

}



/**
 * A row in the table of stored calculators
 */
function TableRow(props: {
    onLoad: (schema: Calculator["reteSchema"]) => void,
    calculator: Calculator,
}) {
    // format the version number to xxx.xxx.xxx without leading zeros
    const version: string = [
        props.calculator.version / 1000000,
        (props.calculator.version / 1000) % 1000,
        props.calculator.version % 1000
    ].map(n => Math.floor(n).toString()).join('.')

    // trigger for fetching the schema from the API when button/link is clicked
    const [haltFetch, setHaltFetch] = useState(true)
    // fetch the rete schema and redux store from the API
    const {data, error, isLoading} = useGetCalculatorSchemaQuery({name: props.calculator.name, version: props.calculator.version}, {skip: haltFetch})

    // keep a memoized reference to the latest onLoad function instead of using it directly,
    // as this this avoids a infinite loop on the useEffect below because
    const onLoad = useRef(props.onLoad)
    useEffect(() => {
        onLoad.current = props.onLoad
    }, [props.onLoad]);

    // call the onLoad function when the data is fetched
    useEffect(() => {
        if (data) {
            onLoad.current(data)
        } else if (error) {
            window.alert("Error fetching calculator schema")
        }
    }, [data, error]);

    return (
        <tr>
            <td>
                <Button variant={'link'} onClick={() => setHaltFetch(false)}>
                    {props.calculator.name}
                </Button>
                {isLoading && " (loading...)"}
            </td>
            <td className={"text-end"}>{version}</td>
            <td className={"text-end"}>{props.calculator.published ? '✓' : ''}</td>
        </tr>
    )
}


