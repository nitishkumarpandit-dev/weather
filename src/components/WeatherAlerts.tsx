import { useState, useEffect } from "react";
import { useWeather } from "@/context/WeatherContext";
import {
  BellIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface WeatherAlert {
  id: string;
  type: string;
  severity: "minor" | "moderate" | "severe";
  description: string;
  startTime: number;
  endTime: number;
}

interface WeatherAlertsProps {
  mode?: "inline" | "dropdown";
  onAlertCountChange?: (count: number) => void;
}

export default function WeatherAlerts({
  mode = "inline",
  onAlertCountChange,
}: WeatherAlertsProps) {
  const { weatherData } = useWeather();
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Notify parent about alert count changes
  useEffect(() => {
    onAlertCountChange?.(alerts.length);
  }, [alerts.length, onAlertCountChange]);

  useEffect(() => {
    // Check if notifications are already enabled
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      } else if (Notification.permission === "default") {
        setShowNotificationPrompt(true);
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const generateAlerts = () => {
      if (!weatherData) return;

      const currentTime = Math.floor(Date.now() / 1000);
      const alerts: WeatherAlert[] = [];

      // Check for extreme temperatures
      const temp = weatherData.current.temp;
      if (temp >= 35) {
        alerts.push({
          id: "heat-" + Math.random().toString(36).substr(2, 9),
          type: "Extreme Heat",
          severity: "severe",
          description:
            "High temperature alert. Stay hydrated and avoid prolonged sun exposure.",
          startTime: currentTime,
          endTime: currentTime + 3600 * 3, // 3 hours duration
        });
      } else if (temp <= 0) {
        alerts.push({
          id: "cold-" + Math.random().toString(36).substr(2, 9),
          type: "Extreme Cold",
          severity: "severe",
          description:
            "Freezing temperature alert. Take precautions against cold exposure.",
          startTime: currentTime,
          endTime: currentTime + 3600 * 3,
        });
      }

      // Check for severe weather conditions
      const weatherCondition =
        weatherData.current.weather[0].main.toLowerCase();
      if (weatherCondition.includes("thunderstorm")) {
        alerts.push({
          id: "storm-" + Math.random().toString(36).substr(2, 9),
          type: "Thunderstorm Warning",
          severity: "severe",
          description:
            "Thunderstorm in your area. Seek shelter and stay indoors.",
          startTime: currentTime,
          endTime: currentTime + 3600 * 2,
        });
      } else if (
        weatherCondition.includes("rain") &&
        weatherData.current.wind_speed > 20
      ) {
        alerts.push({
          id: "wind-rain-" + Math.random().toString(36).substr(2, 9),
          type: "Strong Wind and Rain",
          severity: "moderate",
          description:
            "Strong winds with heavy rain. Exercise caution when outside.",
          startTime: currentTime,
          endTime: currentTime + 3600 * 2,
        });
      }

      // Check for poor air quality
      if (weatherData.current.air_quality.aqi >= 4) {
        alerts.push({
          id: "aqi-" + Math.random().toString(36).substr(2, 9),
          type: "Poor Air Quality",
          severity: "moderate",
          description:
            "Air quality is unhealthy. Sensitive groups should limit outdoor activities.",
          startTime: currentTime,
          endTime: currentTime + 3600 * 24,
        });
      }

      // UV Index warning
      if (weatherData.current.uvi >= 8) {
        alerts.push({
          id: "uv-" + Math.random().toString(36).substr(2, 9),
          type: "High UV Index",
          severity: "moderate",
          description:
            "Very high UV levels. Use sun protection and limit sun exposure.",
          startTime: currentTime,
          endTime: currentTime + 3600 * 6,
        });
      }

      setAlerts(alerts);

      // Send notification if enabled and there are alerts
      if (notificationsEnabled && alerts.length > 0) {
        new Notification("Weather Alert", {
          body: alerts[0].description,
          icon: "/weather-icon.png",
        });
      }
    };

    if (weatherData) {
      generateAlerts();
      // Refresh alerts every 30 minutes
      interval = setInterval(generateAlerts, 30 * 60 * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [weatherData, notificationsEnabled]);

  const getSeverityColor = (severity: "minor" | "moderate" | "severe") => {
    switch (severity) {
      case "minor":
        return "bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "moderate":
        return "bg-orange-50 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
      case "severe":
        return "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const enableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        setShowNotificationPrompt(false);
      }
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
  };

  if (mode === "dropdown") {
    return (
      <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No active weather alerts
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${getSeverityColor(
                  alert.severity
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold">{alert.type}</h3>
                      <p className="mt-1 text-sm">{alert.description}</p>
                      <p className="mt-2 text-xs opacity-75">
                        {new Date(alert.startTime * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 hover:bg-black/5 rounded"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!alerts.length && !showNotificationPrompt) return null;

  // Original inline view
  return (
    <div className="space-y-4">
      {showNotificationPrompt && (
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <p className="text-blue-800 dark:text-blue-100">
                Enable notifications to stay updated with weather alerts
              </p>
            </div>
            <button
              onClick={enableNotifications}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">{alert.type}</h3>
                <p className="mt-1 text-sm">{alert.description}</p>
                <p className="mt-2 text-sm opacity-75">
                  {new Date(alert.startTime * 1000).toLocaleString()} -{" "}
                  {new Date(alert.endTime * 1000).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="p-1 hover:bg-black/5 rounded"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
