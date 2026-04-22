import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "./styles/global.css";
import AuthProvider from "./components/AuthProvider";
import { SettingsProvider } from "./context/SettingsContext";

// Force unregister service workers to clear stale cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Analytics />
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);

/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('PWA Active: Service Worker registered successfully');
      })
      .catch(registrationError => {
        console.error('PWA Registration failed: ', registrationError);
      });
  });
}
*/
