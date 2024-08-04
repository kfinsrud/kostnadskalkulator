import type {DropdownInput, NumberInputNode} from "./nodes/inputNode";
import {InputType} from "./nodes/inputNode";
import {NodeType} from "./nodes/parseNode";
import type {OutputNode} from "./nodes/outputNode";
import type {DisplayNode} from "./nodes/displayNode";


let ID = 0;

function getUniquieID() {
    return (ID++).toString();
}


const radiusInput : NumberInputNode = {
    id: getUniquieID(),
    name: "radius",
    value: 1,
    ordering: 0,
    defaultValue: 1,
    legalValues: [{min: 0, max: null}],
    infoText: "Radius av sirkel",
    simpleInput: true,
    inputType: InputType.Float,
    unit: "meter",
    pageName: "Sirkel",
    type: NodeType.NumberInput,
}

const breddeInput : NumberInputNode = {
    id: getUniquieID(),
    name: "bredde",
    value: 1,
    ordering: 0,
    defaultValue: 1,
    legalValues: [{min: 0, max: null}],
    infoText: "Bredde av rektangel",
    simpleInput: true,
    inputType: InputType.Float,
    unit: "meter",
    pageName: "Rektangel",
    type: NodeType.NumberInput,
}

const hoydeInput : NumberInputNode = {
    id: getUniquieID(),
    name: "høyde",
    value: 1,
    ordering: 1,
    defaultValue: 1,
    legalValues: [{min: 0, max: null}],
    infoText: "Høyde av rektangel",
    simpleInput: true,
    inputType: InputType.Float,
    unit: "meter",
    pageName: "Rektangel",
    type: NodeType.NumberInput,
}


const enhetDropdown : DropdownInput = {
    id: getUniquieID(),
    name: "enhet",
    value: 1,
    ordering: 0,
    defaultValue: 1,
    dropdownAlternatives: [
        {value: 1, label: "m"},
        {value: 100, label: "cm"},
        {value: 0.001, label: "km"}
    ],
    infoText: "Enhet",
    simpleInput: true,
    pageName: "Enhet",
    type: NodeType.DropdownInput,
    unit: "meter"
}



const circleAreaOutput: OutputNode = {
    id: getUniquieID(),
    name: "Sirkelareal",
    type: NodeType.Output,
    value: Math.PI,
    color: "#5555FF",
    unit: "m^2",
    child: {
        id: getUniquieID(),
        type: NodeType.Mul,
        value: Math.PI,
        left: {
            id: getUniquieID(),
            type: NodeType.Number,
            value: Math.PI,
        },
        right: {
            id: getUniquieID(),
            type: NodeType.Pow,
            value: 1**2,
            left: {
                id: getUniquieID(),
                type: NodeType.Mul,
                value: 1,
                left: {
                    id: getUniquieID(),
                    type: NodeType.Reference,
                    value: 1,
                    referenceID: radiusInput.id
                },
                right: {
                    id: getUniquieID(),
                    type: NodeType.Reference,
                    value: 1,
                    referenceID: enhetDropdown.id
                }
            },
            right: {
                id: getUniquieID(),
                type: NodeType.Number,
                value: 2
            }
        }
    }
}


const sirkelOmkrets: OutputNode = {
    id: getUniquieID(),
    name: "Sirkelomkrets",
    type: NodeType.Output,
    value: 2 * Math.PI,
    unit: "meter",
    color: "#5555FF",
    child: {
        id: getUniquieID(),
        type: NodeType.Prod,
        value: 2 * Math.PI,
        inputs: [
            {
                id: getUniquieID(),
                type: NodeType.Reference,
                value: 1,
                referenceID: radiusInput.id
            },
            {
                id: getUniquieID(),
                type: NodeType.Number,
                value: Math.PI,
            },
            {
                id: getUniquieID(),
                type: NodeType.Number,
                value: 2
            },
            {
                id: getUniquieID(),
                type: NodeType.Reference,
                value: 1,
                referenceID: enhetDropdown.id
            }
        ]
    }
}

const rektangelOmkrets: OutputNode = {
    id: getUniquieID(),
    type: NodeType.Output,
    value: 4,
    name: "Rektangelomkrets",
    color: "#55FF55",
    unit: "meter",
    child: {
        id: getUniquieID(),
        type: NodeType.Add,
        value: 4,
        left: {
            id: getUniquieID(),
            type: NodeType.Prod,
            value: 2,
            inputs: [
                {
                    id: getUniquieID(),
                    type: NodeType.Number,
                    value: 2
                },
                {
                    id: getUniquieID(),
                    type: NodeType.Reference,
                    value: 1,
                    referenceID: hoydeInput.id
                },
                {
                    id: getUniquieID(),
                    type: NodeType.Reference,
                    value: 1,
                    referenceID: enhetDropdown.id
                }
            ]
        },
        right: {
            id: getUniquieID(),
            type: NodeType.Prod,
            value: 2,
            inputs: [
                {
                    id: getUniquieID(),
                    type: NodeType.Number,
                    value: 2
                },
                {
                    id: getUniquieID(),
                    type: NodeType.Reference,
                    value: 1,
                    referenceID: breddeInput.id
                },
                {
                    id: getUniquieID(),
                    type: NodeType.Reference,
                    value: 1,
                    referenceID: enhetDropdown.id
                }
            ]
        }
    }
}

const rektangelAreal: OutputNode = {
    id: getUniquieID(),
    type: NodeType.Output,
    name: "Rektangelareal",
    color: "#55FF55",
    value: 0,
    unit: "m^2",
    child: {
        id: getUniquieID(),
        type: NodeType.Prod,
        value: 0,
        inputs: [
            {
                id: getUniquieID(),
                type: NodeType.Reference,
                value: 0,
                referenceID: hoydeInput.id
            },
            {
                id: getUniquieID(),
                type: NodeType.Reference,
                value: 0,
                referenceID: breddeInput.id,
            },
            {
                id: getUniquieID(),
                type: NodeType.Pow,
                value: 0,
                left: {
                    id: getUniquieID(),
                    type: NodeType.Reference,
                    value: 0,
                    referenceID: enhetDropdown.id
                },
                right: {
                    id: getUniquieID(),
                    type: NodeType.Number,
                    value: 2
                }
            }
        ]
    }
}

const grafOmkrets : DisplayNode = {
    id: getUniquieID(),
    type: NodeType.PieDisplay,
    name: "Omkrets",
    value: 0,
    inputs: [
        {
            id: getUniquieID(),
            type: NodeType.Reference,
            value: Math.PI * 2,
            referenceID: sirkelOmkrets.id
        },
        {
            id: getUniquieID(),
            type: NodeType.Reference,
            value: 4,
            referenceID: rektangelOmkrets.id
        }
    ],
    inputOrdering: [
        {
            outputID: sirkelOmkrets.id,
            outputLabel: "Sirkel"
        },
        {
            outputID: rektangelOmkrets.id,
            outputLabel: "Rektangel"
        }
    ],
    arrangement: {
        xs: {order: 0, span: 12},
        md: {order: 0, span: 6},
        lg: {order: 0, span: 4}
    }
}

const arealGraf: DisplayNode =  {
    id: getUniquieID(),
    name: "Areal",
    value: 0,
    type: NodeType.PieDisplay,
    inputs: [
        {
            id: getUniquieID(),
            value: 0,
            type: NodeType.Reference,
            referenceID: circleAreaOutput.id,
        },
        {
            id: getUniquieID(),
            value: 0,
            type: NodeType.Reference,
            referenceID: rektangelAreal.id
        }
    ],
    inputOrdering: [
        {
            outputID: circleAreaOutput.id,
            outputLabel: "Sirkel"
        },
        {
            outputID: rektangelAreal.id,
            outputLabel: "Rektangel"
        }
    ],
    arrangement: {
        xs: {order: 0, span: 12},
        md: {order: 0, span: 6},
        lg: {order: 0, span: 4}
    }
}







export const testTree = [
    {
        id: getUniquieID(),
        value: 0,
        formulaName: "testformel",
        type: NodeType.Root,
        version: 1,
        pages: [
            {
                pageName: "Sirkel",
                ordering: 3
            },
            {
                pageName: "Rektangel",
                ordering: 2
            },
            {
                pageName: "Enhet",
                ordering: 1
            }
        ],
        inputs: [
            grafOmkrets,
            arealGraf
        ]
    },
    radiusInput,
    breddeInput,
    hoydeInput,
    enhetDropdown,
    circleAreaOutput,
    sirkelOmkrets,
    rektangelAreal,
    rektangelOmkrets
]


