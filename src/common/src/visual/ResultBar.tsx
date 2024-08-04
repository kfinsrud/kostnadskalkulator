import {FcBullish} from "react-icons/fc";
import React from "react";
import ReactApexChart from "react-apexcharts";
import {ApexOptions} from "apexcharts";
import {ResultCard} from "./ResultCard";
import {DisplayBarNode, getNodeByID, TreeState} from "../parseTree";
import {OutputNode as ParseOutputNode} from "../parseTree";



export function ResultBar(props: {
    treeState: TreeState | undefined,
    displayData: DisplayBarNode,
}) {
    const nodes = props.displayData.inputOrdering.map((value)=>{
        const node = getNodeByID(props.treeState!, value.outputID) as ParseOutputNode;
        return { color: node.color, ordering: value.ordering, label: value.outputLabel, value: node.value, unit: props.displayData.unit }
    }).sort((a, b)=>(a.ordering ?? 0) - (b.ordering??0));

    const fallbackMax = Math.max(...nodes.map((node)=>node.value));
    const children = nodes.map((node) => {
        return (
            <DrawBar
                title={node.label}
                value={node.value}
                unit={props.displayData.unit}
                max={Math.max(props.displayData.max, fallbackMax)}
                color={node.color}
            />
        )

    })


    return (
        <ResultCard
            icon={<FcBullish />}
            title={props.displayData.name}
            infoText={props.displayData.infoText || ""}
        >
            {children}
        </ResultCard>

    )
}

function DrawBar(props: {
    title: string,
    value: number,
    unit: string,
    max: number,
    color: string,
}) {
    const options: ApexOptions = {
        chart: {
            type: 'bar',
            sparkline: {
                enabled: true
            },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '30%',
                colors: {
                    backgroundBarColors: ['#f4f4f4'],
                },
            },
        },
        stroke: {
            width: 0,
        },
        series: [{
            name: props.title,
            data: [props.value]
        }],
        title: {
            floating: true,
            offsetX: -10,
            offsetY: 5,
            style: {
                fontSize: '16px',
                fontWeight: '500'
            },
            text: props.title
        },
        subtitle: {
            floating: true,
            align: 'right',
            offsetY: 5,
            offsetX: 8,
            text: `${Math.round(props.value)} ${props.unit}`,
            style: {
                fontSize: '16px',
            }
        },
        tooltip: {
            enabled: false
        },
        yaxis: {
            max: props.max
        },
        fill: {
            opacity: 1.0,
            colors: [props.color],
        },
        states: {
            hover: {
                filter: {
                    type: 'none'
                }
            },
            active: {
                allowMultipleDataPointsSelection: false,
                filter: {
                    type: 'none'
                }
            }
        }
    }
    return (

        <ReactApexChart
            options={options}
            series={options.series}
            type="bar"
            height={90}
        />
    )
}
