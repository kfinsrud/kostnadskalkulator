import {ReteFunctions} from "../../rete/createEditor";
import {Col, Modal, Row,} from "react-bootstrap";
import {Calculator} from "@skogkalk/common/dist/src/types/Calculator";
import {setTreeState} from "../../state/slices/treeState";
import {setPagesState} from "../../state/slices/pages";
import {setFormulaInfoState} from "../../state/slices/formulaInfo";
import {useAppDispatch, useAppSelector} from "../../state/hooks";
import {selectCalculator} from "../../state/selectors";
import {OnlineStoragePane} from "./OnlineStoragePane";
import {LocalStoragePane} from "./LocalStoragePane";
import {ParseNode} from "@skogkalk/common/dist/src/parseTree";
import {EditorDataPackage} from "../../rete/editor";
import {setUnitsState} from "../../state/slices/units";
import {setDisplayState} from "../../state/slices/displayArrangements";

/**
 * A modal dialogue for importing and exporting calculators from/to the database and local storage
 */
export function ImportExportModal(props: {
    show: boolean,
    onHide: () => void,
    functions: ReteFunctions | null
    exportData: { graph: EditorDataPackage, parseNodes: ParseNode[] } | undefined
}) {

    return <>
    {props.exportData !== undefined ?
        <ImportExportModalContent
            show={props.show}
            onHide={props.onHide}
            functions={props.functions}
            exportData={props.exportData}
        /> :
        <></>
    }
    </>
}




function ImportExportModalContent( props: {
    show: boolean,
    onHide: () => void,
    exportData: { graph: EditorDataPackage, parseNodes: ParseNode[] },
    functions: ReteFunctions | null
}) {
    const dispatch = useAppDispatch()
    const currentCalculator = useAppSelector(selectCalculator(props.exportData))

    const importCalculator = (data: Calculator["reteSchema"]) => {
        const emptyCanvas = currentCalculator.treeNodes?.length === 1 // only root node is present
        if (data && (emptyCanvas || window.confirm("Unsaved changes will be lost"))) {
            props.functions?.import(data.graph);
            dispatch(setDisplayState(data.store.displayArrangements));
            dispatch(setTreeState(data.store.treeState));
            dispatch(setPagesState(data.store.pages));
            dispatch(setFormulaInfoState(data.store.formulaInfo));
            dispatch(setUnitsState(data.store.units))

            props.onHide()
        }
    }

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size={"xl"}
        >
            <Modal.Header closeButton>
                {"Calculator Import & Export"}
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col xs={7}>
                        <OnlineStoragePane onLoad={importCalculator} calculator={currentCalculator} />
                    </Col>
                    <Col className={"justify-content-center d-flex"}>
                        {/* divider */}
                        <div className={"h-100 border"} style={{width: '1px'}} />
                    </Col>
                    <Col xs={4}>
                        <LocalStoragePane onLoad={importCalculator} calculator={currentCalculator} />
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    )
}


