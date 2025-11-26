import {Button, ButtonGroup, Col, Form, Row} from "react-bootstrap";
import ReactApexChart from "react-apexcharts";
import React, {useState} from "react";
import {ApexOptions} from "apexcharts";
import {FcIdea} from "react-icons/fc";
import {ResultCard} from "./ResultCard";
import {
    DropdownInput,
    getNodeByID,
    getResultsForInputs,
    GraphDisplayNode,
    InputNode,
    NodeType,
    OutputNode,
    TreeState
} from "../parseTree";
import {isDropdownInputNode, NumberInputNode} from "../parseTree/nodes/inputNode";
import {parseHtmlString} from "../util/htmlParsing";
import DOMPurify from "dompurify";


export function ResultGraph(
    props: { treeState: TreeState | undefined, displayData: GraphDisplayNode }
) {
    const groups = props.displayData.resultGroups;
    const [selectedGroup, setSelectedGroup] = useState(groups[0] ?? undefined);

    const inputNodes = props.treeState?.inputs
        .filter(node=>props.displayData.displayedInputIDs.includes(node.id));

    const [selectedId, setSelectedId] = useState(inputNodes?.[0]?.id ?? "")

    const sanitizeHTML = (html: string | undefined) => {
        if(html != undefined) {
            return DOMPurify.sanitize(html.replace(/<p>([\s\S]*?)<\/p>|([\s\S]*)/g, '$1'))
        } else {
            return "";
        }
    }

    const node = getNodeByID(props.treeState, selectedId) as InputNode
    const value = getSelectedXLabel(node)
    const yUnit = sanitizeHTML(selectedGroup?.unit)
    const xUnit = sanitizeHTML(node?.unit)

    const series : { labels: string[], values: string[] } = selectGraphXAxisInput(node);
    const xValues = series.values.map(v=>parseFloat(v));
    const results = props.treeState && getResultsForInputs(props.treeState, node?.id || "", xValues);




    const chartSeries: ApexAxisChartSeries = results
        ?.filter((result)=>{
            if(selectedGroup === undefined) return false;
            return selectedGroup?.inputIDs.includes(result.outputID)})
        .map(entry=>{
        const output = getNodeByID(props.treeState, entry.outputID);
        return {
            name: (output as OutputNode).name,
            data: entry.values.map(v=>(Number.isNaN(v)?null:v)),
            color: (output as OutputNode).color
        }
    }) || [];


    const children = (
        <>
            <Form>
                <Row className={"row-gap-2 mb-4"}>
                    <Col md={12} lg={12}>
                        <Form.Text>{"Velg kostnadsdriver:"}</Form.Text>
                        <Form.Select
                            aria-label={`select field to draw graph for`}
                            value={node?.name}
                            onChange={e => {
                                const input = inputNodes?.find(i=>i.name === e.currentTarget.value);
                                if (input) setSelectedId(input.id);
                            }}
                        >
                            {inputNodes?.map((input) => <option key={input?.id} value={input?.name}>{input?.name}</option>)}
                        </Form.Select>
                    </Col>

                    <Col md={12} lg={12}>

                        <Row>
                            <Form.Text>{"Velg resultattype:"}</Form.Text>
                        </Row>
                        <Row>
                            <ButtonGroup aria-label="Basic example" className={"d-inline"} >
                                {groups.map((group)=>{
                                    return <Button
                                        active={selectedGroup?.id === group.id}
                                        className={"btn-toggle"}
                                        onClick={()=>{
                                            setSelectedGroup(group);
                                        }}
                                    >
                                        {group.name}
                                    </Button>
                                })}
                            </ButtonGroup>
                        </Row>
                    </Col>
                </Row>
            </Form>
            <DrawGraph
                series={chartSeries}
                xLabels={series.labels}
                xUnit={xUnit}
                yUnit={yUnit} // popup unit
                yLabel={selectedGroup?.name || ""}
                actualValue={value}
            />
        </>
    )

    return (
        <ResultCard
            icon={<FcIdea />}
            title={props.displayData.name}
            children={children}
            infoText={props.displayData.infoText ?? ""}/>
    )
}


function DrawGraph(
    props: {
        series: ApexAxisChartSeries
        xLabels: string[]
        xUnit: string
        yUnit: string
        yLabel: string
        actualValue: string
    }) {

    const chartOptions: ApexOptions = {
        chart: {
            type: 'line',
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        series: props.series,
        legend: {
            position: 'top',
        },
        xaxis: {
            categories: props.xLabels,
            title: {
                text: parseHtmlString(props.xUnit),
                offsetY: -8
            }

        },
        yaxis: {
            title: {
                text: `${props.yLabel} (${parseHtmlString(props.yUnit)})`,
            },
            tickAmount: 5,
            decimalsInFloat: 1,
        },
        annotations: {
            xaxis: [{
                x: props.actualValue,
                borderColor: '#48D1CC',
                label: {
                    borderColor: '#48D1CC',
                    offsetX: 18,
                    style: {
                        color: '#fff',
                        background: '#48D1CC',
                    },
                    text: 'Valgt verdi',
                }
            }]
        },
        tooltip: {
            x: {
                formatter: (_value: number, {dataPointIndex}) => `${props.xLabels[dataPointIndex]} ${props.xUnit}`
            },
            y: {
                formatter: (value) => `${Math.round(value)} ${props.yUnit}`
            }
        }
    }



    return (
        <ReactApexChart
            options={chartOptions}
            series={props.series}
            type={"line"}
            height={250}
        />
    )

}

function selectGraphXAxisInput(input: InputNode | undefined) {
    if(input === undefined) {
        return { labels: [], values: [] }
    }
    if(isDropdownInputNode(input)) {
        return {
            labels: (input as DropdownInput).dropdownAlternatives.map(d=>d.label),
            values: (input as DropdownInput).dropdownAlternatives.map(d=>d.value.toString())
        }
    } else {
        // return rangeOystein(input as NumberInputNode, 10);
        // return rangeAdaptive(input as NumberInputNode);
        return minMaxRange(input as NumberInputNode);
        // const steps = 5;
        // const baseValue = input.value;
        // const stepSize = Math.ceil(baseValue * 0.1);
        // const range = [];
        // for(let i = -steps; i<= steps; i++) {
        //     range.push((i*stepSize + baseValue).toString());
        // }
        // return {
        //     labels: range,
        //     values: range
        // }
    }
}

function getSelectedXLabel(input: InputNode | undefined) {
    switch (input?.type) {
        case NodeType.NumberInput:
            return input.value.toString()
        case NodeType.DropdownInput:
            const options = (input as DropdownInput).dropdownAlternatives
            return options.find(option => option.value === input.value)?.label ?? ""
        default:
            return ""
    }
}


function rangeOystein(input: NumberInputNode, steps: number = 5) {
    const baseValue = input.value;
    const stepSize = Math.ceil(baseValue * 0.1);
    const range = [];
    const labelRange = [];
    for(let i = -steps; i<= steps; i++) {
        const value = i * stepSize + baseValue;
        range.push(value.toString());
        if(i % 2 == 0) {
            labelRange.push(value.toString());
        } else {
            labelRange.push("");
        }
    }
    return {
        labels: labelRange,
        values: range
    }

}

function minMaxRange(input: NumberInputNode) {
    if(input.legalValues.length == 0) {
        return rangeOystein(input, 10);
    }
    let min;
    let max;
    for(const legalRange of input.legalValues) {
        if(min === undefined || (legalRange.min ?? 0) < min) {
            min = legalRange.min ?? 0;
        }
        if(max === undefined || (legalRange.max ?? 0) > max) {
            max = legalRange.max ?? 0;
        }
    }

    const valueRange = max! - min!;
    const stepSize = valueRange / 10;
    let decimals;
    if(stepSize < 0.5) {
        decimals = 2;
    } else if ( stepSize < 10) {
        decimals = 1;
    } else {
        decimals = 0;
    }

    const range = [];
    const labelRange = []
    for (let i = 0; i <= 10; i++) {
        const value = min! + i * stepSize;
        const labelString = (value==Math.floor(value)) ? value.toString() : value.toFixed(decimals);
        range.push(value.toString());
        labelRange.push(labelString);
    }
    return {
        labels: labelRange,
        values: range
    }
}

