# Weather App

A modern weather application built with Next.js, featuring real-time weather updates, alerts, and customizable settings.

## Features

- Real-time weather data
- Weather alerts and notifications
- Dark/Light theme support
- Temperature unit conversion (Celsius/Fahrenheit)
- Location search with autocomplete
- Responsive design
- Air quality information
- UV index monitoring

## Tech Stack

- Next.js 13+
- TypeScript
- Tailwind CSS
- OpenWeatherMap API

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_api_key_here
NEXT_PUBLIC_OPENWEATHERMAP_BASE_URL=https://api.openweathermap.org/data/2.5
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` and add your OpenWeatherMap API key
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

This app is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add the environment variables in Vercel's project settings
4. Deploy!
