import {createEditor} from "./rete/createEditor";
import {useRete} from "rete-react-plugin";
import Container from 'react-bootstrap/Container';
import {Col, Row} from "react-bootstrap";
import {useEffect} from "react";
import {Provider} from "react-redux";
import {selectPages, selectTreeState, store, StoreState} from "./state/store";
import {useAppDispatch, useAppSelector} from "./state/hooks";
import {setTreeState, updateTree} from "./state/slices/treeState";
import {NavBar} from "./containers/navbar/NavBar";
import {Page, removeInputFromPage, setPagesState} from "./state/slices/pages";
import {setFormulaInfoState} from "./state/slices/formulaInfo";
import {selectRootNode} from "./state/selectors";
import {SidePanel} from "./containers/panels/SidePanel";
import {RetePanel} from "./containers/panels/RetePanel";
import {getNodeByID, ParseNode, TreeState} from "@skogkalk/common/dist/src/parseTree";
import {ModulePanel} from "./containers/panels/modulePanel";
import "./App.css";
import {setUnitsState} from "./state/slices/units";
import {setDisplayState} from "./state/slices/displayArrangements";

export default function App() {
    const [reteRef, functions] = useRete(createEditor);
    const rootNode = useAppSelector(selectRootNode)
    const dispatch = useAppDispatch();
    const pages = useAppSelector(selectPages);
    const treeState = useAppSelector(selectTreeState)


    useEffect(() => {
        // ensures that the tree state is updated when certain changes occur
        functions?.registerCallBack('store', (nodes?: ParseNode[]) => {
            if(nodes && rootNode) {
                dispatch(updateTree([rootNode, ...nodes]));
            }
        })
    }, [functions, dispatch, rootNode]);

    useEffect(()=>{ // To avoid injecting cleanup logic into rete, but can be changed later
        updatePageInputs(treeState.tree, pages, (id: string, page: string)=>{
            dispatch(removeInputFromPage({nodeID: id, pageName: page}));
        })
    }, [dispatch, pages, treeState])




    useEffect(()=> {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                functions?.save();
                if (localStorage) {
                    localStorage.setItem('store', JSON.stringify(store.getState()));
                }
            }
            if (e.key === 'Delete') {
                e.preventDefault();
                functions?.deleteSelected();
            }
            if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                functions?.viewControllers.resetView();
            }
            if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                functions?.viewControllers.focusSelectedNode();
            }
            if (e.key === 'o' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                functions?.load();
                if (localStorage) {
                    const reduxState = localStorage.getItem('store');
                    if (reduxState) {
                        const state = JSON.parse(reduxState) as StoreState;
                        dispatch(setTreeState(state.treeState));
                        dispatch(setPagesState(state.pages));
                        dispatch(setFormulaInfoState(state.formulaInfo));
                        dispatch(setUnitsState(state.units));
                        dispatch(setDisplayState(state.displayArrangements));
                    }
                }
            }
        }
        // register the event listener
        document.addEventListener('keydown', handleKeyDown);
        // return a cleanup function that removes the event listener when component is rerendered,
        // otherwise it can cause multiple event listener registrations and memory leaks
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }

    // }, [functions, dispatch, updateTreeState])
}, [functions, dispatch, rootNode])




  return (
      <Provider store={store}>
              <NavBar functions={functions} />
              <Container className={"h-100"} fluid>
                  <Row className={"h-100"}>
                      <Col style={{padding: 0, flex: 1}}>
                          <ModulePanel editor={functions?.editor}></ModulePanel>
                          <RetePanel reteRef={reteRef} />
                      </Col>
                      <Col className={"h-100"} style={{ padding: 0, width: '500px', flex: 'none'}}>
                          <SidePanel reteFunctions={functions} />
                      </Col>
                  </Row>
              </Container>

      </Provider>
  );
}



function updatePageInputs(
    tree: TreeState | undefined,
    pages: {id: number, page: Page}[],
    onInvalidEntry: (id: string, pageName: string)=>void)
{
    if(tree !== undefined) {
        pages.forEach(({page})=>{
            page.inputIds.forEach((inputID)=>{
                if(getNodeByID(tree, inputID) === undefined) {
                    onInvalidEntry(inputID, page.title);
                }
            })
        })
    }
}
