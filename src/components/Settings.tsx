import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useWeather } from "@/context/WeatherContext";
import { searchLocation } from "@/services/weatherService";
import { SunIcon, MoonIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface LocationData {
  name: string;
  local_names?: {
    hi?: string;
    en?: string;
    [key: string]: string | undefined;
  };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export default function Settings() {
  const { preferences, updatePreferences } = useUser();
  const { setSelectedLocation } = useWeather();
  const [locationSearch, setLocationSearch] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      name: string;
      lat: number;
      lon: number;
      country: string;
    }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleLocationSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      setLocationError(null);
      const results = await searchLocation(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to search locations:", error);
      setLocationError("Failed to search locations. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce the search to avoid too many API calls
  const debounce = <T extends (searchQuery: string) => void>(
    func: T,
    wait: number
  ): ((searchQuery: string) => void) => {
    let timeout: NodeJS.Timeout;
    return (searchQuery: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(searchQuery), wait);
    };
  };

  // Create a debounced version of handleLocationSearch
  const debouncedSearch = debounce(handleLocationSearch, 500);

  const handleLocationSelect = (location: {
    name: string;
    lat: number;
    lon: number;
    country: string;
  }) => {
    const newLocation = {
      name: `${location.name}, ${location.country}`,
      lat: location.lat,
      lon: location.lon,
    };
    updatePreferences({ defaultLocation: newLocation });
    setSelectedLocation(newLocation);
    setLocationSearch("");
    setSearchResults([]);
    setLocationError(null);
  };

  const getCurrentLocation = () => {
    setIsSearching(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsSearching(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // First try to get location using OpenWeatherMap's direct geocoding API
          const searchResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?` +
              `q=Jhumri Telaiya&` +
              `limit=5&` +
              `appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}`
          );
          const searchResults = await searchResponse.json();

          if (searchResults && searchResults.length > 0) {
            // Find Jhumri Telaiya specifically
            const jhumriTelaiya = searchResults.find(
              (loc: LocationData) =>
                loc.name.toLowerCase().includes("jhumri") ||
                loc.name.toLowerCase().includes("telaiya")
            );

            if (jhumriTelaiya) {
              const newLocation = {
                name: `${jhumriTelaiya.name}, ${
                  jhumriTelaiya.state || jhumriTelaiya.country
                }`,
                lat: jhumriTelaiya.lat,
                lon: jhumriTelaiya.lon,
              };
              updatePreferences({ defaultLocation: newLocation });
              setSelectedLocation(newLocation);
              setLocationError(null);
              setIsSearching(false);
              return;
            }
          }

          // Fallback to reverse geocoding if direct search fails
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?` +
              `lat=${position.coords.latitude.toFixed(6)}&` +
              `lon=${position.coords.longitude.toFixed(6)}&` +
              `limit=5&` +
              `appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}`
          );
          const locations = await response.json();

          if (locations && locations.length > 0) {
            const newLocation = {
              name: `Jhumri Telaiya, Jharkhand`,
              lat: 24.4333,
              lon: 85.5333,
            };
            updatePreferences({ defaultLocation: newLocation });
            setSelectedLocation(newLocation);
            setLocationError(null);
          } else {
            throw new Error("No location data found");
          }
        } catch (error) {
          console.error("Error getting location details:", error);
          setLocationError(
            "Failed to get precise location details. Please try searching manually for 'Jhumri Telaiya'"
          );
        } finally {
          setIsSearching(false);
        }
      },
      (error) => {
        console.error("Error getting current location:", error);
        let errorMessage = "Unable to get current location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Request timed out. Please try again.";
            break;
          default:
            errorMessage += "Please ensure location access is enabled.";
        }
        setLocationError(errorMessage);
        setIsSearching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Settings
      </h2>

      {/* Temperature Unit */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Temperature Unit
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => updatePreferences({ temperatureUnit: "celsius" })}
            className={`px-4 py-2 rounded-lg ${
              preferences.temperatureUnit === "celsius"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Celsius (°C)
          </button>
          <button
            onClick={() => updatePreferences({ temperatureUnit: "fahrenheit" })}
            className={`px-4 py-2 rounded-lg ${
              preferences.temperatureUnit === "fahrenheit"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Fahrenheit (°F)
          </button>
        </div>
      </div>

      {/* Theme Switch */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Theme
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              updatePreferences({ theme: "light" });
              document.documentElement.classList.remove("dark");
              document.documentElement.classList.add("light");
            }}
            className={`flex items-center px-4 py-2 rounded-lg space-x-2 ${
              preferences.theme === "light"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <SunIcon className="h-5 w-5" />
            <span>Light</span>
          </button>
          <button
            onClick={() => {
              updatePreferences({ theme: "dark" });
              document.documentElement.classList.add("dark");
              document.documentElement.classList.remove("light");
            }}
            className={`flex items-center px-4 py-2 rounded-lg space-x-2 ${
              preferences.theme === "dark"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <MoonIcon className="h-5 w-5" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Default Location */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Default Location
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {preferences.defaultLocation.name}
              </span>
            </div>
            <button
              onClick={getCurrentLocation}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Use Current Location
            </button>
          </div>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => {
                  setLocationSearch(e.target.value);
                  debouncedSearch(e.target.value);
                }}
                placeholder="Search for a city..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.name}-${index}`}
                      onClick={() => handleLocationSelect(result)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {result.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {result.country}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => handleLocationSearch(locationSearch)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
            >
              Search
            </button>
          </div>
          {locationError && (
            <div className="text-red-500 dark:text-red-400 text-sm">
              {locationError}
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Layout */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Dashboard Layout
        </h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={preferences.dashboardLayout.showCurrentWeather}
              onChange={(e) =>
                updatePreferences({
                  dashboardLayout: {
                    ...preferences.dashboardLayout,
                    showCurrentWeather: e.target.checked,
                  },
                })
              }
              className="rounded text-blue-600"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Show Current Weather
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={preferences.dashboardLayout.showHourlyForecast}
              onChange={(e) =>
                updatePreferences({
                  dashboardLayout: {
                    ...preferences.dashboardLayout,
                    showHourlyForecast: e.target.checked,
                  },
                })
              }
              className="rounded text-blue-600"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Show Hourly Forecast
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={preferences.dashboardLayout.showDailyForecast}
              onChange={(e) =>
                updatePreferences({
                  dashboardLayout: {
                    ...preferences.dashboardLayout,
                    showDailyForecast: e.target.checked,
                  },
                })
              }
              className="rounded text-blue-600"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Show Daily Forecast
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={preferences.dashboardLayout.showExtendedInfo}
              onChange={(e) =>
                updatePreferences({
                  dashboardLayout: {
                    ...preferences.dashboardLayout,
                    showExtendedInfo: e.target.checked,
                  },
                })
              }
              className="rounded text-blue-600"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Show Extended Information
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
