import { useUser } from "@/context/UserContext";
import { format } from "date-fns";

interface HourlyForecastProps {
  hourlyData: Array<{
    dt: number;
    temp: number;
    weather: Array<{
      icon: string;
      description: string;
    }>;
  }>;
}

export default function HourlyForecast({ hourlyData }: HourlyForecastProps) {
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
        Hourly Forecast
      </h2>
      <div className="grid grid-cols-6 gap-4">
        {hourlyData.slice(0, 6).map((hour) => (
          <div
            key={hour.dt}
            className="flex flex-col items-center space-y-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {format(new Date(hour.dt * 1000), "ha")}
            </span>
            <img
              src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}
              alt={hour.weather[0].description}
              className="w-12 h-12"
            />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {convertTemperature(hour.temp)}°
              {preferences.temperatureUnit === "fahrenheit" ? "F" : "C"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
