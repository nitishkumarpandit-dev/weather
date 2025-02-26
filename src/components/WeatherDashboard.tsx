import { useEffect, useState } from "react";
import { useWeather } from "@/context/WeatherContext";
import { useUser } from "@/context/UserContext";
import { getWeatherData } from "@/services/weatherService";
import WeatherIcon from "./WeatherIcon";
import ExtendedWeatherInfo from "./ExtendedWeatherInfo";
import WeatherAlerts from "./WeatherAlerts";
import {
  BellIcon,
  UserIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import LocationSearch from "./LocationSearch";

export default function WeatherDashboard() {
  const {
    weatherData,
    setWeatherData,
    loading,
    setLoading,
    error,
    setError,
    selectedLocation,
  } = useWeather();
  const { preferences } = useUser();
  const [alertCount, setAlertCount] = useState(0);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWeatherData(
          selectedLocation.lat,
          selectedLocation.lon
        );
        setWeatherData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch weather data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [selectedLocation, setWeatherData, setLoading, setError]);

  const convertTemperature = (celsius: number) => {
    if (preferences.temperatureUnit === "fahrenheit") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
        <div className="text-red-600 text-lg font-medium">{error}</div>
        <p className="text-gray-500 mt-2">
          Please try searching for another location
        </p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No Weather Data Found
        </h2>
        <p className="text-gray-500">
          Please search for a location to see weather information
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between space-x-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white min-w-max">
              Weather Overview
            </h1>
            <div className="flex-1 max-w-2xl">
              <LocationSearch />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowAlertDropdown(!showAlertDropdown)}
                >
                  <BellIcon className="h-6 w-6 text-gray-800 dark:text-white" />
                  {alertCount > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {alertCount}
                    </span>
                  )}
                </button>
                {showAlertDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowAlertDropdown(false)}
                    />
                    <div className="absolute z-20 right-0 mt-2">
                      <WeatherAlerts
                        mode="dropdown"
                        onAlertCountChange={setAlertCount}
                      />
                    </div>
                  </>
                )}
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <UserIcon className="h-6 w-6 text-gray-800 dark:text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {preferences.dashboardLayout.showCurrentWeather && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-6xl font-bold text-gray-900 dark:text-white">
                  {convertTemperature(weatherData.current.temp)}°
                  {preferences.temperatureUnit === "celsius" ? "C" : "F"}
                </div>
                <div className="text-lg text-gray-800 dark:text-gray-200 mt-1">
                  Feels like{" "}
                  {convertTemperature(weatherData.current.feels_like)}°
                  {preferences.temperatureUnit === "celsius" ? "C" : "F"}
                </div>
                <div className="text-gray-800 dark:text-gray-200 mt-2 flex items-center text-lg">
                  <svg
                    className="h-5 w-5 text-gray-700 dark:text-gray-300 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {selectedLocation.name}
                </div>
              </div>
              <div className="text-right">
                <WeatherIcon
                  iconCode={weatherData.current.weather[0].icon}
                  alt={weatherData.current.weather[0].description}
                  size={96}
                />
                <div className="text-lg text-gray-800 dark:text-gray-200 font-medium capitalize">
                  {weatherData.current.weather[0].description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <div className="text-gray-800 dark:text-gray-200 font-medium mb-1">
              Humidity
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {weatherData.current.humidity}%
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <div className="text-gray-800 dark:text-gray-200 font-medium mb-1">
              Wind Speed
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {weatherData.current.wind_speed} km/h
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <div className="text-gray-800 dark:text-gray-200 font-medium mb-1">
              UV Index
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(weatherData.current.uvi)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <div className="text-gray-800 dark:text-gray-200 font-medium mb-1">
              Local Time
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* Extended Weather Information */}
        {preferences.dashboardLayout.showExtendedInfo && (
          <ExtendedWeatherInfo />
        )}

        {/* Weather Alerts - Inline Mode */}
        <div className="mb-8">
          <WeatherAlerts mode="inline" onAlertCountChange={setAlertCount} />
        </div>
      </main>
    </div>
  );
}
