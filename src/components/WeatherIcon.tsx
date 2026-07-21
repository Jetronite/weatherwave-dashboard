import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  Snowflake,
  CloudLightning,
} from 'lucide-react';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = true,
  className = '',
  size = 24,
}) => {
  // Clear sky
  if (code === 0) {
    return isDay ? (
      <Sun className={`text-amber-500 animate-slow-spin ${className}`} size={size} id={`weather-icon-sun-${code}`} />
    ) : (
      <Moon className={`text-indigo-200 ${className}`} size={size} id={`weather-icon-moon-${code}`} />
    );
  }

  // Mainly clear, partly cloudy
  if ([1, 2].includes(code)) {
    return isDay ? (
      <CloudSun className={`text-amber-400 ${className}`} size={size} id={`weather-icon-cloudsun-${code}`} />
    ) : (
      <CloudMoon className={`text-indigo-300 ${className}`} size={size} id={`weather-icon-cloudmoon-${code}`} />
    );
  }

  // Overcast
  if (code === 3) {
    return <Cloud className={`text-slate-400 ${className}`} size={size} id={`weather-icon-cloud-${code}`} />;
  }

  // Fog and depositing rime fog
  if ([45, 48].includes(code)) {
    return <CloudFog className={`text-slate-300 ${className}`} size={size} id={`weather-icon-fog-${code}`} />;
  }

  // Drizzle: Light, moderate, and dense intensity
  if ([51, 53, 55, 56, 57].includes(code)) {
    return <CloudDrizzle className={`text-sky-400 ${className}`} size={size} id={`weather-icon-drizzle-${code}`} />;
  }

  // Rain: Slight, moderate and heavy intensity
  if ([61, 63, 65, 66, 67].includes(code)) {
    return <CloudRain className={`text-blue-400 ${className}`} size={size} id={`weather-icon-rain-${code}`} />;
  }

  // Snow fall: Slight, moderate, heavy, and snow grains
  if ([71, 73, 75, 77].includes(code)) {
    return <Snowflake className={`text-sky-100 ${className}`} size={size} id={`weather-icon-snow-${code}`} />;
  }

  // Rain showers: Slight, moderate, and violent
  if ([80, 81, 82].includes(code)) {
    return <CloudRainWind className={`text-blue-500 ${className}`} size={size} id={`weather-icon-showers-${code}`} />;
  }

  // Snow showers: Slight and heavy
  if ([85, 86].includes(code)) {
    return <Snowflake className={`text-sky-200 ${className}`} size={size} id={`weather-icon-snowshowers-${code}`} />;
  }

  // Thunderstorm: Slight, moderate, or heavy hail
  if ([95, 96, 99].includes(code)) {
    return <CloudLightning className={`text-purple-400 ${className}`} size={size} id={`weather-icon-thunder-${code}`} />;
  }

  return <Cloud className={`text-slate-400 ${className}`} size={size} id={`weather-icon-default`} />;
};

export function getWeatherLabel(code: number): string {
  switch (code) {
    case 0:
      return 'Clear Sky';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
      return 'Fog';
    case 48:
      return 'Depositing Rime Fog';
    case 51:
      return 'Light Drizzle';
    case 53:
      return 'Moderate Drizzle';
    case 55:
      return 'Dense Drizzle';
    case 56:
      return 'Light Freezing Drizzle';
    case 57:
      return 'Dense Freezing Drizzle';
    case 61:
      return 'Slight Rain';
    case 63:
      return 'Moderate Rain';
    case 65:
      return 'Heavy Rain';
    case 66:
      return 'Light Freezing Rain';
    case 67:
      return 'Heavy Freezing Rain';
    case 71:
      return 'Slight Snow';
    case 73:
      return 'Moderate Snow';
    case 75:
      return 'Heavy Snow';
    case 77:
      return 'Snow Grains';
    case 80:
      return 'Slight Rain Showers';
    case 81:
      return 'Moderate Rain Showers';
    case 82:
      return 'Violent Rain Showers';
    case 85:
      return 'Slight Snow Showers';
    case 86:
      return 'Heavy Snow Showers';
    case 95:
      return 'Thunderstorm';
    case 96:
      return 'Thunderstorm with Slight Hail';
    case 99:
      return 'Thunderstorm with Heavy Hail';
    default:
      return 'Unknown Weather';
  }
}
