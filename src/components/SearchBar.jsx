// components/SearchBar.jsx
import React, { useState, useContext, useEffect } from 'react';
import { WeatherContext } from '../App';

const SearchBar = () => {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { fetchWeather, loading: fetchingWeather } = useContext(WeatherContext);
  
  // API key for Geoapify
  const API_KEY = '7a5c5dceb23a412f8f0313ba729529cd';
  
  useEffect(() => {
    const fetchCities = async () => {
      if (!city.trim()) {
        setSuggestions([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(city)}&apiKey=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        
        const data = await response.json();
        
        // Extract unique city names from the response
        const cities = data.features
          .filter(item => item.properties.city) // Ensure city property exists
          .map(item => ({
            city: item.properties.city,
            country: item.properties.country
          }));
        
        // Remove duplicates by creating a Set of city+country strings
        const uniqueCities = Array.from(
          new Set(cities.map(item => `${item.city}, ${item.country}`))
        ).map(combinedName => {
          const [city, country] = combinedName.split(', ');
          return { city, country };
        });
        
        setSuggestions(uniqueCities);
      } catch (error) {
        console.error("Error fetching city suggestions:", error);
        setSuggestions([]);
      }
      setLoading(false);
    };
    
    // Debounce the API call
    const debounceTimer = setTimeout(() => {
      if (city.trim()) {
        fetchCities();
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(debounceTimer);
  }, [city, API_KEY]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    const cityName = suggestion.city;
    setCity(cityName);
    fetchWeather(cityName);
    setSuggestions([]);
    setShowSuggestions(false);
  };
  
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };
  
  // Handle clicking outside suggestions box to close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={city} 
          onChange={(e) => {
            setCity(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={handleInputFocus}
          placeholder="Enter city name..."
          aria-label="City name"
          autoComplete="off"
        />
        <button type="submit" disabled={fetchingWeather || !city.trim()}>
          {fetchingWeather ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="city-suggestions">
          {suggestions.map((suggestion, index) => (
            <li 
              key={index} 
              onClick={() => handleSuggestionClick(suggestion)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSuggestionClick(suggestion);
              }}
            >
              {suggestion.city}, {suggestion.country}
            </li>
          ))}
        </ul>
      )}
      
      {loading && city.trim() && (
        <div className="suggestions-loading">
          <span>Loading suggestions...</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;