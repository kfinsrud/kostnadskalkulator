import {NodeType} from "../nodes/parseNode";

export function getUnaryOperation(type: NodeType) : (input: number) => number {
    switch(type) {
        case NodeType.Exp: return Math.exp;
        case NodeType.Ceil: return Math.ceil;
        case NodeType.Floor: return Math.floor;
        case NodeType.Round: return Math.round;
        default: throw new Error("Invalid node type");
    }
}

export function getBinaryOperation(type: NodeType): (l:number, r:number) => number {
    switch(type) {
        case NodeType.Sqrt: return (l,r)=>Math.pow(l, 1/(r || 2));
        case NodeType.Add : return (l,r)=>l+r;
        case NodeType.Mul : return (l, r) => l*r;
        case NodeType.Div : return (l, r) => l/r;
        case NodeType.Sub : return (l, r) => l-r;
        case NodeType.Pow : return (l,r)=> l**r;
        default: throw new Error("Invalid node type");
    }
}


export function getNaryOperation(type: NodeType) : (arr:number[])=>number {
    switch(type) {
        case NodeType.Prod: return (arr)=>{return arr.reduce((a,b)=>a*b)};
        case NodeType.Sum: return (arr)=>{return arr.reduce((a,b)=>a+b)};
        case NodeType.Min: return (arr) => {return arr.reduce((a, b) => Math.min(a,b))};
        case NodeType.Max: return (arr) => {return arr.reduce((a,b) => Math.max(a,b))};
        default: throw new Error("Invalid node type");
    }
}