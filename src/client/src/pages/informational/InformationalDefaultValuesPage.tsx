import {Card} from "react-bootstrap";

export function InformationalDefaultValuesPage() {
    return (
        <Card>
            <Card.Body>
                <Card.Title>
                    {"Tallgrunnlag"}
                </Card.Title>
                <p>Kalkulatoren er forhåndsutfylt med verdier som gir et resultat uten at du setter andre verdier.  <b>For å få mest mulig riktige tall for kostnader og produktivitet, må alle variabler vurderes og settes på nytt</b>.</p>
            </Card.Body>
        </Card>
    )
}