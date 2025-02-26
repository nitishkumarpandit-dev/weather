"use client";

import { useWeather } from "@/context/WeatherContext";
import { useUser } from "@/context/UserContext";
import WeatherIcon from "@/components/WeatherIcon";
import LocationSearch from "@/components/LocationSearch";
import {
  BellIcon,
  UserIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function ForecastPage() {
  const { weatherData, loading, error } = useWeather();
  const { preferences } = useUser();

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
              Weather Forecast
            </h1>
            <div className="flex-1 max-w-2xl">
              <LocationSearch />
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <BellIcon className="h-6 w-6 text-gray-800 dark:text-white" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <UserIcon className="h-6 w-6 text-gray-800 dark:text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 5-Day Forecast */}
        {preferences.dashboardLayout.showDailyForecast && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              5-Day Forecast
            </h2>
            <div className="space-y-4">
              {weatherData.daily && weatherData.daily.length > 0 ? (
                weatherData.daily.slice(0, 5).map((day) => (
                  <div
                    key={day.dt}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {/* Day and Weather Icon */}
                    <div className="flex items-center space-x-4 w-48">
                      <div className="w-24">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                            weekday: "long",
                          })}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <WeatherIcon
                        iconCode={day.weather[0].icon}
                        alt={day.weather[0].description}
                        size={40}
                      />
                    </div>

                    {/* Weather Description */}
                    <div className="flex-1 px-4">
                      <div className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                        {day.weather[0].description}
                      </div>
                    </div>

                    {/* Temperature Range */}
                    <div className="w-48 text-right px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {convertTemperature(day.temp.max)}°
                          {preferences.temperatureUnit === "celsius"
                            ? "C"
                            : "F"}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          /
                        </span>
                        <span className="text-lg text-gray-600 dark:text-gray-400">
                          {convertTemperature(day.temp.min)}°
                          {preferences.temperatureUnit === "celsius"
                            ? "C"
                            : "F"}
                        </span>
                      </div>
                    </div>

                    {/* Precipitation */}
                    <div className="w-32 text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Precipitation
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {Math.round(day.precipitation)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                  No forecast data available
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hourly Forecast */}
        {preferences.dashboardLayout.showHourlyForecast && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Hourly Forecast
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {weatherData.hourly.slice(0, 6).map((hour) => (
                <div
                  key={hour.dt}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
                >
                  <div className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                    {new Date(hour.dt * 1000).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      hour12: true,
                    })}
                  </div>
                  <WeatherIcon
                    iconCode={hour.weather[0].icon}
                    alt={hour.weather[0].main}
                    size={40}
                  />
                  <div className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                    {convertTemperature(hour.temp)}°
                    {preferences.temperatureUnit === "celsius" ? "C" : "F"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
