import {CommentNodeControlData} from "./commentNode";
import {Form} from "react-bootstrap"
import {NodeControl} from "../nodeControl";
import {Drag} from "rete-react-plugin"

export function CommentNodeControl(
    props: { data: NodeControl<CommentNodeControlData>}
) {
    return <Drag.NoDrag>
        <Form.Control
            value={props.data.get("text")}
            onChange={(e)=>{
                props.data.set({text: e.currentTarget.value})
            }}
            as="textarea" rows={3}
        />
    </Drag.NoDrag>
}