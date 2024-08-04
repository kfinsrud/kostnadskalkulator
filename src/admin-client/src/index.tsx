import React, {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './i18n';
import App from "./App";
import {Provider as StoreProvider} from "react-redux";
import {store} from "./state/store";
import {ServiceContextType, ServiceProvider} from "./contexts/ServiceContext";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {SignInPage} from "./pages/SignInPage";
import {SignInConfirmPage} from "./pages/SignInConfirmPage";
import {FirebaseAuthService} from "./services/FirebaseAuthService";
import {MockAuthService} from "./services/MockAuthService";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

const services: ServiceContextType = {
    authService: new MockAuthService()
    // authService: new FirebaseAuthService()
}



root.render(
    <StrictMode>
        <StoreProvider store={store}>
            <ServiceProvider services={services}>
                <Router basename={"/editor"}>
                    <Routes>
                        <Route path={"/"} element={<App />} />
                        <Route path={"/access/signin"} element={<SignInPage />} />
                        <Route path={"/access/confirm"} element={<SignInConfirmPage />} />
                    </Routes>
                </Router>
            </ServiceProvider>
        </StoreProvider>
    </StrictMode>
);
