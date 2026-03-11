import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ThreeScene from "./ThreeScene";

export default function Layout() {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <ThreeScene />
      <Navbar />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}