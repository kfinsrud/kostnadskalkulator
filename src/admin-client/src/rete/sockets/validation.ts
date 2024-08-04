import {ClassicPreset, NodeEditor} from "rete";
import {Schemes} from "../nodes/types";
import {ResultSocket} from "./resultSocket";
import {NumberSocket} from "./numberSocket";


export function canCreateConnection(editor: NodeEditor<Schemes>, connection: Schemes["Connection"]) {
    const { source, target } = getConnectionSockets(editor, connection);

    return source && target && source.isCompatibleWith(target) && connection.target != connection.source
}

type Sockets = ResultSocket | NumberSocket;
type Input = ClassicPreset.Input<Sockets>;
type Output = ClassicPreset.Output<Sockets>;

function getConnectionSockets(
    editor: NodeEditor<Schemes>,
    connection: Schemes["Connection"]
) {
    const source = editor.getNode(connection.source);
    const target = editor.getNode(connection.target);

    const output =
        source &&
        (source.outputs as Record<string, Input>)[connection.sourceOutput];
    const input =
        target && (target.inputs as Record<string, Output>)[connection.targetInput];

    return {
        source: output?.socket,
        target: input?.socket
    };
}