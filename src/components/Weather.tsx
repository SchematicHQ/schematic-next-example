"use client";

import { useUser } from "@clerk/nextjs";
import {
  useSchematic,
  useSchematicContext,
  useSchematicEvents,
  useSchematicFlag,
} from "@schematichq/schematic-react";
import axios from "axios";
import debounce from "lodash.debounce";
import React, { useEffect, useCallback, useState, useMemo } from "react";

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

  const { isLoaded, user } = useUser();

  const { setContext } = useSchematicContext();
  const { identify, track } = useSchematicEvents();
  const weatherSearchFlag = useSchematicFlag("weather-search");

  const fetchWeather = useCallback(async (location: string) => {
    try {
      const response = await axios.get(`https://wttr.in/${location}?format=j1`);
      const data = response.data;
      const currentCondition = data.current_condition[0];
      setWeatherData({
        temp: parseFloat(currentCondition.temp_F),
        humidity: parseFloat(currentCondition.humidity),
        windSpeed: parseFloat(currentCondition.windspeedKmph),
        description: currentCondition.weatherDesc[0].value,
      });
      setFetchedLocation(location);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError("Failed to fetch weather data");
      setLoading(false);
    }
  }, []);

  const debouncedFetchWeather = useMemo(
    () =>
      debounce((location: string) => {
        setLoading(true);
        fetchWeather(location);
      }, 500),
    [fetchWeather],
  );

  useEffect(() => {
    if (isLoaded && user && setContext && identify) {
      const context = {
        company: {
          id: user.id,
        },
        user: {
          id: user.id,
        },
      };
      void setContext(context);
      void identify({
        company: {
          keys: { id: user.id },
          name: user.username ?? user.fullName ?? user.id,
          traits: { logoUrl: user.imageUrl },
        },
        keys: { id: user.id },
        name: user.username ?? user.fullName ?? user.id,
        traits: { status: "active" },
      });
    }
  }, [isLoaded, user, setContext, identify]);

  useEffect(() => {
    if (isLoaded && user && setContext && track) {
      void track({
        company: { clerkId: user.id },
        event: "search",
        traits: { search: fetchedLocation },
        user: { clerkId: user.id },
      });
    }
  }, [isLoaded, user, setContext, track, fetchedLocation]);

  useEffect(() => {
    fetchWeather(location);
  }, [fetchWeather]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = event.target.value;
    setLocation(newLocation);
    debouncedFetchWeather(newLocation);
  };

  if (!weatherSearchFlag) {
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
        {loading ? (
          <div className="loading">Loading...</div>
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
                <p>Humidity: {weatherData?.humidity}%</p>
                <p>Wind Speed: {weatherData?.windSpeed} km/h</p>
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
