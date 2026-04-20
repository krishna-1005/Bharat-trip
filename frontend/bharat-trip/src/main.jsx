import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
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
        <Analytics />
      </React.StrictMode>
    </SettingsProvider>
  </AuthProvider>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('PWA Active: Service Worker registered successfully');
        console.log('Offline Resilience Ready: Strategy Network-First');
      })
      .catch(registrationError => {
        console.error('PWA Registration failed: ', registrationError);
      });
  });
}
