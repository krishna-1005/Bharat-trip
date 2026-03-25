import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "./styles/global.css";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./components/authprovider";
import { SettingsProvider } from "./context/SettingsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <SettingsProvider>
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    </SettingsProvider>
  </AuthProvider>
);
