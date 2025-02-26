import { useState, useEffect } from "react";
import { useWeather } from "@/context/WeatherContext";
import { useUser } from "@/context/UserContext";
import { searchLocation } from "@/services/weatherService";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon as StarIconOutline,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function LocationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    Array<{ name: string; lat: number; lon: number; country: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const { selectedLocation, setSelectedLocation, loading } = useWeather();
  const { preferences, updatePreferences } = useUser();

  // Ensure savedLocations exists
  const savedLocations = preferences?.savedLocations || [];

  // Debounce function
  const debounce = <T extends (searchQuery: string) => void>(
    func: T,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout;
    return (searchQuery: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(searchQuery), wait);
    };
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);
      const locations = await searchLocation(searchQuery);
      setResults(locations);
    } catch (error) {
      console.error("Failed to search locations:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Create a debounced version of handleSearch
  const debouncedSearch = debounce(handleSearch, 300);

  // Update search results when query changes
  useEffect(() => {
    debouncedSearch(query);
    setShowSavedLocations(false);
  }, [query]);

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
    setSelectedLocation(newLocation);
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setShowSavedLocations(false);
  };

  const isLocationSaved = (location: { lat: number; lon: number }) => {
    return savedLocations.some(
      (saved) => saved.lat === location.lat && saved.lon === location.lon
    );
  };

  const toggleSaveLocation = (location: {
    name: string;
    lat: number;
    lon: number;
    country: string;
  }) => {
    const locationToSave = {
      name: `${location.name}, ${location.country}`,
      lat: location.lat,
      lon: location.lon,
    };

    if (isLocationSaved(locationToSave)) {
      // Remove location
      updatePreferences({
        savedLocations: savedLocations.filter(
          (saved) => !(saved.lat === location.lat && saved.lon === location.lon)
        ),
      });
    } else {
      // Add location
      updatePreferences({
        savedLocations: [...savedLocations, locationToSave],
      });
    }
  };

  return (
    <div className="relative max-w-md w-full mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSavedLocations(true)}
          placeholder={
            loading
              ? "Detecting location..."
              : selectedLocation?.name || "Search for a city..."
          }
          className="w-full px-4 py-3 pl-12 pr-20 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700"
          disabled={loading}
        />
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
        {loading ? (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <button
            onClick={() => setShowSavedLocations(!showSavedLocations)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
          >
            <StarIconOutline className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-500" />
          </button>
        )}
        {isSearching && !loading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Saved Locations */}
      {showSavedLocations && savedLocations.length > 0 && !query && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Saved Locations
            </h3>
          </div>
          {savedLocations.map((location, index) => (
            <button
              key={`${location.name}-${index}`}
              onClick={() =>
                handleLocationSelect({
                  ...location,
                  country: location.name.split(", ")[1],
                })
              }
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {location.name}
                </span>
              </div>
              <StarIconSolid className="h-5 w-5 text-yellow-500" />
            </button>
          ))}
        </div>
      )}

      {/* Search Results */}
      {!isSearching && hasSearched && results.length === 0 && query && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col items-center text-center">
            <MapPinIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-gray-900 dark:text-white font-medium">
              No locations found
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Try searching for another city
            </p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {results.map((result, index) => (
            <div
              key={`${result.name}-${index}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <button
                onClick={() => handleLocationSelect(result)}
                className="flex items-center space-x-3 flex-grow text-left"
              >
                <MapPinIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {result.name}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {result.country}
                  </div>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveLocation(result);
                }}
                className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                {isLocationSaved(result) ? (
                  <StarIconSolid className="h-5 w-5 text-yellow-500" />
                ) : (
                  <StarIconOutline className="h-5 w-5 text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-500" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
