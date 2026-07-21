import React from 'react';
import { CurrentWeatherData, AirQualityData, DailyForecastData } from '../types';
import {
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  SunDim,
  Sunrise,
  Sunset,
  Waves,
  Navigation,
} from 'lucide-react';
import { motion } from 'motion/react';

interface WeatherMetricsProps {
  current: CurrentWeatherData;
  airQuality: AirQualityData;
  daily: DailyForecastData;
  isCelsius: boolean;
}

export const WeatherMetrics: React.FC<WeatherMetricsProps> = ({
  current,
  airQuality,
  daily,
  isCelsius,
}) => {
  // Apparent temp conversion
  const feelsLike = Math.round(
    isCelsius ? current.apparentTemperature : (current.apparentTemperature * 9) / 5 + 32
  );
  const actualTemp = Math.round(
    isCelsius ? current.temperature : (current.temperature * 9) / 5 + 32
  );
  const tempDiff = feelsLike - actualTemp;

  // AQI calculations and labels (US EPA scale)
  const getAQIStatus = (aqiValue: number) => {
    if (aqiValue <= 50) return { label: 'Good', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', desc: 'Air is clean and safe.' };
    if (aqiValue <= 100) return { label: 'Moderate', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', desc: 'Acceptable air quality.' };
    if (aqiValue <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', desc: 'Wear masks if sensitive.' };
    return { label: 'Unhealthy', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', desc: 'Avoid outdoor exercise.' };
  };

  const aqiInfo = getAQIStatus(airQuality.aqi);

  // UV index maximum mapping for today
  const uvMax = daily.uvIndexMax[0] || 0;
  const getUVStatus = (uv: number) => {
    if (uv <= 2) return { label: 'Low', desc: 'Minimal risk.' };
    if (uv <= 5) return { label: 'Moderate', desc: 'Sun protection advised.' };
    if (uv <= 7) return { label: 'High', desc: 'Seek shade midday.' };
    return { label: 'Very High', desc: 'High protection required.' };
  };
  const uvInfo = getUVStatus(uvMax);

  // Formatting sunrise & sunset
  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '--:--';
    }
  };

  const sunriseTime = formatTime(daily.sunrise[0]);
  const sunsetTime = formatTime(daily.sunset[0]);

  // Wind cardinal directions
  const getWindCardinal = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8;
    return directions[index];
  };

  const windCardinal = getWindCardinal(current.windDirection);

  // Metric grid config
  const metrics = [
    {
      id: 'aqi',
      title: 'Air Quality Index',
      value: airQuality.aqi,
      unit: ' US AQI',
      icon: Waves,
      iconColor: 'text-cyan-500',
      customEl: (
        <div className="mt-2" id="metric-aqi-status">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${aqiInfo.color}`}>
              {aqiInfo.label}
            </span>
          </div>
          <p className="font-sans text-[10px] text-slate-500 dark:text-slate-400">
            {aqiInfo.desc}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-500/10 text-[10px] font-mono text-slate-400">
            <div>PM2.5: <span className="text-slate-700 dark:text-slate-200">{Math.round(airQuality.pm2_5)} μg/m³</span></div>
            <div>PM10: <span className="text-slate-700 dark:text-slate-200">{Math.round(airQuality.pm10)} μg/m³</span></div>
          </div>
        </div>
      ),
    },
    {
      id: 'wind',
      title: 'Wind Vector',
      value: `${Math.round(current.windSpeed)}`,
      unit: ' km/h',
      icon: Wind,
      iconColor: 'text-emerald-500',
      customEl: (
        <div className="flex items-center gap-3 mt-3" id="metric-wind-compass">
          {/* Compass Graphic */}
          <div className="w-10 h-10 rounded-full border border-slate-500/20 bg-slate-100/50 dark:bg-slate-950/40 flex items-center justify-center relative">
            <motion.div
              style={{ rotate: current.windDirection }}
              className="text-emerald-500"
              id="compass-arrow-rotate"
            >
              <Navigation size={18} className="fill-emerald-500/30" />
            </motion.div>
            <span className="absolute text-[8px] font-bold text-slate-400 dark:text-slate-500 top-0">N</span>
          </div>
          <div>
            <p className="font-sans text-xs font-semibold text-slate-700 dark:text-slate-300">
              Blowing from {windCardinal}
            </p>
            <p className="font-sans text-[10px] text-slate-400 dark:text-slate-500">
              Bearing: {current.windDirection}°
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'feels-like',
      title: 'Feels Like',
      value: `${feelsLike}°`,
      unit: '',
      icon: Thermometer,
      iconColor: 'text-amber-500',
      customEl: (
        <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-2">
          {tempDiff === 0
            ? 'Exactly match the ambient dry-bulb temperature.'
            : tempDiff > 0
            ? `Sensory offset is ${tempDiff}° warmer due to humidity and wind factors.`
            : `Sensory offset is ${Math.abs(tempDiff)}° cooler due to wind chill factors.`}
        </p>
      ),
    },
    {
      id: 'humidity',
      title: 'Relative Humidity',
      value: `${current.humidity}%`,
      unit: '',
      icon: Droplets,
      iconColor: 'text-blue-500',
      customEl: (
        <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-2">
          {current.humidity > 60
            ? 'The air feels muggy and humid, holding significant moisture.'
            : current.humidity < 35
            ? 'The air is dry, indicating rapid evaporative speeds.'
            : 'Comfortable humidity balance for breathing safety.'}
        </p>
      ),
    },
    {
      id: 'uv',
      title: 'UV Solar Index',
      value: `${uvMax.toFixed(1)}`,
      unit: '',
      icon: SunDim,
      iconColor: 'text-orange-500',
      customEl: (
        <div className="mt-2" id="metric-uv-status">
          <p className="font-sans text-xs font-semibold text-slate-700 dark:text-slate-300">
            {uvInfo.label} Index Level
          </p>
          <p className="font-sans text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            {uvInfo.desc}
          </p>
        </div>
      ),
    },
    {
      id: 'diurnal',
      title: 'Solar Transitions',
      value: '',
      unit: '',
      icon: Sunrise,
      iconColor: 'text-amber-400',
      customEl: (
        <div className="flex flex-col gap-2.5 mt-2" id="metric-solar-times">
          <div className="flex items-center gap-2">
            <Sunrise size={14} className="text-amber-500" />
            <div className="flex flex-col">
              <span className="font-sans text-[10px] text-slate-400 dark:text-slate-500">Sunrise</span>
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">{sunriseTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sunset size={14} className="text-orange-400" />
            <div className="flex flex-col">
              <span className="font-sans text-[10px] text-slate-400 dark:text-slate-500">Sunset</span>
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">{sunsetTime}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'pressure',
      title: 'Atmospheric Pressure',
      value: `${Math.round(current.pressure)}`,
      unit: ' hPa',
      icon: Gauge,
      iconColor: 'text-rose-500',
      customEl: (
        <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-2">
          {current.pressure > 1013
            ? 'High-pressure cell system, bringing stable winds and clear skies.'
            : 'Low-pressure cell system, which could indicate rainy or unstable weather.'}
        </p>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="weather-metrics-grid">
      {metrics.map((m, index) => {
        const Icon = m.icon;
        const isAQI = m.id === 'aqi';
        
        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            className={`backdrop-blur-xl border rounded-[32px] p-6 shadow-sm flex flex-col justify-between ${
              isAQI
                ? 'bg-slate-900 border-slate-950 text-white dark:bg-slate-950/90 dark:border-slate-800/80 sm:col-span-2 shadow-xl relative overflow-hidden'
                : m.id === 'wind'
                ? 'bg-white/40 border-white/85 dark:bg-slate-900/40 dark:border-slate-800/80 sm:col-span-2'
                : 'bg-white/40 border-white/85 dark:bg-slate-900/40 dark:border-slate-800/80'
            }`}
            id={`metric-card-${m.id}`}
          >
            {isAQI && (
              <svg className="absolute -bottom-8 -right-8 opacity-10 pointer-events-none" width="140" height="140" viewBox="0 0 24 24" fill="white">
                <path d="M12 21c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm0-16c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z" />
              </svg>
            )}
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className={`font-sans text-[10px] font-bold uppercase tracking-wider ${isAQI ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {m.title}
                </span>
                <Icon size={16} className={isAQI ? 'text-cyan-400 animate-pulse' : m.iconColor} id={`metric-icon-${m.id}`} />
              </div>

              {m.value !== '' && (
                <h4 className={`font-sans text-3xl font-extrabold flex items-baseline ${isAQI ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                  {m.value}
                  <span className={`text-xs font-semibold font-sans ml-1 ${isAQI ? 'text-slate-400' : 'text-slate-400'}`}>
                    {m.unit}
                  </span>
                </h4>
              )}
            </div>

            <div className="relative z-10">
              {isAQI ? (
                <div className="mt-2" id="metric-aqi-status">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400`}>
                      {aqiInfo.label}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-slate-300">
                    {aqiInfo.desc}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                    <div>PM2.5: <span className="text-slate-200">{Math.round(airQuality.pm2_5)} μg/m³</span></div>
                    <div>PM10: <span className="text-slate-200">{Math.round(airQuality.pm10)} μg/m³</span></div>
                  </div>
                </div>
              ) : m.id === 'wind' ? (
                <div className="flex items-center gap-3 mt-3" id="metric-wind-compass">
                  <div className="w-10 h-10 rounded-full border border-slate-200/50 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/40 flex items-center justify-center relative">
                    <motion.div
                      style={{ rotate: current.windDirection }}
                      className="text-emerald-500"
                      id="compass-arrow-rotate"
                    >
                      <Navigation size={18} className="fill-emerald-500/30" />
                    </motion.div>
                    <span className="absolute text-[8px] font-bold text-slate-400 dark:text-slate-500 top-0">N</span>
                  </div>
                  <div>
                    <p className="font-sans text-xs font-bold text-slate-700 dark:text-slate-300">
                      Blowing from {windCardinal}
                    </p>
                    <p className="font-sans text-[10px] text-slate-400 dark:text-slate-500">
                      Bearing: {current.windDirection}°
                    </p>
                  </div>
                </div>
              ) : (
                m.customEl
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
