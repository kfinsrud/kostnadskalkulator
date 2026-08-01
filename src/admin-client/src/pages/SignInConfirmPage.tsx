import {useServices} from "../contexts/ServiceContext";
import {useNavigate} from "react-router";
import React, {FormEvent, useCallback, useEffect, useState} from "react";
import {Col} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import {EmailInputFields, LoadingSpinner} from "./SignInPage";

/**
 * Page for confirming the one-time signin link of a user
 */
export function SignInConfirmPage() {
    const {authService} = useServices()
    const navigate = useNavigate()

    // The state in the confirmation process
    const [state, setState] = useState<"ready" | "loading" | "success" | "error" | "invalidLink">(authService.getConfirmEmail() ? "success" : "ready")
    // whether the email address was stored in the local storage
    const [rememberEmail] = useState<boolean>(authService.getConfirmEmail() !== null)
    // The email address to confirm
    const [mailAddress, setMailAddress] = useState<string>(authService.getConfirmEmail() ?? "")

    /**
     * Verifies the user of the link after retrieving the email address that was used
     */
    const verify = useCallback((mailAddress: string, e?: FormEvent) => {
        e?.preventDefault()
        setState("loading")
        authService.confirmSignIn(window.location.href, mailAddress)
            .then(() => { navigate("/") })
            .catch(() => { setState("error") })
    }, [authService, navigate])


    // Check if the link is valid and proceeds to the confirmaion process if the email address is stored
    useEffect(() => {
        if (!authService.isSignInLink(window.location.href)) {
            setState("invalidLink")
        } else if (rememberEmail) {
            verify(mailAddress)
        }
    }, [verify, state, mailAddress, authService, rememberEmail]);




    return (
        <Container className="mx-auto" style={{paddingTop: '150px', maxWidth: '450px'}}>
            <Col>
                {state === "invalidLink" && <ExpiredLink />}
                {state !== "invalidLink" && !rememberEmail && (
                    <>
                        <h1 className={"mb-5"}>{"Nearly there..."}</h1>
                        <p>{"It appears you may have switched device or browser, which requires us to ask for your email address again for confirmation."}</p>
                        <EmailInputFields
                            onSubmit={e => verify(mailAddress, e)}
                            setEmail={setMailAddress}
                            loading={state === "loading"}
                        />
                        {state === "loading" && <LoadingSpinner/>}
                        {state === "error" && <ErrorMessage />}
                    </>
                )}
            </Col>
        </Container>
    )
}

/**
 * Component that displays an error message when the link is invalid or expired
 */
function ExpiredLink() {
   return (
       <>
           <h1 className={"mb-5"}>{"Oops..."}</h1>
           <p>{"Link is invalid or has expired"}</p>
       </>
   )
}

/**
 * Component that displays an error message when the email address is not verified
 */
function ErrorMessage() {
    return (
        <p className={"mt-3"}>{"Could not verify your identity, this can happen if you entered a different email address or the link has expired."}</p>
    )
}