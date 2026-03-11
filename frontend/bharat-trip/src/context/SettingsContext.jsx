import React, { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem("settings_currency") || "INR");
  const [language, setLanguage] = useState(() => localStorage.getItem("settings_language") || "English");

  const currencySymbols = {
    INR: "₹",
    USD: "$",
    EUR: "€"
  };

  // Conversion rates (mock rates for Bengaluru dataset which is in INR)
  const conversionRates = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011
  };

  useEffect(() => {
    localStorage.setItem("settings_currency", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("settings_language", language);
  }, [language]);

  const formatPrice = (priceInINR) => {
    const converted = (priceInINR * conversionRates[currency]).toFixed(currency === "INR" ? 0 : 2);
    return `${currencySymbols[currency]}${converted}`;
  };

  return (
    <SettingsContext.Provider value={{ currency, setCurrency, language, setLanguage, formatPrice, currencySymbol: currencySymbols[currency] }}>
      {children}
    </SettingsContext.Provider>
  );
};