import React, { useContext } from 'react';
import { WeatherContext } from '../App';

const CurrentWeather = () => {
  const { loading,weatherData, unit, toggleFavorite, favorites, toggleUnit } = useContext(WeatherContext);
  
  if (!weatherData) return null;
  
  const { name, main, weather, wind, sys } = weatherData;
  const isFavorite = favorites.includes(name);
  
  // Determine background class based on weather condition
  const getWeatherBackgroundClass = () => {
    const weatherId = weather[0].id;
    const icon = weather[0].icon;
    const isNight = icon.includes('n');
    
    // Weather condition ranges based on OpenWeather API
    // 2xx: Thunderstorm, 3xx: Drizzle, 5xx: Rain, 6xx: Snow, 
    // 7xx: Atmosphere, 800: Clear, 80x: Clouds
    
    if (weatherId >= 200 && weatherId < 300) return 'bg-thunderstorm';
    if (weatherId >= 300 && weatherId < 400) return 'bg-drizzle';
    if (weatherId >= 500 && weatherId < 600) return 'bg-rain';
    if (weatherId >= 600 && weatherId < 700) return 'bg-snow';
    if (weatherId >= 700 && weatherId < 800) return 'bg-atmosphere';
    if (weatherId === 800) return isNight ? 'bg-clear-night' : 'bg-clear-day';
    if (weatherId > 800) return isNight ? 'bg-cloudy-night' : 'bg-cloudy-day';
    
    return 'bg-default';
  };
  
  const weatherBackgroundClass = getWeatherBackgroundClass();
  
  return (
    <div className={`current-weather ${weatherBackgroundClass}`}>
      <div className="weather-header">
        <h2>{name}, {sys.country}</h2>
        <button 
          className={`favorite-btn ${isFavorite ? 'favorite' : ''}`}
          onClick={() => toggleFavorite(name)}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>
      
      <div className="weather-details">
        <div className="weather-icon">
          <img 
            src={`https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`} 
            alt={weather[0].description} 
          />
          <p>{weather[0].description}</p>
        </div>
        
        <div className="temperature">
          <h3>{Math.round(main.temp)}°{unit === 'metric' ? 'C' : 'F'}</h3>
          <button 
            className="unit-toggle"
            onClick={toggleUnit}
            disabled={loading}
            aria-label="Toggle temperature unit"
          >
           {loading ? (
      <span className="loader"></span> // Loader element
    ) : (
      `Switch to ${unit === 'metric' ? '°F' : '°C'}`
    )}
          </button>
        </div>
        
        <div className="weather-stats">
          <p>Humidity: {main.humidity}%</p>
          <p>Wind: {wind.speed} {unit === 'metric' ? 'km/h' : 'mph'}</p>
          <p>Feels like: {Math.round(main.feels_like)}°{unit === 'metric' ? 'C' : 'F'}</p>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;