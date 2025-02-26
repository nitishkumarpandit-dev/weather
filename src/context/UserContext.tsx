"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface UserPreferences {
  temperatureUnit: "celsius" | "fahrenheit";
  theme: "light" | "dark";
  defaultLocation: {
    name: string;
    lat: number;
    lon: number;
  };
  savedLocations: Array<{
    name: string;
    lat: number;
    lon: number;
  }>;
  dashboardLayout: {
    showCurrentWeather: boolean;
    showHourlyForecast: boolean;
    showDailyForecast: boolean;
    showExtendedInfo: boolean;
  };
}

interface User {
  id: string;
  email: string;
  preferences: UserPreferences;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  preferences: UserPreferences;
}

const defaultPreferences: UserPreferences = {
  temperatureUnit: "celsius",
  theme: "light",
  defaultLocation: {
    name: "New York",
    lat: 40.7128,
    lon: -74.006,
  },
  savedLocations: [],
  dashboardLayout: {
    showCurrentWeather: true,
    showHourlyForecast: true,
    showDailyForecast: true,
    showExtendedInfo: true,
  },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Try to get saved preferences from localStorage
    if (typeof window !== "undefined") {
      const savedPreferences = localStorage.getItem("preferences");
      if (savedPreferences) {
        return JSON.parse(savedPreferences);
      }
    }
    // Check system preference for initial theme
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return { ...defaultPreferences, theme: "dark" };
    }
    return defaultPreferences;
  });

  useEffect(() => {
    // Load user data from localStorage on mount
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPreferences };
      localStorage.setItem("preferences", JSON.stringify(updated));
      return updated;
    });
  };

  // Apply theme to document
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (preferences.theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
      // Save to localStorage
      localStorage.setItem("preferences", JSON.stringify(preferences));
    }
  }, [preferences.theme]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        preferences,
        updatePreferences,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
