import { useUser } from "@/context/UserContext";
import { format } from "date-fns";

interface FiveDayForecastProps {
  dailyData: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
    };
    weather: Array<{
      icon: string;
      description: string;
    }>;
    pop: number;
  }>;
}

export default function FiveDayForecast({ dailyData }: FiveDayForecastProps) {
  const { preferences } = useUser();

  const convertTemperature = (celsius: number) => {
    if (preferences.temperatureUnit === "fahrenheit") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        5-Day Forecast
      </h2>
      <div className="grid grid-cols-5 gap-4">
        {dailyData.slice(1, 6).map((day) => (
          <div
            key={day.dt}
            className="flex flex-col items-center space-y-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {format(new Date(day.dt * 1000), "EEE")}
            </span>
            <img
              src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
              alt={day.weather[0].description}
              className="w-12 h-12"
            />
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {convertTemperature(day.temp.max)}°
                {preferences.temperatureUnit === "fahrenheit" ? "F" : "C"}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {convertTemperature(day.temp.min)}°
                {preferences.temperatureUnit === "fahrenheit" ? "F" : "C"}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round(day.pop * 100)}% rain
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
