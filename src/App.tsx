import { Authenticator } from "@aws-amplify/ui-react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppLayout } from "@cloudscape-design/components";
import CustomTopNavigation from "./components/Navigation/TopNavigation";
import CustomSideNavigation from "./components/Navigation/SideNavigation";
import Instances from "./pages/Instances";
import Remediation from "./pages/Remediation";
import Support from "./pages/Support";

function App() {
  return (
    <Authenticator hideSignUp>
        <Router>
          <div>
            <style>
              {`
                html, body, #root {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: 100%;
                }
              `}
            </style>
            <CustomTopNavigation />
            <AppLayout
              navigation={<CustomSideNavigation />}
              content={
                <Routes>
                  <Route path="/" element={<Instances />} />
                  <Route path="/remediation" element={<Remediation />} />
                  <Route path="/support" element={<Support />} />
                </Routes>
              }
              toolsHide={true}
            />
          </div>
        </Router>
    </Authenticator>
  );
}

export default App;
