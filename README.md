# 🌦️ WeatherWave

WeatherWave is a modern weather dashboard built with **React**, **TypeScript**, and **Open-Meteo APIs**. It provides real-time weather conditions, hourly and weekly forecasts, air quality metrics, and intelligent location search in a clean, responsive interface.

Unlike many weather applications, WeatherWave uses **completely free, no-authentication APIs**, meaning there are **no API keys, subscriptions, or rate-limit concerns** for personal use.

---

## ✨ Features

### 🌍 Location Search

* Search for cities worldwide
* Fast geocoding powered by Open-Meteo
* Save favorite locations
* Automatic geolocation on startup
* Reverse geocoding for current position

### 🌤️ Current Weather

* Current temperature
* Feels-like temperature
* Weather condition
* Humidity
* Wind speed
* Wind direction
* Atmospheric pressure
* Cloud coverage
* Rainfall
* Snowfall
* Live weather icons

### 📈 Hourly Forecast

* 24-hour forecast
* Temperature trend
* Humidity
* UV Index
* Wind speed
* Chance of precipitation

### 📅 7-Day Forecast

* Daily highs and lows
* Weather conditions
* Sunrise and sunset
* Maximum UV Index
* Daily rainfall
* Wind forecast

### 🌱 Air Quality

* US AQI
* PM2.5
* PM10
* Carbon Monoxide
* Nitrogen Dioxide
* Sulphur Dioxide
* Ozone

### 🎨 Dynamic Interface

* Weather-aware themes
* Light/Dark mode
* Animated weather effects
* Responsive layout
* Smooth transitions
* Modern glassmorphism design

---

# 🛠 Tech Stack

## Frontend

* React
* TypeScript
* Tailwind CSS
* Motion
* Lucide Icons

## APIs

* Open-Meteo Weather API
* Open-Meteo Geocoding API
* Open-Meteo Air Quality API
* BigDataCloud Reverse Geocoding API

---

# 📁 Project Structure

```text
src/
│
├── components/
│   ├── DailyForecast.tsx
│   ├── HourlyForecast.tsx
│   ├── LocationSearch.tsx
│   ├── WeatherCharts.tsx
│   ├── WeatherIcon.tsx
│   └── WeatherMetrics.tsx
│
├── utils/
│   └── weatherApi.ts
│
├── types/
│
├── App.tsx
│
└── main.tsx
```

---

# 🚀 Getting Started

## Clone the repository

```bash
git clone https://github.com/Jetronite/weatherwave-dashboard.git
```

## Install dependencies

```bash
npm install
```

## Start the development server

```bash
npm run dev
```

---

# 🌐 APIs Used

## Weather Forecast

Open-Meteo Forecast API

Provides:

* Current weather
* Hourly forecast
* Daily forecast

---

## Geocoding

Open-Meteo Geocoding API

Provides:

* City search
* Latitude & longitude
* Country information

---

## Air Quality

Open-Meteo Air Quality API

Provides:

* AQI
* PM2.5
* PM10
* CO
* NO₂
* SO₂
* O₃

---

## Reverse Geocoding

BigDataCloud Reverse Geocoding API

Used to convert the user's GPS coordinates into a readable city and country.

---

# 📱 Responsive Design

WeatherWave is optimized for:

* Desktop
* Laptop
* Tablet
* Mobile devices

---

# 🎯 Key Features

* Real-time weather information
* Automatic location detection
* Global city search
* Favorite locations
* Dynamic weather themes
* Air quality monitoring
* Hourly weather charts
* Weekly forecasts
* Dark mode
* Celsius/Fahrenheit toggle
* Responsive design
* Smooth animations

---

# 🔒 Environment Variables

This project **does not require an `.env` file**.

All APIs used are publicly accessible and do not require authentication or API keys.

---

# 📦 Future Improvements

Potential enhancements include:

* Weather alerts and warnings
* Radar maps
* Historical weather data
* Sunrise and sunset animations
* Weather notifications
* Offline support with Progressive Web App (PWA)
* Multiple language support
* Severe weather tracking
* Widget mode
* Custom themes

---

# 🤝 Contributing

Contributions are welcome.

If you'd like to improve WeatherWave, feel free to fork the repository, create a feature branch, and submit a pull request.

---

# 📄 License

This project is unlicensed.

---

## Acknowledgements

This project would not be possible without the excellent free services provided by:

* Open-Meteo
* BigDataCloud
* React
* Tailwind CSS
* Lucide
