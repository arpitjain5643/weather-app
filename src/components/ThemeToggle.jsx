import React, { useContext } from 'react';
import { WeatherContext } from '../App';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useContext(WeatherContext);
  
  return (
    <button 
      className="theme-toggle"
      onClick={toggleDarkMode}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
