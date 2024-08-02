import {BaseNode} from "../baseNode";
import {NodeControl} from "../nodeControl";
import {NodeType} from "@skogkalk/common/dist/src/parseTree";
import {NodeAction, NodeActionType} from "../../nodeActions";
import {CommentNodeControl} from "./commentNodeControl";

export interface CommentNodeControlData {
    text: string
}

export class CommentNode extends BaseNode <
    {},{},
    { c : NodeControl<CommentNodeControlData>}
>
{
    constructor(
        private dispatch: (action:NodeAction)=>void,
        id?: string
    ) {
        super(NodeType.Comment, 400,400,"Comment", id);
        const initialState : CommentNodeControlData = {
            text: ""
        }

        this.addControl(
            "c",
            new NodeControl<CommentNodeControlData>(
                initialState,
                {
                    onUpdate: (data: Partial<CommentNodeControlData>) => {
                        if(data.text) {
                            dispatch(
                                {
                                    type: NodeActionType.UpdateRender, nodeID: this.id
                                }
                            )
                        }
                    },
                    minimized: false
                },
                CommentNodeControl
            ),

        )
    }

    data(input:{}) {
        return {};
    }

    serializeControls() {
        return this.controls.c.getData();
    }

    deserializeControls(serializedData: any) {
        this.controls.c.set(serializedData);
    }
}