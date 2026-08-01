import {Navbar, NavDropdown} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {useServices} from "../../contexts/ServiceContext";
import {useNavigate} from "react-router";

/**
 * Component that displays the user's email address and a logout button in the navbar
 */
export function NavBarUserInfo() {
    const {authService} = useServices()
    const [username, setUsername] = useState<string | undefined>(undefined)
    const navigate = useNavigate()


    // Signs the user out and navigates to the sign in page
    const onSignOut = () => {
        authService.signOut()
            .then(() => { navigate('/access/signin') })
            .catch(e => { window.alert(`Could not sign out: ${e}`) })
    }

    // Fetches the user's email address and sets it in the state
    useEffect(() => {
        authService.getAuthStatus(user => {
            if(!user) {
                navigate('/access/signin')
            } else {
                setUsername(user.email)
            }
        })
    }, [authService, navigate]);

    return (
        <>
            <Navbar.Text className={"ms-auto d-none d-md-flex"}>
                {"Signed in as: "}
            </Navbar.Text>
            <NavDropdown title={username} id={"user-dropdown"} className={"ms-2 me-3"}>
                <NavDropdown.Item onClick={() => onSignOut()}>
                    {"Logout"}
                </NavDropdown.Item>
            </NavDropdown>
        </>
    )
}