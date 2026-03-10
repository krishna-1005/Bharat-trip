import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Planner from "./pages/Planner";
import Destinations from "./pages/Destinations";
import Weekend from "./pages/Weekend";
import Honeymoon from "./pages/Honeymoon";
import Cultural from "./pages/Cultural";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Help from "./pages/Help";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Results from "./pages/Results";
import SamplePlan from "./pages/SamplePlan";
import NearbyPlaces from "./components/NearbyPlaces";

import TravelBot from "./components/TravelBot";

import "./styles/layout.css";
import "./styles/global.css";

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <Planner />
              </ProtectedRoute>
            }
          />

          <Route path="/destinations" element={<Destinations />} />
          <Route path="/weekend" element={<Weekend />} />
          <Route path="/honeymoon" element={<Honeymoon />} />
          <Route path="/cultural" element={<Cultural />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/help" element={<Help />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/results" element={<Results />} />
          <Route path="/sample-plan" element={<SamplePlan/>}/>
          <Route path="/nearby" element={<NearbyPlaces />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>

      {/* AI Chatbot */}
      <TravelBot />

    </>
  );
}

export default App;