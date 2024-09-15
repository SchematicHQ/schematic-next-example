"use client";

import {
  useSchematicEvents,
  useSchematicFlag,
  useSchematicIsPending,
} from "@schematichq/schematic-react";
import axios from "axios";
import debounce from "lodash.debounce";
import React, { useEffect, useCallback, useState, useMemo } from "react";

import Loader from "./Loader";
import useSchematicContext from "../hooks/useSchematicContext";

interface WeatherData {
  description: string;
  humidity: number;
  temp: number;
  windSpeed: number;
}

const Weather: React.FC = () => {
  const [location, setLocation] = useState<string>("Atlanta");
  const [fetchedLocation, setFetchedLocation] = useState<string>("Atlanta");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const schematicIsPending = useSchematicIsPending();
  const { track } = useSchematicEvents();
  const schematicContext = useSchematicContext();
  const humidityFlag = useSchematicFlag("humidity");
  const weatherSearchFlag = useSchematicFlag("weather-search");
  const windSpeedFlag = useSchematicFlag("wind-speed");
  console.log({
    humidityFlag,
    schematicIsPending,
    weatherSearchFlag,
    windSpeedFlag,
  });

  // Fetch weather data for location and report usage
  const fetchWeather = useCallback(async (location: string) => {
    try {
      const response = await axios.get(`https://wttr.in/${location}?format=j1`);
      const data = response.data;
      const currentCondition = data.current_condition[0];
      setWeatherData({
        description: currentCondition.weatherDesc[0].value,
        humidity: parseFloat(currentCondition.humidity),
        temp: parseFloat(currentCondition.temp_F),
        windSpeed: parseFloat(currentCondition.windspeedKmph),
      });
      setFetchedLocation(location);
      setLoading(false);
      setError(null);
      trackWeatherSearch();
    } catch (err) {
      setError("Failed to fetch weather data");
      setLoading(false);
    }
  }, []);

  // Debounce weather search
  const debouncedFetchWeather = useMemo(
    () =>
      debounce((location: string) => {
        setLoading(true);
        fetchWeather(location);
      }, 500),
    [fetchWeather],
  );

  // Report search usage to Schematic
  const trackWeatherSearch = () => {
    const { company, user } = schematicContext ?? {};
    if (company && user) {
      void track({
        company: company.keys,
        event: "weather-search",
        traits: { search: fetchedLocation },
        user: user.keys,
      });
    }
  };

  // Initial search
  useEffect(() => {
    fetchWeather(location);
  }, [fetchWeather]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = event.target.value;
    setLocation(newLocation);
    debouncedFetchWeather(newLocation);
  };

  if (!schematicIsPending && !weatherSearchFlag) {
    return <div>No access!</div>;
  }

  return (
    <div className="weather-container">
      <input
        type="text"
        value={location}
        onChange={handleChange}
        placeholder="Enter location"
        className="location-input"
      />
      <div className="weather-info">
        {loading || schematicIsPending ? (
          <Loader />
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <h2>Current Weather in {fetchedLocation}</h2>
            <p className="description">{weatherData?.description}</p>
            <div className="weather-details">
              <div className="weather-temp">
                <span className="temp">{weatherData?.temp}°F</span>
              </div>
              <div className="weather-stats">
                {humidityFlag && <p>Humidity: {weatherData?.humidity}%</p>}
                {windSpeedFlag && (
                  <p>Wind Speed: {weatherData?.windSpeed} km/h</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <style jsx>{`
        .weather-container {
          text-align: center;
          padding: 30px;
          border: 1px solid #333;
          border-radius: 10px;
          background-color: #1e1e1e;
          max-width: 500px;
          margin: 40px auto;
          color: #fff;
          font-family: "Helvetica Neue", Arial, sans-serif;
        }
        .location-input {
          padding: 15px;
          border-radius: 5px;
          border: 1px solid #555;
          margin-bottom: 25px;
          width: 80%;
          max-width: 350px;
          background-color: #333;
          color: #fff;
        }
        .weather-info {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        .description {
          font-size: 1.4em;
          margin-bottom: 30px;
        }
        .weather-details {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          margin-top: 25px;
        }
        .weather-temp {
          font-size: 2.5em;
          font-weight: bold;
          margin-right: 20px;
        }
        .weather-stats {
          text-align: left;
          font-size: 1.2em;
        }
        .temp {
          font-size: 2.5em;
          color: #ffcc00;
        }
        .loading,
        .error {
          font-size: 1.2em;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default Weather;
