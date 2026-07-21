export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  admin1?: string; // State or province
  country: string;
  timezone?: string;
}

export interface CurrentWeatherData {
  temperature: number;
  humidity: number;
  apparentTemperature: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weatherCode: number;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
}

export interface HourlyForecastData {
  time: string[];
  temperature: number[];
  humidity: number[];
  apparentTemperature: number[];
  precipitationProbability: number[];
  precipitation: number[];
  weatherCode: number[];
  uvIndex: number[];
  windSpeed: number[];
}

export interface DailyForecastData {
  time: string[];
  weatherCode: number[];
  tempMax: number[];
  tempMin: number[];
  apparentTempMax: number[];
  apparentTempMin: number[];
  sunrise: string[];
  sunset: string[];
  uvIndexMax: number[];
  precipitationSum: number[];
  precipitationProbability: number[];
  windSpeedMax: number[];
}

export interface AirQualityData {
  aqi: number; // European or US AQI
  pm2_5: number;
  pm10: number;
  co: number;
  no2: number;
  so2: number;
  o3: number;
}

export interface WeatherReport {
  location: GeoLocation;
  current: CurrentWeatherData;
  hourly: HourlyForecastData;
  daily: DailyForecastData;
  airQuality: AirQualityData;
}

export interface WeatherConditionConfig {
  label: string;
  icon: string; // Lucide icon name or React component
  themeClass: string; // Gradient background and overall page theme colors
  accentColor: string; // CSS color or Tailwind class
  glowColor: string; // Tailwind backdrop glow style
}
