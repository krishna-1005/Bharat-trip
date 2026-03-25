import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import CustomCursor from "./CustomCursor";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "";

  return (
    <div className="app">
      <CustomCursor />
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      {isHomePage && <Footer />}
      <BottomNav />
    </div>
  );
}
