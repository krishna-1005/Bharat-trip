import React from 'react';
import { motion } from 'framer-motion';
import { getWeatherAdvice } from '../services/weatherService';
import './weatherStrip.css';

/**
 * WeatherStrip Component
 * Shows a compact weather summary with AI advice.
 */
const WeatherStrip = ({ weatherData }) => {
  if (!weatherData) return null;

  // Assuming data for the first day from forecast
  const temp = Math.round(weatherData.main?.temp || 25);
  const status = weatherData.weather?.[0]?.main || "Clear";
  const iconCode = weatherData.weather?.[0]?.icon || "01d";
  const advice = getWeatherAdvice(status);

  return (
    <motion.div 
      className="weather-strip"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="weather-main">
        <img 
          src={`https://openweathermap.org/img/wn/${iconCode}.png`} 
          alt={status} 
          className="weather-icon"
        />
        <div className="weather-stats">
          <span className="weather-temp">{temp}°C</span>
          <span className="weather-desc">{status}</span>
        </div>
      </div>
      <div className="weather-advice-wrap">
        <p className="weather-advice-text">{advice}</p>
      </div>
    </motion.div>
  );
};

export default WeatherStrip;
