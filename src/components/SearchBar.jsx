import React, { useState, useContext } from 'react';
import { WeatherContext } from '../App';

const SearchBar = () => {
  const [city, setCity] = useState('');
  const { fetchWeather, loading } = useContext(WeatherContext);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };
  
  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={city} 
        onChange={(e) => setCity(e.target.value)} 
        placeholder="Enter city name..."
        aria-label="City name"
      />
      <button type="submit" disabled={loading || !city.trim()}>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
};

export default SearchBar;