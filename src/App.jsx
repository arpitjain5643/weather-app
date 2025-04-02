// App.jsx - Main component
import React, { useState, useEffect, createContext, useContext } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import ThemeToggle from './components/ThemeToggle';
import FavoriteCities from './components/FavoriteCities';
import './App.css';

// Create Weather Context for state management
export const WeatherContext = createContext();

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState('metric'); // 'metric' for Celsius, 'imperial' for Fahrenheit

  // API key would typically be stored in environment variables
  const API_KEY = import.meta.env.VITE_API_KEY || "";

  useEffect(() => {
    // Load favorites from localStorage on component mount
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    // Apply dark mode to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Save theme preference
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    // Save favorites to localStorage when they change
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);
  console.log(import.meta.env.VITE_API_KEY, "jfjbfjgjdsvbhjdhbchjxchgnvb");
  const fetchWeather = async (city,unitOverride = unit) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unitOverride}&appid=${API_KEY}`

      );
      console.log(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unitOverride}&appid=${API_KEY}`)
      if (!weatherResponse.ok) {
        throw new Error(`City not found`);
      }

      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unitOverride}&appid=${API_KEY}`
      );
      console.log(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unitOverride}&appid=${API_KEY}`)

      if (!forecastResponse.ok) {
        throw new Error(`Forecast data not available`);
      }

      const forecastData = await forecastResponse.json();

      // Process forecast data to get one forecast per day
      const dailyForecasts = processForecastData(forecastData);
      setForecast(dailyForecasts);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processForecastData = (data) => {
    // Group forecast by day and get daily values
    const dailyData = {};

    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();

      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          temps: [],
          icon: item.weather[0].icon,
          description: item.weather[0].description
        };
      }

      dailyData[date].temps.push(item.main.temp);
    });

    // Convert to array and calculate min/max temps
    return Object.values(dailyData).map(day => ({
      ...day,
      maxTemp: Math.max(...day.temps),
      minTemp: Math.min(...day.temps)
    })).slice(0, 5); // Get only 5 days
  };

  const toggleFavorite = (city) => {
    if (favorites.includes(city)) {
      setFavorites(favorites.filter(fav => fav !== city));
    } else {
      setFavorites([...favorites, city]);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleUnit = () => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);

    // Refetch data with the new unit if we have a city
    if (weatherData) {
      fetchWeather(weatherData.name, newUnit);
    }
  };

  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        forecast,
        favorites,
        error,
        loading,
        darkMode,
        unit,
        fetchWeather,
        toggleFavorite,
        toggleDarkMode,
        toggleUnit
      }}
    >
      <div className="app-container">
        <header>
          <h1>Weather Dashboard</h1>
          <ThemeToggle />
        </header>

        <main>
          <SearchBar />
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading">Loading...</div>}

          <div className="content-container">
            <div className="main-content">
              {weatherData && <CurrentWeather />}
              {forecast && <Forecast />}
            </div>
            <aside>
              <FavoriteCities />
            </aside>
          </div>
        </main>

        <footer>
          <p>Weather data provided by OpenWeatherMap</p>
        </footer>
      </div>
    </WeatherContext.Provider>
  );
};

export default App;