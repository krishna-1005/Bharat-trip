import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Planner from "./pages/Planner";
import TripType from "./pages/TripType";
import MultiCityPlanner from "./pages/MultiCityPlanner";
import MultiCityOverview from "./pages/MultiCityOverview";
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
import Exploration from "./pages/Exploration";
import Results from "./pages/Results";
import SamplePlan from "./pages/SamplePlan";
import NearbyPlaces from "./components/NearbyPlaces";
import PlaceDetails from "./pages/PlaceDetails";
import SearchResults from "./pages/SearchResults";
import DestinationDetails from "./pages/DestinationDetails";
import Maintenance from "./pages/Maintenance";
import TripRoom from "./pages/TripRoom";
import FutureExperience from "./pages/FutureExperience";

import TravelBot from "./components/TravelBot";
import InstallPrompt from "./components/InstallPrompt";

import "./styles/layout.css";
import "./styles/global.css";
import "./styles/mobile.css";

import CreatePoll from "./pages/CreatePoll";
import VotePoll from "./pages/VotePoll";
import PollResults from "./pages/PollResults";
import React, { useState, useEffect, useContext, Component } from "react";
import AuthModal from "./components/AuthModal";
import { AuthContext } from "./context/AuthContext";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
const ADMIN_EMAILS = ["gotripo@gmail.com", "krishkulkarni1005@gmail.com"];

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "#1a1a1a", color: "white", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", background: "var(--accent-blue)", border: "none", borderRadius: "8px", color: "white", cursor: "pointer" }}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { trackActivity } from "./utils/tracker";

function App() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    // Track every page view
    trackActivity("page_view", { path: location.pathname });
  }, [location.pathname]);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch(`${API}/api/admin/config/public`);
        const config = await res.json();
        if (config.maintenance_mode === true) {
          setIsMaintenance(true);
        }
      } catch (err) {
        console.error("Failed to check maintenance mode:", err);
      }
    };
    checkMaintenance();
  }, []);

  useEffect(() => {
    if (loading) return; // Wait for auth to initialize before deciding

    const currentPath = location.pathname;
    const isExcludedPath = currentPath.startsWith("/admin") || currentPath === "/login" || currentPath === "/maintenance";
    
    const isAdmin = user && (user.role === "admin" || ADMIN_EMAILS.includes(user.email?.toLowerCase()));

    if (isMaintenance && !isExcludedPath && !isAdmin) {
      navigate("/maintenance");
    }
  }, [isMaintenance, location.pathname, navigate, user, loading]);

  return (
    <>
      <ErrorBoundary>
        <Routes>
          <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/future" element={<FutureExperience />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/create-poll" element={<CreatePoll />} />
          <Route path="/vote/:pollId" element={<VotePoll />} />
          <Route path="/poll-results/:pollId" element={<PollResults />} />

          <Route path="/trip-type" element={<TripType />} />
          <Route path="/multi-city" element={<MultiCityPlanner />} />
          <Route path="/multi-city-overview" element={<MultiCityOverview />} />

          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <Planner />
              </ProtectedRoute>
            }
          />

          <Route path="/explore" element={<Exploration />} />
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
          <Route path="/trip-room/:roomId" element={<TripRoom />} />
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
      </ErrorBoundary>

      <AuthModal />
      <InstallPrompt />

      {/* AI Chatbot */}
      <TravelBot />
    </>
  );
}

export default App;
