// App.jsx - Main component
import React, { useState, useEffect, createContext, useContext } from "react";
import SearchBar from "./components/SearchBar";
import CurrentWeather from "./components/CurrentWeather";
import Forecast from "./components/Forecast";
import ThemeToggle from "./components/ThemeToggle";
import FavoriteCities from "./components/FavoriteCities";
import "./App.css";

// Create Weather Context for state management
export const WeatherContext = createContext();

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [unit, setUnit] = useState("metric"); // 'metric' for Celsius, 'imperial' for Fahrenheit

  // API key would typically be stored in environment variables
  const API_KEY = import.meta.env.VITE_API_KEY || "";

  useEffect(() => {
    // Load favorites from localStorage on component mount
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load theme preference
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme !== null) {
      setDarkMode(JSON.parse(savedTheme));
    } else {
      setDarkMode(true); // Default to dark mode if no preference saved
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const weatherResponse = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${API_KEY}`
            );
            if (!weatherResponse.ok) {
              throw new Error("Unable to fetch weather for your location");
            }
            const weatherData = await weatherResponse.json();
            setWeatherData(weatherData);
  
            const forecastResponse = await fetch(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${API_KEY}`
            );
            if (!forecastResponse.ok) {
              throw new Error("Unable to fetch forecast for your location");
            }
            const forecastData = await forecastResponse.json();
            const dailyForecasts = processForecastData(forecastData);
            setForecast(dailyForecasts);
          } catch (err) {
            setError(err.message);
          }
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          setError("Location permission denied. Please search for a city.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  useEffect(() => {
    // Apply dark mode to body
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    // Save theme preference
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    // Save favorites to localStorage when they change
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);
  // console.log(import.meta.env.VITE_API_KEY, "jfjbfjgjdsvbhjdhbchjxchgnvb");
  const fetchWeather = async (city, unitOverride = unit) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unitOverride}&appid=${API_KEY}`
      );
      console.log(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unitOverride}&appid=${API_KEY}`
      );
      if (!weatherResponse.ok) {
        throw new Error(`City not found`);
      }

      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unitOverride}&appid=${API_KEY}`
      );
      console.log(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unitOverride}&appid=${API_KEY}`
      );

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
    // Group forecast by day using ISO date string for mobile compatibility
    const dailyData = {};

    data.list.forEach((item) => {
      // Always use UTC for grouping to avoid timezone issues
      const dateObj = new Date(item.dt * 1000);
      const dateKey = dateObj.toISOString().split("T")[0]; // 'YYYY-MM-DD'

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          temps: [],
          icon: item.weather[0].icon,
          description: item.weather[0].description,
        };
      }
      dailyData[dateKey].temps.push(item.main.temp);
    });

    // Convert to array and calculate min/max temps
    return Object.values(dailyData)
      .map((day) => ({
        ...day,
        maxTemp: Math.max(...day.temps),
        minTemp: Math.min(...day.temps),
      }))
      .slice(0, 5); // Get only 5 days
  };

  const toggleFavorite = (city) => {
    if (favorites.includes(city)) {
      setFavorites(favorites.filter((fav) => fav !== city));
    } else {
      setFavorites([...favorites, city]);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleUnit = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric";
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
        toggleUnit,
      }}
    >
      <div className="app-container">
        <header className="w-full flex">
          <h1>Weather Dashboard</h1>
          <ThemeToggle />
        </header>

        <main
          className="w-full flex"
          style={{ flexDirection: "column", justifyContent: "start" }}
        >
          <SearchBar />
          {error && <div className="error-message">{error}</div>}
          <div className="content-container">
            {loading ? (
              <div className="main-content">Loading...</div>
            ) : (
              <div className="main-content">
                {weatherData && <CurrentWeather />}
                {forecast && <Forecast />}
              </div>
            )}
            <aside>
              <FavoriteCities />
            </aside>
          </div>
        </main>

        <footer className="w-full flex">
          <p>Weather data provided by OpenWeatherMap</p>
        </footer>
      </div>
    </WeatherContext.Provider>
  );
};

export default App;
