import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
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
import MyTrips from "./pages/MyTrips";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Results from "./pages/Results";
import SamplePlan from "./pages/SamplePlan";
import NearbyPlaces from "./components/NearbyPlaces";
import PlaceDetails from "./pages/PlaceDetails";
import SearchResults from "./pages/SearchResults";
import DestinationDetails from "./pages/DestinationDetails";

import TravelBot from "./components/TravelBot";

import "./styles/layout.css";
import "./styles/global.css";
import "./styles/mobile.css";

import CreatePoll from "./pages/CreatePoll";
import VotePoll from "./pages/VotePoll";
import PollResults from "./pages/PollResults";

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/create-poll" element={<CreatePoll />} />
          <Route path="/vote/:pollId" element={<VotePoll />} />
          <Route path="/poll-results/:pollId" element={<PollResults />} />

          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <Planner />
              </ProtectedRoute>
            }
          />

          <Route path="/destinations" element={<Destinations />} />
          <Route path="/about" element={<About />} />
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
          <Route path="/map" element={<Results />} />
          <Route path="/trip/:id" element={<Results />} />
          <Route path="/sample-plan" element={<SamplePlan />} />
          <Route path="/explore/:city" element={<DestinationDetails />} />
          <Route path="/nearby" element={<NearbyPlaces />} />
          <Route path="/place/:id" element={<PlaceDetails />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/admin" element={<Admin />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <MyTrips />
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
