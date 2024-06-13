import {Drag} from "rete-react-plugin"
import {HiddenOnMinimized, MinimizeButton} from "../sharedComponents";
import {TextInputField} from "../../../../components/input/textInputField";
import {Provider} from "react-redux";
import {selectPages, store} from "../../../../state/store";
import {Col, Row} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import {NumberInputField} from "../../../../components/input/numberInputField";
import {InputGroup} from "react-bootstrap";
import {DropdownInputControlData} from "./dropdownInputControlData";
import {DropdownSelection} from "../../../../components/input/dropdownSelection";
import {OptionSwitch} from "../../../../components/input/optionSwitch";
import {useAppDispatch, useAppSelector} from "../../../../state/hooks";
import {useEffect, useState} from "react";
import {addInputToPage} from "../../../../state/slices/pages";
import {SlArrowDown, SlArrowUp} from "react-icons/sl";
import {NodeControl} from "../../nodeControl";
import {TextEditor} from "../../../../components/input/textEditor";


export function DropdownInputControlContainer(
    props: { data: NodeControl<DropdownInputControlData> }
) {
    // Wrap in store provider to access Redux state
    return <Provider store={store}>
        <DropdownInputControlContent data={props.data}/>
    </Provider>
}


export function DropdownInputControlContent(
    props: { data: NodeControl<DropdownInputControlData> }
) {
    const data = props.data.getData();
    const pages = useAppSelector(selectPages);
    const dispatch = useAppDispatch();

    const [nextId, setNextId] = useState(0);

    useEffect(() => {
        // console.log(pages)
        const ordering = pages
            .find(({page}) => {
                return page.title === data.pageName
            })?.page.inputIds
            .findIndex((id) => {
                return id === data.id
            })
        if (ordering !== undefined) {
            props.data.set({pageOrdering: ordering})
            // console.log("ordering of", data.name, props.data.get('pageOrdering'))
        }
    }, [data.id, data.name, data.pageName, pages, props.data])

    return <>
        <Drag.NoDrag>
            <MinimizeButton onClick={() => {
                props.data.options.minimized = !props.data.options.minimized;
                props.data.update();
            }}/>

            <TextInputField
                value={data.name}
                inputHint={'Input Name'}
                onChange={
                    (value: string) => {
                        props.data.set({name: value});
                    }
                }/>


            <HiddenOnMinimized
                minimized={props.data.options.minimized}
                content={
                    <>
                        <Row>
                            <Col>
                                <DropdownSelection
                                    inputHint={"Set default selection"}
                                    dropdownAlternatives={data.dropdownOptions}
                                    selection={
                                        data.dropdownOptions.findIndex(item =>
                                            item.label === data.defaultKey
                                        )}
                                    onChange={(index) => {
                                        props.data.set({
                                                defaultKey: data.dropdownOptions[index].label,
                                                defaultValue: data.dropdownOptions[index].value
                                            }
                                        )

                                        // console.log(data.defaultKey)
                                    }}
                                />

                            </Col>
                            <Col>
                                <OptionSwitch inputHint={"Simple input"} on={data.simpleInput} onChange={
                                    (on: boolean) => {
                                        props.data.set({simpleInput: on});
                                    }
                                }/>
                            </Col>
                        </Row>
                        <Button
                            onDoubleClick={(e) => {
                                e.stopPropagation()
                            }}
                            onPointerDown={(e) => {
                                e.stopPropagation()
                            }}
                            onClick={() => {

                                data.dropdownOptions.push({
                                    value: 0,
                                    label: `option ${data.dropdownOptions.length + 1}`,
                                    key: nextId,
                                })
                                props.data.set({dropdownOptions: data.dropdownOptions})
                                setNextId(nextId + 1);
                                // console.log(nextId);
                            }}
                        >
                            Add option
                        </Button>
                        {data.dropdownOptions.map((item, index) => {
                            return <InputGroup key={item.key} className="mb-3">

                                <TextInputField
                                    value={item.label}
                                    inputHint={"name"}
                                    isValid={(newLabel) =>
                                        // compare new item label to all others:
                                        data.dropdownOptions.filter((filteredItem) =>
                                            filteredItem !== item).every((entry) =>
                                            newLabel !== entry.label)}

                                    onChange={(newLabel) => {
                                        data.dropdownOptions[index].label = newLabel
                                        props.data.set({dropdownOptions: data.dropdownOptions})

                                    }}
                                />
                                <NumberInputField
                                    inputHint={"value"}
                                    value={data.dropdownOptions[index].value}
                                    onChange={(value) => {
                                        data.dropdownOptions[index].value = value;
                                        props.data.set({dropdownOptions: data.dropdownOptions})
                                    }}
                                    onIllegalValue={(value) => {
                                        console.log("Illegal value", value)
                                    }}
                                    legalRanges={[]}
                                />
                                <Button onClick={() => {
                                    if (index > 0) {
                                        [data.dropdownOptions[index], data.dropdownOptions[index - 1]] =
                                            [data.dropdownOptions[index - 1], data.dropdownOptions[index]]
                                        props.data.set({dropdownOptions: data.dropdownOptions})
                                    }
                                }}><SlArrowUp/></Button>
                                <Button onClick={() => {
                                    if (index >= 0 && index < data.dropdownOptions.length - 1) {
                                        [data.dropdownOptions[index], data.dropdownOptions[index + 1]] =
                                            [data.dropdownOptions[index + 1], data.dropdownOptions[index]]
                                        props.data.set({dropdownOptions: data.dropdownOptions})
                                    }
                                    props.data.update();
                                }}><SlArrowDown/></Button>
                                <Button
                                    onClick={() => {
                                        data.dropdownOptions.splice(index, 1);
                                        props.data.update();
                                    }}
                                    onPointerDown={(e) => {
                                        e.stopPropagation()
                                    }}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation()
                                    }}
                                >X</Button>
                            </InputGroup>
                        })
                        }
                        <Row>
                            <Col>
                                <DropdownSelection
                                    inputHint={"Select page"}
                                    selection={pages.find(({page}) => page.title === data.pageName)?.page.ordering}
                                    dropdownAlternatives={pages.map(({page}) => {
                                        return {label: page.title, value: page.ordering}
                                    })}
                                    onChange={(selected: number) => {
                                        const pageName = pages.find(({page}) => page.ordering === selected)?.page.title;
                                        props.data.set({pageName: pageName});
                                        props.data.update();
                                        if (pageName) {
                                            dispatch(addInputToPage({nodeID: props.data.get('id'), pageName: pageName}))
                                        }
                                    }}
                                />
                            </Col>
                        </Row>
                        <TextEditor
                            value={props.data.get('infoText')}
                            buttonText={"Edit"}
                            onSave={(value: string) => {
                                props.data.set({infoText: value})
                            }}
                        />
                    </>
                }
            />
        </Drag.NoDrag>

    </>
}