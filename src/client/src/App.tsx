import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {DevelopmentHeaderWarning} from "./containers/DevelopmentHeaderWarning";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {InformationalScientificSourcesPage} from "./pages/informational/InformationalScientificSourcesPage";
import {InformationalDefaultValuesPage} from "./pages/informational/InformationalDefaultValuesPage";
import {FeedbackPage} from "./pages/FeedbackPage";
import {CalculatorPage} from "./pages/calculator/CalculatorPage";
import {StartPage} from "./pages/StartPage";
import {NavBar} from "./containers/NavBar";
import {ApiPage} from "./pages/api/ApiPage";

function App() {

    return (
        <Router>
                {/* <DevelopmentHeaderWarning /> */}
                <Routes>
                    <Route element={<NavBar />}>
                        <Route path={"/dev"} element={<StartPage developerMode={true} />}/>
                        <Route path={"/"} element={<StartPage />}/>
                        <Route path={"/kalkulator/:name/:version"} element={<CalculatorPage />}/>
                        <Route path="/forskningsgrunnlag" element={<InformationalScientificSourcesPage />} />
                        <Route path="/tallgrunnlag" element={<InformationalDefaultValuesPage />} />
                        <Route path="/apiinfo" element={<ApiPage />} />
                        <Route path="/tilbakemelding" element={<FeedbackPage />} />
                    </Route>
                </Routes>
        </Router>
    )
}

export default App;
