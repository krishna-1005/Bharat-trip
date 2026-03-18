import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "";

  return (
    <div className="app">
      <Navbar />
      <Outlet />
      {isHomePage && <Footer />}
    </div>
  );
}
