import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ProjectReviews from "./ProjectReviews";

export default function Layout() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
        <Outlet />
      </div>
      <ProjectReviews />
      <Footer />
    </div>
  );
}