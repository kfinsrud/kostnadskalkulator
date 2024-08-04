import {Calculator} from "@skogkalk/common/dist/src/types/Calculator";
import {useAddCalculatorMutation, useGetCalculatorSchemaQuery, useGetCalculatorsInfoQuery} from "../../state/store";
import {FormulaInfoContainer} from "../formulaInfoContainer";
import {Button, ButtonGroup, Dropdown, DropdownButton, Spinner, Stack, Table} from "react-bootstrap";
import {useEffect, useRef, useState} from "react";
import {useServices} from "../../contexts/ServiceContext";
import {useTranslation} from 'react-i18next';

/**
 * A pane for importing and exporting calculators from/to the online database through the API
 */
export function OnlineStoragePane(props: {
    onLoad: (schema: Calculator["reteSchema"]) => void,
    calculator: Calculator
}) {
    const {t} = useTranslation();
    // fetch metadata of stored calculators from the API
    const {data, error, isLoading, refetch} = useGetCalculatorsInfoQuery()
    return (
        <>
            <h3>{t("titles.import_export_modal.db_storage")}</h3>
            <p>
                {t('instructions.import_export_modal.db_storage')}
            </p>
            <Stack className={"mb-4"} direction={"horizontal"} gap={3}>
                <FormulaInfoContainer/>
                <SaveToAPI onSaved={() => refetch()} calculator={props.calculator} />
            </Stack>
            <h5>{t('titles.import_export_modal.calculator_table')}</h5>
            <Table size={"sm"}>
                <thead>
                <tr>
                    <th>{t('titles.import_export_modal.calculator_table_name_col')}</th>
                    <th className={"text-end"}>{t('titles.import_export_modal.calculator_table_ver_col')}</th>
                    <th className={"text-end"}>{t('titles.import_export_modal.calculator_table_pub_col')}</th>
                    <th className={"text-end"}>{t('titles.import_export_modal.calculator_table_WIP_col')}</th>
                </tr>
                </thead>
                <tbody>
                {data && data.map((calculator) => <TableRow key={calculator.name + calculator.version} onLoad={props.onLoad} calculator={calculator} />)}
                {data && !data.length &&
                    <tr>
                        <td colSpan={3}>
                            {t('warnings.import_export_modal.no_calculators')}
                        </td>
                    </tr>
                }
                </tbody>
            </Table>
            {error && <p>{t('warnings.import_export_modal.api_error')}</p>}
            {isLoading && <Spinner />}
            <Button onClick={refetch}>
                {t('buttons.import_export_modal.refresh')}
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
    const {t} = useTranslation();
    const [addCalculator, {isLoading}] = useAddCalculatorMutation()
    const {authService} = useServices()


    const sendToAPI = async (publish: boolean, developerMode: boolean) => {
        if (!props.calculator.reteSchema?.graph || props.calculator.treeNodes?.length === 1) {

            window.alert(t('warnings.import_export_modal.cannot_save_empty'))
        } else if (!props.calculator.name || !props.calculator.version) {
            window.alert(t('warnings.import_export_modal.cannot_save_no_name_or_version'))
        } else {
            const updatedCalculator = {...props.calculator, published: publish, disabled: developerMode}
            authService.getToken()
                .then(token =>
                    addCalculator({calculator: updatedCalculator, token: token})
                        .unwrap()
                        .then(() => window.alert(t('warnings.import_export_modal.save_successful_db')))
                        .catch((err) => {
                            if ('status' in err && err.status === 401) {
                                window.alert(t('warnings.import_export_modal.invalid_auth_token'))
                            } else {
                                window.alert('warnings.import_export_modal.error_saving_db')
                            }
                        })
                )
                .catch(() => window.alert(t('warnings.import_export_modal.error_auth_token_retrieval')))
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
            <DropdownButton id={"save options"} as={ButtonGroup} title={isLoading ?
                t('buttons.import_export_modal.db_storage.exporting') : t('buttons.import_export_modal.db_storage.export')} style={{height: '58px'}}>
                <Dropdown.Item onClick={() => sendToAPI(false, false)}>{t('buttons.import_export_modal.db_storage.export_alternatives.save')}</Dropdown.Item>
                <Dropdown.Item onClick={() => sendToAPI(true, false)}>{t('buttons.import_export_modal.db_storage.export_alternatives.publish')}</Dropdown.Item>
                <Dropdown.Item onClick={() => sendToAPI(true, true)}>{t('buttons.import_export_modal.db_storage.export_alternatives.developerPublish')}</Dropdown.Item>
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
    const {t} = useTranslation();
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
                {isLoading && t('general.import_export_modal.loading_calculators')}
            </td>
            <td className={"text-end"}>{version}</td>
            <td className={"text-end"}>{(props.calculator.published && !props.calculator.disabled) ? '✓' : ''}</td>
            <td className={"text-end"}>{props.calculator.disabled ? '✓' :''}</td>
        </tr>
    )
}


