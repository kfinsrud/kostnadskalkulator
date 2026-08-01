import {ResultContent} from "../../containers/ResultContent";
import Sheet from "react-modal-sheet";
import React, {useEffect, useState} from "react";
import {Alert, Button, Container} from "react-bootstrap";
import {ResultParameters} from "../../components/result/ResultParameters";
import {ResultPeek} from "../../components/result/ResultPeek";
import {useLocation, useNavigate, useParams} from "react-router";
import {useGetCalculatorTreeQuery} from "../../state/store";
import {initiateTree} from "../../state/treeSlice";
import {treeStateFromData} from "@skogkalk/common/dist/src/parseTree";
import {useAppDispatch} from "../../state/hooks";
import {setInputsByURLQueries} from "@skogkalk/common/dist/src/parseTree/treeState";

export function CalculatorPage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const {name, version} = useParams()

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
    useEffect(() => {
        const updateMedia = () => { setIsDesktop(window.innerWidth >= 768) };
        window.addEventListener('resize', updateMedia);
        return () => window.removeEventListener('resize', updateMedia);
    })


    const validParams = name && version && !isNaN(parseInt(version))
    const [parseError, setParseError] = useState(false)
    const {data, error, isLoading} = useGetCalculatorTreeQuery({name: name!, version: parseInt(version!)}, {skip: !validParams})



    useEffect(() => {
        if (data) {
            const queries = Array.from(new URLSearchParams(location.search).entries())
            let tree = treeStateFromData(data)
            try {
                tree = setInputsByURLQueries(tree, queries, ',') ?? tree
            } catch (_) {
                setParseError(true)
            }
            dispatch(initiateTree({tree}))
            navigate(`/kalkulator/${name}/${version}`, {replace: true})
        }
    }, [data, dispatch, location.search, name, navigate, version]);


    return (
        <>
            {!validParams && <Alert>{"Ugyldig nettaddresse, sjekk navn på kalkulator og versjon"}</Alert>}
            {isLoading && <Alert variant={"info"}>{"Laster inn kalkulator"}</Alert>}
            {error && <Alert>{"En feil oppstod ved henting av kalkulator"}</Alert>}
            {parseError && <Alert>{"En feil oppstod ved innlesning av felter fra URL"}</Alert>}
            {data && isDesktop && <DesktopView />}
            {data && !isDesktop && <MobileView />}
        </>
    )
}

function MobileView() {
    const [isOpen, setIsOpen] = useState(false)

    const onTapClose = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsOpen(false)
    }

        return (
        <>
            <ResultParameters />
            <div style={{height: '100px'}} />
            <Button
                className={"fixed-bottom"}
                onClick={() => setIsOpen(true)}
            >
                <ResultPeek />
            </Button>
            <Sheet
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}>
                <Sheet.Container>
                    <Sheet.Header
                        onTap={onTapClose}
                    />
                    <Sheet.Content>
                        <Sheet.Scroller>
                            <Container>
                                <ResultContent />
                            </Container>
                        </Sheet.Scroller>
                    </Sheet.Content>
                </Sheet.Container>
            </Sheet>
        </>
    )
}

function DesktopView() {
    return (
        <ResultContent />
    )
}