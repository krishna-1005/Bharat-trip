import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import CustomCursor from "./CustomCursor";
import ScrollToTop from "./ScrollToTop";
import OfflineBadge from "./OfflineBadge";

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "";
  const isFixedLayout = location.pathname.includes("/results") || location.pathname.includes("/map");

  return (
    <div className={`app ${isFixedLayout ? "fixed-layout" : ""}`}>
      <OfflineBadge />
      <CustomCursor />
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="page-transition-wrapper"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {isHomePage && <Footer />}
      <BottomNav />
    </div>
  );
}
