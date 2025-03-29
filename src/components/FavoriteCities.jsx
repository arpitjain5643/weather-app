import React, { useContext } from 'react';
import { WeatherContext } from '../App';

const FavoriteCities = () => {
  const { favorites, fetchWeather } = useContext(WeatherContext);
  
  if (favorites.length === 0) {
    return (
      <div className="favorites-container">
        <h3>Favorite Cities</h3>
        <p className="no-favorites">No favorite cities yet. Add some by clicking the star icon.</p>
      </div>
    );
  }
  
  return (
    <div className="favorites-container">
      <h3>Favorite Cities</h3>
      <ul className="favorites-list">
        {favorites.map((city) => (
          <li key={city}>
            <button 
              className="favorite-city-btn"
              onClick={() => fetchWeather(city)}
            >
              {city}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FavoriteCities;