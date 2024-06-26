import {NavDropdown} from "react-bootstrap";
import {RootNode} from "@skogkalk/common/dist/src/parseTree/nodes/rootNode";
import {NodeType, ParseNode} from "@skogkalk/common/dist/src/parseTree";
import {updateTree} from "../../state/slices/treeState";
import {useAppDispatch, useAppSelector} from "../../state/hooks";
import {ReteFunctions} from "../../rete/createEditor";
import {selectFormulaInfo, selectPages} from "../../state/store";
import React, {useState} from "react";
import {ImportExportModal} from "../importExportModal/ImportExportModal";
import {EditorDataPackage} from "../../rete/editor";


function DropdownItemWithKeyBind(
    props: { name: string, keyBind: string }
) {

    return <div style={{justifyContent: "space-between", display: "flex"}}>
        <div>{props.name}</div><div style={{color: "gray"}}>{props.keyBind}</div>
    </div>
}

/**
 * The dropdown menu items for the navigation bar
 */
export function NavBarDropdowns(props: {functions: ReteFunctions | null}) {
    const dispatch = useAppDispatch();
    const formulaInfo = useAppSelector(selectFormulaInfo);
    const pagesInfo = useAppSelector(selectPages)
    const [showImportExportMenu, setShowImportExportMenu] = React.useState(false);
    const [exportData, setExportData] : [{graph: EditorDataPackage, parseNodes: ParseNode[]} | undefined, any] = useState()

    const updateExportData = async () => {
        const graph = await props.functions?.export();
        const parseNodes = await props.functions?.getCurrentTree();
        if(graph && parseNodes) {
            setExportData({ graph, parseNodes });
        }
    }

    return (
        <>
            <NavDropdown title={"File"} id={"file-dropdown"}>
                <NavDropdown.Item onClick={() => {
                    if(showImportExportMenu) {
                        setShowImportExportMenu(!showImportExportMenu)
                        return;
                    } else {
                        updateExportData().then(()=>{setShowImportExportMenu(true)})
                    }
                }}>
                    {"Import/Export"}
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => {
                    props.functions?.clear()
                }}>Clear</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title={"View"} id={"view-dropdown"}>
                <NavDropdown.Item onClick={() => {
                    props.functions?.viewControllers.resetView();
                }}><DropdownItemWithKeyBind name={"View all"} keyBind={"ctrl+a"}/></NavDropdown.Item>
                <NavDropdown.Item
                    onClick={()=>{
                        props.functions?.viewControllers.focusSelectedNode();
                    }}
                >
                    <DropdownItemWithKeyBind name={"Focus SEL"} keyBind={"ctrl+f"}/>
                </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title={"Test"} id={"file-dropdown"}>
                <NavDropdown.Item onClick={() => {
                    try {
                        const data = props.functions?.testJSON();
                        if(data) {
                            const version = formulaInfo.version;
                            const root: RootNode =  {
                                id: "0",
                                type: NodeType.Root,
                                value: 0,
                                formulaName: formulaInfo.name,
                                version: version.major * 1000000 + version.minor * 1000 + version.patch,
                                pages: pagesInfo.map(({page}, index)=>{return {pageName: page.title, ordering: index }}),
                                inputs:[]
                            }
                            data.push(root);
                            dispatch(updateTree(data));
                        }
                    } catch(e) {
                        console.log(e);
                    }
                }}>Test JSON</NavDropdown.Item>
            </NavDropdown>


            <ImportExportModal
                show={showImportExportMenu}
                onHide={() => setShowImportExportMenu(false)}
                functions={props.functions}
                exportData={exportData}
            />
        </>
    )
}