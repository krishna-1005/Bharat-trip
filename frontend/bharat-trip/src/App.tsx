import { Routes, Route } from "react-router-dom";
import Home from "./routes/index";
import AuthPage from "./routes/auth";
import Collaborate from "./routes/collaborate";
import Dashboard from "./routes/dashboard";
import Explore from "./routes/explore";
import PlannerMulti from "./routes/planner-multi";
import PlannerSingle from "./routes/planner-single";
import Profile from "./routes/profile";
import Results from "./routes/results";
import TripDetails from "./routes/trip-details";
import TripType from "./routes/trip-type";
import Trips from "./routes/trips";
import AdminDashboardPage from "./routes/admin/index";
import AdminLoginPage from "./routes/admin/login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/collaborate" element={<Collaborate />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/planner-multi" element={<PlannerMulti />} />
      <Route path="/planner-single" element={<PlannerSingle />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/results" element={<Results />} />
      <Route path="/trip-details" element={<TripDetails />} />
      <Route path="/trip-type" element={<TripType />} />
      <Route path="/trips" element={<Trips />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
    </Routes>
  );
}
