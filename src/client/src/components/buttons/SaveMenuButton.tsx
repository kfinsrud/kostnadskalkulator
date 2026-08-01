import {MdBookmarkAdd, MdDelete, MdLink, MdPlaylistAdd} from "react-icons/md";
import {Alert, Button, Form, InputGroup, Modal, OverlayTrigger, Table, Tooltip} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {SavedResult} from "../../types/SavedResult";
import { useAppSelector } from "../../state/hooks";
import {selectURLQueries} from "../../state/treeSelectors";
import {useParams} from "react-router";

export function SaveMenuButton() {
    const [show, setShow] = useState(false)
    const [results, setResults] = useState<SavedResult[]>([])
    const [resultName, setResultName] = useState("")

    useEffect(() => {
        getSavedResults()
    }, []);

    function getSavedResults() {
        setResults(JSON.parse(localStorage.getItem("savedResults") as string ?? "[]"))
    }

    function handelNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setResultName(e.target.value)
    }

    function deleteSavedResult(index: number) {
        results.splice(index, 1)
        localStorage.setItem("savedResults", JSON.stringify(results))
        getSavedResults()
    }

    function handleClose() {
        setShow(false)
    }

    return (
        <>
            <Button
                variant={"link"}
                onClick={() => setShow(!show)}
                style={{fontSize: '1.5em', color: "white"}}
            >
                <MdBookmarkAdd />
            </Button>
            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Lagrede resultater</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant={"danger"} className={"mb-4"} dismissible>
                        {"Resultatlisten vil forsvinne ved sletting av nettstedsdata. For trygg oppbevaring anbefales det å sikkerhetskopiere lenke"}
                    </Alert>

                    <Form.Label htmlFor={"lagreResultat"}>Lagre nytt resultat</Form.Label>
                    <InputGroup className={"mb-4"}>
                        <Form.Control
                            id={"lagreResultat"}
                            placeholder={"Tittel"}
                            aria-label={"Navn på resultat"}
                            value={resultName}
                            onChange={handelNameChange}/>
                        <SaveButton results={results} resultName={resultName} onSave={getSavedResults}/>
                    </InputGroup>
                    <SavedResultsTable results={results} handleClose={handleClose} deleteSavedResult={deleteSavedResult} />
                    {results.length === 0 && <em className={"ps-2"}>Tabellen er tom</em>}

                </Modal.Body>
            </Modal>
        </>

    )
}

function SavedResultsTable(props: {
    results: SavedResult[],
    handleClose: (link: string) => void,
    deleteSavedResult: (index: number) => void
}) {
    const savedResults = props.results.map(({date, name, link}, index) =>
        <tr style={{verticalAlign: "middle"}}>
            <td>
                <a href={link} onClick={() => props.handleClose(link)}>
                    {name}
                </a>
            </td>
            <td>{new Date(date).toLocaleDateString()}</td>
            <td>
                <OverlayTrigger
                    trigger={"click"}
                    overlay={<Tooltip>Link kopiert til utklippstavle</Tooltip>}
                    placement={"top"}
                    delay={{show: 250, hide: 400}}
                >
                    <Button onClick={() => navigator.clipboard.writeText(link)}>
                        <MdLink />
                    </Button>
                </OverlayTrigger>
            </td>
            <td><Button onClick={() => props.deleteSavedResult(index)}>
                <MdDelete/>
            </Button></td>
        </tr>
    )

    return (<Table>
            <thead>
            <tr>
                <th style={{width: '60%'}}>Navn</th>
                <th style={{width: '20%'}}>Dato</th>
                <th style={{width: '10%'}}>Lenke</th>
                <th style={{width: '10%'}}>Slett</th>
            </tr>
            </thead>
            <tbody>
            {savedResults}
            </tbody>
        </Table>
    )
}

function SaveButton(props: { results: SavedResult[], resultName: string, onSave: () => void }) {
    const queries = useAppSelector(selectURLQueries(','))
    const {name, version} = useParams()

    function save() {
        const url = `${window.location.origin}/kalkulator/${name}/${version}?${queries}`
        console.log(url)
        props.results.unshift({date: Date.now(), name: props.resultName, link: url})
        localStorage.setItem("savedResults", JSON.stringify(props.results))
        props.onSave()
    }



    return (
        <Button className={"btn-toggle"} onClick={save}>
            <MdPlaylistAdd />
        </Button>
    )
}