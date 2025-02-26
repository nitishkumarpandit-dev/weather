import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

interface WeatherItem {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  sys?: {
    sunrise: number;
    sunset: number;
  };
  pop?: number; // Probability of precipitation
}

export const getWeatherData = async (lat: number, lon: number) => {
  try {
    // Get current weather
    const currentWeatherResponse = await axios.get<WeatherItem>(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    // Get 5 day forecast
    const forecastResponse = await axios.get<{ list: WeatherItem[] }>(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    // Get Air Quality Data
    const airQualityResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );

    // Format the data to match our existing structure
    const formattedData = {
      current: {
        temp: currentWeatherResponse.data.main.temp,
        feels_like: currentWeatherResponse.data.main.feels_like,
        humidity: currentWeatherResponse.data.main.humidity,
        wind_speed: currentWeatherResponse.data.wind.speed,
        wind_direction: currentWeatherResponse.data.wind.deg,
        pressure: currentWeatherResponse.data.main.pressure,
        visibility: currentWeatherResponse.data.visibility / 1000, // Convert to km
        sunrise:
          currentWeatherResponse.data.sys?.sunrise ||
          Math.floor(Date.now() / 1000),
        sunset:
          currentWeatherResponse.data.sys?.sunset ||
          Math.floor(Date.now() / 1000) + 43200, // +12 hours
        uvi: 0, // UV index not available in free tier
        weather: currentWeatherResponse.data.weather,
        air_quality: {
          aqi: airQualityResponse.data.list[0].main.aqi,
          components: airQualityResponse.data.list[0].components,
        },
      },
      daily: forecastResponse.data.list
        .filter((item: WeatherItem, index: number) => {
          // Get one forecast per day by taking every 8th item (as each day has 8 readings - one every 3 hours)
          return index % 8 === 0;
        })
        .map((item: WeatherItem) => ({
          dt: item.dt,
          temp: {
            day: item.main.temp,
            min: item.main.temp_min,
            max: item.main.temp_max,
          },
          weather: item.weather,
          precipitation: (item.pop || 0) * 100, // Probability of precipitation as percentage
        })),
      hourly: forecastResponse.data.list
        .slice(0, 24)
        .map((item: WeatherItem) => ({
          dt: item.dt,
          temp: item.main.temp,
          weather: item.weather,
        })),
    };

    return formattedData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data.message || "Failed to fetch weather data"
      );
    }
    throw error;
  }
};

export const searchLocation = async (query: string) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data.message || "Failed to search location"
      );
    }
    throw error;
  }
};
