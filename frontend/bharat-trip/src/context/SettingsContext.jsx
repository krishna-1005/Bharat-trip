/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem("settings_currency") || "INR");
  const [language, setLanguage] = useState(() => localStorage.getItem("settings_language") || "English");
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("settings_theme");
    const migrated = localStorage.getItem("theme_migrated_v2");
    if (!migrated) {
      localStorage.setItem("theme_migrated_v2", "true");
      localStorage.setItem("settings_theme", "light");
      return "light";
    }
    return saved || "light";
  });

  const translations = {
    English: {
      // Nav
      nav_home: "Home",
      nav_how: "How It Works",
      nav_planner: "Planner",
      nav_about: "About",
      nav_profile: "My Profile",
      nav_trips: "My Trips",
      nav_settings: "Settings",
      nav_signout: "Sign out",
      nav_login: "Login",
      nav_get_started: "Get Started",
      
      // Home
      home_hero_title: "Crafting Unforgettable Journeys with AI",
      home_hero_sub: "Beyond maps and lists—experience India through personalized, AI-powered adventures tailored to your soul.",
      plan_trip_btn: "Plan My Trip",
      view_samples_btn: "View Sample Plans",
      
      // Planner
      planner_title: "Quick Trip Planner",
      planner_sub: "Customize your perfect Bangalore getaway",
      form_dest: "Destination",
      form_days: "Duration (1–30 days)",
      form_budget: "Budget",
      form_interests: "Interests",
      gen_btn: "Generate My Plan →",
      crafting: "Crafting your itinerary...",
      budget_low: "Budget",
      budget_med: "Comfort",
      budget_high: "Luxury",
      
      // Results
      results_title: "Your Itinerary",
      total_cost: "Total Cost",
      days: "Days",
      places: "Places",
      save_trip: "Save Trip",
      save_to_profile: "Save Trip to Profile",
      optimize_route: "Optimize Route",
      trip_details: "TRIP DETAILS",
      itinerary_label: "ITINERARY",
      back_to_planner: "Back to Planner",
      no_trip: "No trip generated yet",
      
      // Profile
      profile_title: "My Profile",
      total_trips: "Total Trips Planned",
      dest_visited: "Unique Destinations",
      saved_places: "Saved Places",
      new_trip_btn: "+ New Trip",
      loading: "Loading trips...",
      no_trips_yet: "No trips yet. Plan your first trip!",
      
      // Settings
      settings_title: "Account Settings",
      settings_sub: "Manage your preferences, notifications, and security.",
      pref_label: "Preferences",
      lang_label: "Language",
      curr_label: "Currency",
      notif_label: "Notifications",
      email_alerts: "Email Alerts",
      trip_reminders: "Trip Reminders",
      security_label: "Security",
      danger_label: "Danger Zone",
      logout_btn: "Log Out",
      delete_acc: "Delete Account",
      save_changes: "Save Changes"
    },
    Hindi: {
      // Nav
      nav_home: "होम",
      nav_how: "यह कैसे काम करता है",
      nav_planner: "प्लानर",
      nav_about: "बारे में",
      nav_profile: "मेरी प्रोफ़ाइल",
      nav_trips: "मेरी यात्राएं",
      nav_settings: "सेटिंग्स",
      nav_signout: "साइन आउट",
      nav_login: "लॉगिन",
      nav_get_started: "शुरू करें",

      // Home
      home_hero_title: "AI के साथ अपनी सपनों की यात्रा बुनें",
      home_hero_sub: "नक्शों से परे, अपनी आत्मा के अनुरूप व्यक्तिगत एआई-संचालित रोमांच के साथ भारत का अनुभव करें।",
      plan_trip_btn: "मेरी यात्रा की योजना बनाएं",
      view_samples_btn: "नमूना योजनाएं देखें",

      // Planner
      planner_title: "त्वरित ट्रिप प्लानर",
      planner_sub: "अपनी सही बैंगलोर यात्रा को अनुकूलित करें",
      form_dest: "गंतव्य",
      form_days: "अवधि (1-30 दिन)",
      form_budget: "बजट",
      form_interests: "रुचियां",
      gen_btn: "मेरी योजना बनाएं →",
      crafting: "आपका यात्रा कार्यक्रम तैयार किया जा रहा है...",
      budget_low: "किफायती",
      budget_med: "आरामदायक",
      budget_high: "लक्जरी",

      // Results
      results_title: "आपका यात्रा कार्यक्रम",
      total_cost: "कुल लागत",
      days: "दिन",
      places: "जगहें",
      save_trip: "यात्रा सहेजें",
      save_to_profile: "प्रोफ़ाइल में सहेजें",
      optimize_route: "मार्ग अनुकूलित करें",
      trip_details: "यात्रा का विवरण",
      itinerary_label: "यात्रा कार्यक्रम",
      back_to_planner: "प्लानर पर वापस जाएं",
      no_trip: "अभी तक कोई यात्रा नहीं",

      // Profile
      profile_title: "मेरी प्रोफ़ाइल",
      total_trips: "कुल नियोजित यात्राएं",
      dest_visited: "अद्वितीय गंतव्य",
      saved_places: "सहेजी गई जगहें",
      new_trip_btn: "+ नई यात्रा",
      loading: "यात्राएं लोड हो रही हैं...",
      no_trips_yet: "अभी तक कोई यात्रा नहीं। अपनी पहली योजना बनाएं!",

      // Settings
      settings_title: "खाता सेटिंग्स",
      settings_sub: "अपनी पसंद, सूचनाएं और सुरक्षा प्रबंधित करें।",
      pref_label: "पसंद",
      lang_label: "भाषा",
      curr_label: "मुद्रा",
      notif_label: "सूचनाएं",
      email_alerts: "ईमेल अलर्ट",
      trip_reminders: "यात्रा अनुस्मारक",
      security_label: "सुरक्षा",
      danger_label: "खतरनाक क्षेत्र",
      logout_btn: "लॉग आउट",
      delete_acc: "खाता हटाएं",
      save_changes: "परिवर्तन सहेजें"
    },
    Kannada: {
      // Nav
      nav_home: "ಹೋಮ್",
      nav_how: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
      nav_planner: "ಪ್ಲಾನರ್",
      nav_about: "ಬಗ್ಗೆ",
      nav_profile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
      nav_trips: "ನನ್ನ ಪ್ರವಾಸಗಳು",
      nav_settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      nav_signout: "ಸೈನ್ ಔಟ್",
      nav_login: "ಲಾಗಿನ್",
      nav_get_started: "ಪ್ರಾರಂಭಿಸಿ",

      // Home
      home_hero_title: "AI ಮೂಲಕ ಮರೆಯಲಾಗದ ಪ್ರಯಾಣಗಳನ್ನು ರೂಪಿಸಿ",
      home_hero_sub: "ನಕ್ಷೆಗಳ ಆಚೆಗೆ—ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತಕ್ಕಂತೆ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ AI-ಚಾಲಿತ ಸಾಹಸಗಳ ಮೂಲಕ ಭಾರತವನ್ನು ಅನುಭವಿಸಿ.",
      plan_trip_btn: "ನನ್ನ ಪ್ರವಾಸವನ್ನು ಯೋಜಿಸಿ",
      view_samples_btn: "ಮಾದರಿ ಯೋಜನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ",

      // Planner
      planner_title: "ತ್ವರಿತ ಪ್ರವಾಸ ಯೋಜಕ",
      planner_sub: "ನಿಮ್ಮ ಪರಿಪೂರ್ಣ ಬೆಂಗಳೂರು ಪ್ರವಾಸವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ",
      form_dest: "ಗಮ್ಯಸ್ಥಾನ",
      form_days: "ಅವಧಿ (1-30 ದಿನಗಳು)",
      form_budget: "ಬಜೆಟ್",
      form_interests: "ಆಸಕ್ತಿಗಳು",
      gen_btn: "ನನ್ನ ಯೋಜನೆಯನ್ನು ರೂಪಿಸಿ →",
      crafting: "ನಿಮ್ಮ ಪ್ರಯಾಣದ ವಿವರವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...",
      budget_low: "ಬಜೆಟ್",
      budget_med: "ಆರಾಮದಾಯಕ",
      budget_high: "ಐಷಾರಾಮಿ",

      // Results
      results_title: "ನಿಮ್ಮ ಪ್ರಯಾಣದ ವಿವರ",
      total_cost: "ಒಟ್ಟು ವೆಚ್ಚ",
      days: "ದಿನಗಳು",
      places: "ಸ್ಥಳಗಳು",
      save_trip: "ಪ್ರವಾಸವನ್ನು ಉಳಿಸಿ",
      save_to_profile: "ಪ್ರೊಫೈಲ್‌ಗೆ ಉಳಿಸಿ",
      optimize_route: "ಮಾರ್ಗವನ್ನು ಉತ್ತಮಗೊಳಿಸಿ",
      trip_details: "ಪ್ರವಾಸದ ವಿವರಗಳು",
      itinerary_label: "ಪ್ರಯಾಣ ವಿವರ",
      back_to_planner: "ಪ್ಲಾನರ್‌ಗೆ ಹಿಂತಿರುಗಿ",
      no_trip: "ಇನ್ನೂ ಯಾವುದೇ ಪ್ರವಾಸವಿಲ್ಲ",

      // Profile
      profile_title: "ನನ್ನ ಪ್ರೊಫೈಲ್",
      total_trips: "ಒಟ್ಟು ಯೋಜಿತ ಪ್ರವಾಸಗಳು",
      dest_visited: "ವಿಶಿಷ್ಟ ಗಮ್ಯಸ್ಥಾನಗಳು",
      saved_places: "ಉಳಿಸಿದ ಸ್ಥಳಗಳು",
      new_trip_btn: "+ ಹೊಸ ಪ್ರವಾಸ",
      loading: "ಪ್ರವಾಸಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      no_trips_yet: "ಇನ್ನೂ ಯಾವುದೇ ಪ್ರವಾಸಗಳಿಲ್ಲ. ಮೊದಲನೆಯದನ್ನು ಯೋಜಿಸಿ!",

      // Settings
      settings_title: "ಖಾತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      settings_sub: "ನಿಮ್ಮ ಆದ್ಯತೆಗಳು, ಅಧಿಸೂಚನೆಗಳು ಮತ್ತು ಸುರಕ್ಷತೆಯನ್ನು ನಿರ್ವಹಿಸಿ.",
      pref_label: "ಆದ್ಯತೆಗಳು",
      lang_label: "ಭಾಷೆ",
      curr_label: "ಕರೆನ್ಸಿ",
      notif_label: "ಅಧಿಸೂಚನೆಗಳು",
      email_alerts: "ಇಮೇಲ್ ಎಚ್ಚರಿಕೆಗಳು",
      trip_reminders: "ಪ್ರವಾಸದ ಜ್ಞಾಪನೆಗಳು",
      security_label: "ಭದ್ರತೆ",
      danger_label: "ಅಪಾಯಕಾರಿ ವಲಯ",
      logout_btn: "ಲಾಗ್ ಔಟ್",
      delete_acc: "ಖಾತೆಯನ್ನು ಅಳಿಸಿ",
      save_changes: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ"
    }
  };

  const currencySymbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$"
  };

  const conversionRates = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0094,
    JPY: 1.82,
    AUD: 0.018,
    CAD: 0.016
  };

  // Inverse rates to convert ANY currency back to INR
  const toINR = (amount, fromCurrency) => {
    const rate = conversionRates[fromCurrency] || 1;
    return amount / rate;
  };

  useEffect(() => {
    localStorage.setItem("settings_currency", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("settings_language", language);
    if (language === "Hindi") {
      document.body.style.fontFamily = "'Hind', sans-serif";
    } else {
      document.body.style.fontFamily = ""; // Reset to default
    }
  }, [language]);

  useEffect(() => {
    localStorage.setItem("settings_theme", theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const formatPrice = (priceInINR) => {
    const rate = conversionRates[currency] || 1;
    const converted = (Number(priceInINR) * rate);
    const formatted = currency === "JPY" ? Math.round(converted) : converted.toFixed(currency === "INR" ? 0 : 2);
    return `${currencySymbols[currency] || "₹"}${Number(formatted).toLocaleString()}`;
  };

  const formatSelectedCurrency = (amount) => {
    const symbol = currencySymbols[currency] || "₹";
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  const t = (key) => {
    if (!translations[language]) return translations["English"][key] || key;
    return translations[language][key] || translations["English"][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ 
      currency, setCurrency, 
      language, setLanguage, 
      theme, setTheme, toggleTheme,
      formatPrice, 
      formatSelectedCurrency,
      toINR,
      currencySymbol: currencySymbols[currency],
      currencySymbols,
      t
    }}>
      {children}
    </SettingsContext.Provider>
  );
};