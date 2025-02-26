import { useWeather } from "@/context/WeatherContext";

function getWindDirection(degree: number): string {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index =
    Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 22.5) % 16;
  return directions[index];
}

function getAQIDescription(aqi: number): { text: string; color: string } {
  const descriptions = {
    1: { text: "Good", color: "text-emerald-600 dark:text-emerald-400" },
    2: { text: "Fair", color: "text-yellow-700 dark:text-yellow-500" },
    3: { text: "Moderate", color: "text-orange-700 dark:text-orange-500" },
    4: { text: "Poor", color: "text-red-700 dark:text-red-500" },
    5: { text: "Very Poor", color: "text-purple-700 dark:text-purple-500" },
  };
  return descriptions[aqi as keyof typeof descriptions] || descriptions[1];
}

export default function ExtendedWeatherInfo() {
  const { weatherData } = useWeather();

  if (!weatherData) return null;

  const {
    pressure,
    visibility,
    wind_speed,
    wind_direction,
    sunrise,
    sunset,
    air_quality,
  } = weatherData.current;

  const sunriseTime = new Date(sunrise * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const sunsetTime = new Date(sunset * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const aqi = getAQIDescription(air_quality.aqi);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {/* Sunrise & Sunset Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Sun Schedule
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="h-6 w-6 text-amber-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-800 dark:text-gray-200">Sunrise</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {sunriseTime}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="h-6 w-6 text-orange-600 dark:text-orange-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-800 dark:text-gray-200">Sunset</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {sunsetTime}
            </span>
          </div>
        </div>
      </div>

      {/* Wind Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Wind Status
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-800 dark:text-gray-200">Speed</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {wind_speed} km/h
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-800 dark:text-gray-200">Direction</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {getWindDirection(wind_direction)} ({wind_direction}°)
            </span>
          </div>
        </div>
      </div>

      {/* Air Quality Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Air Quality
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-800 dark:text-gray-200">AQI Level</span>
            <span className={`font-semibold ${aqi.color}`}>{aqi.text}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-800 dark:text-gray-200">PM2.5</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {air_quality.components.pm2_5} µg/m³
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-800 dark:text-gray-200">PM10</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {air_quality.components.pm10} µg/m³
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Additional Info
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-800 dark:text-gray-200">Pressure</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {pressure} hPa
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-800 dark:text-gray-200">Visibility</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {visibility} km
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
