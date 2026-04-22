// Fallback key in case .env is not loading correctly
const FALLBACK_KEY = "3243301539e36028f583f1f32ddab37e";
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || FALLBACK_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * Fetches current weather or forecast for a location.
 * For this demo, we use the 5-day forecast.
 */
export const fetchWeatherForecast = async (lat, lng) => {
  // Check if API_KEY is a placeholder or truly missing
  const isInvalidKey = !API_KEY || 
                       API_KEY === "YOUR_FREE_OPENWEATHER_KEY" || 
                       API_KEY.startsWith("YOUR_");

  if (isInvalidKey) {
    console.warn("Weather API Key missing or invalid. Skipping fetch.");
    return null;
  }
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Weather API Error Status:", response.status, errorData);
      throw new Error(`Weather fetch failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Weather Service Error:", error);
    return null;
  }
};

/**
 * AI Logic: Generates contextual advice based on the weather status.
 */
export const getWeatherAdvice = (status) => {
  const lowercaseStatus = status.toLowerCase();
  
  if (lowercaseStatus.includes("rain")) {
    return "☔ It looks like rain—perfect time for an indoor museum or a cozy cafe!";
  }
  if (lowercaseStatus.includes("clear")) {
    return "☀️ Clear skies ahead! Great day for outdoor treks or rooftop dining.";
  }
  if (lowercaseStatus.includes("cloud")) {
    return "☁️ Overcast today—ideal for photography without harsh shadows.";
  }
  if (lowercaseStatus.includes("hot") || lowercaseStatus.includes("clear")) {
    return "🔥 High temps expected—stay hydrated and plan indoor breaks around noon.";
  }
  
  return "🎒 Standard conditions today. Don't forget your essentials!";
};
