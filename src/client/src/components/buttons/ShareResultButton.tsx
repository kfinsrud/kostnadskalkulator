import {Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {MdShare} from "react-icons/md"
import React from "react";
import {useAppSelector} from "../../state/hooks";
import {selectURLQueries} from "../../state/treeSelectors";
import {useParams} from "react-router";

/**
 * ShareResultButton is a button that copies the current url to the clipboard
 */
export function ShareResultButton() {
    const queries = useAppSelector(selectURLQueries(','))
    const {name, version} = useParams()

    const share = async () => {

        const url = `${window.location.origin}/kalkulator/${name}/${version}?${queries}`

        try {
            // copy to clipboard
            await navigator.clipboard.writeText(url);

            // open share context menu if possible
            if (navigator.canShare({url: url})) {
                await navigator.share({url: url})
            }
        } catch (err) {
            // error triggers if share context menu is cancelled
            console.error('Failed to share!', err);
        }
    }

    return (
        <>
            <OverlayTrigger
                trigger={"click"}
                overlay={<Tooltip>Link kopiert til utklippstavle</Tooltip>}
                placement={"top"}
                delay={{show: 250, hide: 400}}
            >
                <Button
                    variant={"link"}
                    onClick={() => share()}
                    style={{fontSize: '1.5em', color: "white"}}
                >
                    <MdShare />
                </Button>
            </OverlayTrigger>
    </>
    )
}