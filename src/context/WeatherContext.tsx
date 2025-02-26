"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    pressure: number;
    visibility: number;
    sunrise: number;
    sunset: number;
    uvi: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    air_quality: {
      aqi: number;
      components: {
        co: number;
        no: number;
        no2: number;
        o3: number;
        so2: number;
        pm2_5: number;
        pm10: number;
        nh3: number;
      };
    };
  };
  daily: Array<{
    dt: number;
    temp: {
      day: number;
      min: number;
      max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    precipitation: number;
  }>;
  hourly: Array<{
    dt: number;
    temp: number;
    weather: Array<{
      main: string;
      icon: string;
    }>;
  }>;
}

interface WeatherContextType {
  weatherData: WeatherData | null;
  setWeatherData: (data: WeatherData | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  selectedLocation: {
    lat: number;
    lon: number;
    name: string;
  };
  setSelectedLocation: (location: {
    lat: number;
    lon: number;
    name: string;
  }) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (typeof window !== "undefined") {
      const savedLocation = localStorage.getItem("selectedLocation");
      if (savedLocation) {
        return JSON.parse(savedLocation);
      }
    }
    return null;
  });

  // Function to get precise location name from coordinates
  const getLocationFromCoords = async (lat: number, lon: number) => {
    try {
      // First try reverse geocoding
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?` +
          `lat=${lat.toFixed(6)}&` +
          `lon=${lon.toFixed(6)}&` +
          `limit=5&` +
          `appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        const locationParts = [];

        // Add city/locality name
        if (location.name) {
          locationParts.push(location.name);
        }

        // Add state/region if available
        if (location.state && location.state !== location.name) {
          locationParts.push(location.state);
        }

        // Add country
        if (location.country) {
          locationParts.push(location.country);
        }

        return {
          name: locationParts.join(", "),
          lat: parseFloat(lat.toFixed(6)),
          lon: parseFloat(lon.toFixed(6)),
        };
      }
      throw new Error("Location not found");
    } catch (error) {
      console.error("Error getting location name:", error);
      throw error;
    }
  };

  // Get user's current location on first visit
  useEffect(() => {
    const getUserLocation = async () => {
      if (selectedLocation) return;

      try {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by your browser");
        }

        // Get current position with high accuracy
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          }
        );

        // Get precise location name
        const location = await getLocationFromCoords(
          position.coords.latitude,
          position.coords.longitude
        );

        setSelectedLocation(location);
      } catch (error) {
        console.error("Error getting current location:", error);
        // Set default location if geolocation fails
        setSelectedLocation({
          lat: 40.7128,
          lon: -74.006,
          name: "New York, United States",
        });

        let errorMessage = "Failed to get current location: ";
        if (error instanceof GeolocationPositionError) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage +=
                "Location permission denied. Please enable location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "Unknown error occurred.";
          }
        } else {
          errorMessage +=
            error instanceof Error ? error.message : "Unknown error occurred";
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    getUserLocation();
  }, [selectedLocation]);

  // Save selected location to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && selectedLocation) {
      localStorage.setItem(
        "selectedLocation",
        JSON.stringify(selectedLocation)
      );
    }
  }, [selectedLocation]);

  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        setWeatherData,
        loading,
        setLoading,
        error,
        setError,
        selectedLocation,
        setSelectedLocation,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
}
