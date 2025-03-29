import React, { useContext } from 'react';
import { WeatherContext } from '../App';

const Forecast = () => {
  const { forecast, unit } = useContext(WeatherContext);
  
  if (!forecast) return null;
  
  return (
    <div className="forecast-container">
      <h3>5-Day Forecast</h3>
      <div className="forecast-cards">
        {forecast.map((day, index) => (
          <div key={index} className="forecast-card">
            <p className="forecast-date">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            <img 
              src={`https://openweathermap.org/img/wn/${day.icon}.png`} 
              alt={day.description} 
            />
            <p className="forecast-description">{day.description}</p>
            <div className="forecast-temps">
              <p className="max-temp">{Math.round(day.maxTemp)}°{unit === 'metric' ? 'C' : 'F'}</p>
              <p className="min-temp">{Math.round(day.minTemp)}°{unit === 'metric' ? 'C' : 'F'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forecast;
