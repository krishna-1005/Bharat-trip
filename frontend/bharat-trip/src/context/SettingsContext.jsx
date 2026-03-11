import React, { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem("settings_currency") || "INR");
  const [language, setLanguage] = useState(() => localStorage.getItem("settings_language") || "English");

  const translations = {
    English: {
      home_hero_title: "Explore India with AI",
      home_hero_sub: "Your personal AI travel companion for crafting perfect itineraries.",
      plan_trip_btn: "Plan My Trip",
      view_samples_btn: "View Sample Plans",
      nav_home: "Home",
      nav_planner: "Planner",
      nav_samples: "Sample Plans",
      nav_profile: "Profile",
      nav_settings: "Settings",
      results_title: "Your Itinerary",
      total_cost: "Total Cost",
      days: "Days",
      places: "Places",
      save_trip: "Save Trip",
      optimize_route: "Optimize Route",
      planner_header: "AI Travel Planner",
      planner_sub: "Tell us your preferences and let our AI do the magic."
    },
    Hindi: {
      home_hero_title: "एआई के साथ भारत की खोज करें",
      home_hero_sub: "सही यात्रा कार्यक्रम तैयार करने के लिए आपका व्यक्तिगत एआई यात्रा साथी।",
      plan_trip_btn: "मेरी यात्रा की योजना बनाएं",
      view_samples_btn: "नमूना योजनाएं देखें",
      nav_home: "होम",
      nav_planner: "प्लानर",
      nav_samples: "नमूना योजनाएं",
      nav_profile: "प्रोफ़ाइल",
      nav_settings: "सेटिंग्स",
      results_title: "आपका यात्रा कार्यक्रम",
      total_cost: "कुल लागत",
      days: "दिन",
      places: "जगहें",
      save_trip: "यात्रा सहेजें",
      optimize_route: "मार्ग अनुकूलित करें",
      planner_header: "एआई ट्रैवल प्लानर",
      planner_sub: "हमें अपनी पसंद बताएं और हमारे एआई को जादू करने दें।"
    },
    Kannada: {
      home_hero_title: "AI ನೊಂದಿಗೆ ಭಾರತವನ್ನು ಅನ್ವೇಷಿಸಿ",
      home_hero_sub: "ಪರಿಪೂರ್ಣ ಪ್ರಯಾಣದ ವಿವರಗಳನ್ನು ರೂಪಿಸಲು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ AI ಪ್ರಯಾಣದ ಒಡನಾಡಿ.",
      plan_trip_btn: "ನನ್ನ ಪ್ರವಾಸವನ್ನು ಯೋಜಿಸಿ",
      view_samples_btn: "ಮಾದರಿ ಯೋಜನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
      nav_home: "ಹೋಮ್",
      nav_planner: "ಪ್ಲಾನರ್",
      nav_samples: "ಮಾದರಿ ಯೋಜನೆಗಳು",
      nav_profile: "ಪ್ರೊಫೈಲ್",
      nav_settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      results_title: "ನಿಮ್ಮ ಪ್ರಯಾಣದ ವಿವರ",
      total_cost: "ಒಟ್ಟು ವೆಚ್ಚ",
      days: "ದಿನಗಳು",
      places: "ಸ್ಥಳಗಳು",
      save_trip: "ಪ್ರವಾಸವನ್ನು ಉಳಿಸಿ",
      optimize_route: "ಮಾರ್ಗವನ್ನು ಉತ್ತಮಗೊಳಿಸಿ",
      planner_header: "AI ಟ್ರಾವೆಲ್ ಪ್ಲಾನರ್",
      planner_sub: "ನಿಮ್ಮ ಆದ್ಯತೆಗಳನ್ನು ನಮಗೆ ತಿಳಿಸಿ ಮತ್ತು ನಮ್ಮ AI ಮ್ಯಾಜಿಕ್ ಮಾಡಲಿ."
    }
  };

  const currencySymbols = {
    INR: "₹",
    USD: "$",
    EUR: "€"
  };

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

  const t = (key) => {
    return translations[language][key] || translations["English"][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ 
      currency, setCurrency, 
      language, setLanguage, 
      formatPrice, 
      currencySymbol: currencySymbols[currency],
      t
    }}>
      {children}
    </SettingsContext.Provider>
  );
};