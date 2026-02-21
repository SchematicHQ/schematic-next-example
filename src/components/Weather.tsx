"use client";

import { useEffect, useCallback, useState, useMemo, useRef } from "react";
import axios from "axios";
import debounce from "lodash/debounce";
import { useOrganization } from "@clerk/nextjs";
import {
  useSchematicEvents,
  useSchematicFlag,
  useSchematicEntitlement,
  useSchematicIsPending,
  UsagePeriod,
} from "@schematichq/schematic-react";

import Loader from "./Loader";

interface WeatherData {
  description: string;
  humidity: number;
  temp: number;
  windSpeed: number;
}

const Overage = (props: {
  searchAllocation?: number;
  usagePeriod?: UsagePeriod;
  usageResetAt?: Date;
}) => {
  const { searchAllocation, usagePeriod, usageResetAt } = props;
  const usagePeriodDisplay = usagePeriod
    ? {
        [UsagePeriod.CURRENT_DAY]: " for today",
        [UsagePeriod.CURRENT_WEEK]: " for this week",
        [UsagePeriod.CURRENT_MONTH]: " for this month",
        [UsagePeriod.ALL_TIME]: "",
      }[usagePeriod]
    : "";

  return (
    <div>
      <div>
        You have used all {searchAllocation} of your weather searches
        {usagePeriodDisplay}.
      </div>
      {usageResetAt && (
        <div>You can search again at {usageResetAt.toLocaleString()}.</div>
      )}
    </div>
  );
};

const Weather: React.FC = () => {
  const defaultLocation = "San Francisco";
  const [location, setLocation] = useState<string>(defaultLocation);
  const [fetchedLocation, setFetchedLocation] =
    useState<string>(defaultLocation);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pinnedLocations, _setPinnedLocations] = useState<string[]>([]);
  const { track } = useSchematicEvents();
  const schematicIsPending = useSchematicIsPending();
  const humidityFlag = useSchematicFlag("humidity");
  const {
    featureAllocation: weatherSearchAllocation,
    featureUsage: weatherSearchUsage,
    featureUsageExceeded: weatherSearchUsageExceeded,
    featureUsagePeriod: weatherSearchUsagePeriod,
    featureUsageResetAt: weatherSearchUsageResetAt,
    value: weatherSearchFlag,
  } = useSchematicEntitlement("weather-search");
  const windSpeedFlag = useSchematicFlag("wind-speed");
  const addPinnedLocationFlag = useSchematicFlag("pinned-locations");
  const { organization } = useOrganization();

  const setPinnedLocations = useCallback(
    (locations: string[]) => {
      _setPinnedLocations(locations);

      try {
        fetch("/api/pins", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ locations }),
        });
      } catch (error) {
        console.error(error);
      }
    },
    [_setPinnedLocations],
  );

  useEffect(() => {
    if (organization) {
      const savedLocations = (organization.publicMetadata.locations ??
        []) as string[];
      _setPinnedLocations(savedLocations);
    }
  }, [organization, _setPinnedLocations]);

  const fetchWeather = useCallback(
    async (location: string) => {
      try {
        track({
          event: "weather-search",
          traits: { search: fetchedLocation },
        });

        const response = await axios.get(
          `https://wttr.in/${location}?format=j1`,
        );
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
      } catch {
        setError("Failed to fetch weather data");
        setLoading(false);
      }
    },
    [fetchedLocation, track],
  );

  // Debounce the fetchWeather so we don't search on every keystroke
  const debouncedFetchWeather = useMemo(
    () =>
      debounce((location: string) => {
        setLoading(true);
        fetchWeather(location);
      }, 500),
    [fetchWeather],
  );

  // Search once on initial page load
  const initialLoadRef = useRef(true);
  useEffect(() => {
    if (initialLoadRef.current) {
      fetchWeather(location);
      initialLoadRef.current = false;
    }
  }, [fetchWeather, location]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = event.target.value;
    setLocation(newLocation);
    debouncedFetchWeather(newLocation);
  };

  const handlePinLocation = () => {
    if (!pinnedLocations.includes(fetchedLocation)) {
      setPinnedLocations([...pinnedLocations, fetchedLocation]);
    }
  };

  const handleUnpinLocation = (locationToRemove: string) => {
    setPinnedLocations(
      pinnedLocations.filter((loc) => loc !== locationToRemove),
    );
  };

  const handlePinnedLocationClick = (pinnedLocation: string) => {
    setLocation(pinnedLocation);
    setLoading(true);
    fetchWeather(pinnedLocation);
  };

  if (schematicIsPending) {
    return <Loader />;
  }

  if (weatherSearchUsageExceeded) {
    return (
      <Overage
        searchAllocation={weatherSearchAllocation}
        usagePeriod={weatherSearchUsagePeriod}
        usageResetAt={weatherSearchUsageResetAt}
      />
    );
  }

  if (!weatherSearchFlag) {
    return (
      <div>
        <div>Weather search is not available in your plan!</div>
        <div>
          <a href="/usage">Upgrade your plan</a> for access to weather search.
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {pinnedLocations.length > 0 && (
        <div className="sidebar">
          <h3 className="sidebar-title">Pinned Locations</h3>
          <div className="pinned-locations">
            {pinnedLocations.map((pinnedLocation) => (
              <div key={pinnedLocation} className="pinned-location">
                <button
                  onClick={() => handlePinnedLocationClick(pinnedLocation)}
                  className="location-button"
                >
                  {pinnedLocation}
                </button>
                <button
                  onClick={() => handleUnpinLocation(pinnedLocation)}
                  className="unpin-button"
                  aria-label="Remove location"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="weather-container">
        {!schematicIsPending &&
          typeof weatherSearchUsage !== "undefined" &&
          typeof weatherSearchAllocation !== "undefined" && (
            <div className="usage-pill">
              {weatherSearchUsage} / {weatherSearchAllocation} used
            </div>
          )}
        <div className="search-container">
          <input
            type="text"
            value={location}
            onChange={handleChange}
            placeholder="Enter location"
            className="location-input"
          />
          {addPinnedLocationFlag && (
            <button onClick={handlePinLocation} className="pin-button">
              Pin Location
            </button>
          )}
        </div>
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
      </div>
      <style jsx>{`
        .app-container {
          display: flex;
          gap: 20px;
          max-width: 800px;
          margin: 40px auto;
        }
        .sidebar {
          width: 200px;
          background-color: #1e1e1e;
          border: 1px solid #333;
          border-radius: 10px;
          padding: 20px;
          color: #fff;
        }
        .sidebar-title {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 1.2em;
        }
        .pinned-locations {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pinned-location {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .location-button {
          flex: 1;
          text-align: left;
          padding: 8px;
          background-color: #333;
          border: 1px solid #555;
          border-radius: 5px;
          color: #fff;
          cursor: pointer;
        }
        .location-button:hover {
          background-color: #444;
        }
        .unpin-button {
          padding: 4px 8px;
          background-color: #333;
          border: 1px solid #555;
          border-radius: 5px;
          color: #fff;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
        }
        .unpin-button:hover {
          background-color: #444;
        }
        .weather-container {
          flex: 1;
          text-align: center;
          padding: 30px;
          border: 1px solid #333;
          border-radius: 10px;
          background-color: #1e1e1e;
          color: #fff;
          font-family: "Helvetica Neue", Arial, sans-serif;
          position: relative;
        }
        .usage-pill {
          float: right;
          background-color: rgba(0, 0, 0, 0.4);
          color: rgba(255, 255, 255, 0.9);
          padding: 5px 10px;
          margin: -15px -15px 0 20px;
          border-radius: 15px;
          font-size: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .search-container {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 25px;
        }
        .location-input {
          padding: 15px;
          border-radius: 5px;
          border: 1px solid #555;
          width: 100%;
          max-width: 250px;
          background-color: #333;
          color: #fff;
        }
        .pin-button {
          line-height: 1.15;
          padding: 15px;
          background-color: #333;
          border: 1px solid #555;
          border-radius: 5px;
          color: #fff;
          cursor: pointer;
        }
        .pin-button:hover {
          background-color: #444;
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
          flex-wrap: wrap;
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
