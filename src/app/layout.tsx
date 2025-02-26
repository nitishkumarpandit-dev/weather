import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WeatherProvider } from "@/context/WeatherContext";
import { UserProvider } from "@/context/UserContext";
import Link from "next/link";
import {
  HomeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weather App",
  description: "A modern weather application built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <WeatherProvider>
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
              {/* Sidebar */}
              <aside className="w-16 md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Link href="/" className="block">
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden md:block">
                        Weather App
                      </h1>
                      <div className="md:hidden flex justify-center">
                        <HomeIcon className="h-6 w-6 text-gray-900 dark:text-white" />
                      </div>
                    </Link>
                  </div>
                  <nav className="flex-1 space-y-1 px-2 py-4">
                    <Link
                      href="/"
                      className="flex items-center px-3 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg group"
                    >
                      <HomeIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                      <span className="hidden md:block">Overview</span>
                    </Link>
                    <Link
                      href="/forecast"
                      className="flex items-center px-3 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg group"
                    >
                      <ChartBarIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                      <span className="hidden md:block">Forecast</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-3 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg group"
                    >
                      <Cog6ToothIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                      <span className="hidden md:block">Settings</span>
                    </Link>
                  </nav>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 ml-16 md:ml-64">{children}</div>
            </div>
          </WeatherProvider>
        </UserProvider>
      </body>
    </html>
  );
}
