import {Button, Card, Col, Row} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {useGetCalculatorsInfoQuery} from "../state/store";

export function StartPage(
    props: { developerMode?: boolean }
) {
    return (
            <Card className={"pt-5"}>
                <Card.Body>
                    <Row className={"mx-auto"} style={{maxWidth: '800px'}}>
                        <Col xs={12} md={8}>
                            <h1 style={{fontWeight: 700, fontSize: '40px'}}>{props.developerMode? ""  : "Beregn produktivitet og kostnader ved skogsdrift"}
                            </h1>
                            <Row className={"mt-4 mb-4"} style={{fontWeight: 500}}>
                                <Col>
                                    <Row className={"mt-2 mb-4"} style={{fontSize: '18px'}}>
                                        {props.developerMode? <p>{"OBS! Dette er forhåndsvisning av kalkulatorer som er under utvikling. Disse bør ikke tas i bruk."}</p> :
                                        <p>{"Kalkulatoren gir en prognose på tidsbruk og kostnader basert på skogtype, driftsforhold og hvordan drifta er tilrettelagt."}</p>}
                                    </Row>
                                    <Row className={"mb-5"}>
                                        <CalculatorPicker developerMode={props.developerMode}/>
                                    </Row>
                                    <hr style={{color: "darkgray"}}/>
                                    { !props.developerMode &&
                                    <i>
                                        <Row className={"pt-4 mb-2"}>
                                            <p>{"Kalkulatoren er utviklet av Skogkurs i samarbeid med NIBIO, Allskog, Glommen Mjøsen Skog og MEF-Skog. Programmeringen er utført av en gruppe bachelor-studenter ved NTNU i Gjøvik."}</p>
                                        </Row>
                                        <Row>
                                            <p>{"Kalkulatoren er finansiert med støtte fra Skogbrukets Utviklingsfond og Skogbrukets Verdiskapingsfond."}</p>
                                        </Row>
                                    </i>}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
    )
}

function CalculatorPicker(
    props: { developerMode?: boolean }
) {
    const navigate = useNavigate()
    const {data, error, isLoading} = useGetCalculatorsInfoQuery()


    return (
        <>
            {isLoading && <p>{"Laster inn..."}</p>}
            {data && data.length === 0 && <p>{"Ingen kalkulatorer funnet"}</p>}
            {error && <p>{"En feil oppstod ved henting av kalkulatorer"}</p>}
            {data &&
                <Row className={"row-gap-4"}>
                    {data.filter(c=>!props.developerMode || c.disabled==true).map((calculator) => {
                        return (
                            <Col xs={6}>
                                <CalculatorButton
                                    title={calculator.name}
                                    onclick={() => {navigate(`/kalkulator/${encodeURI(calculator.name)}/${calculator.version}`)}}
                                    disabled={!props.developerMode && calculator.disabled}/>
                            </Col>
                        )
                    })}
                </Row>
            }
        </>
    )
}

function CalculatorButton(props: {
    title: string,
    onclick: () => void,
    disabled: boolean
}) {
    return (
        <Button
            variant={"secondary"}
            className={"d-flex align-items-center w-100 h-100 pt-2 btn-calculator"}
            disabled={props.disabled}
            onClick={() => props.onclick()}
        >
            <Col>
                <div className={"title"}>{props.title}</div>
                {props.disabled &&
                    <div className={"description"}>{"Kommer senere"}</div>
                }
            </Col>
        </Button>
    )

}