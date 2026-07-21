import { useState, useEffect, useCallback } from 'react';
import {
  WeatherReport,
  GeoLocation,
} from './types';
import {
  fetchWeatherReport,
  getWeatherCondition,
  DEFAULT_LOCATION,
} from './utils/weatherApi';
import { WeatherIcon, getWeatherLabel } from './components/WeatherIcon';
import { WeatherCharts } from './components/WeatherCharts';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { WeatherMetrics } from './components/WeatherMetrics';
import { LocationSearch } from './components/LocationSearch';
import {
  MapPin,
  RefreshCw,
  Sun,
  Moon,
  Compass,
  Sparkles,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type WeatherTheme =
  | 'sunny'
  | 'clear-night'
  | 'partly-cloudy'
  | 'cloudy-night'
  | 'foggy'
  | 'drizzle'
  | 'rainy'
  | 'snowy'
  | 'thunderstorm';

interface ThemeConfig {
  gradientClass: string;
  orbClass: string;
  accentText: string;
  badgeBg: string;
}

const THEME_CONFIGS: Record<WeatherTheme, ThemeConfig> = {
  sunny: {
    gradientClass: 'bg-slate-50 dark:bg-[#070A13]',
    orbClass: 'bg-amber-200/40 dark:bg-amber-500/10',
    accentText: 'text-amber-500 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
  },
  'clear-night': {
    gradientClass: 'bg-slate-50 dark:bg-[#070A13]',
    orbClass: 'bg-indigo-300/20 dark:bg-indigo-950/20',
    accentText: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  },
  'partly-cloudy': {
    gradientClass: 'bg-slate-50 dark:bg-[#070A13]',
    orbClass: 'bg-sky-200/35 dark:bg-blue-950/10',
    accentText: 'text-blue-500 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400',
  },
  'cloudy-night': {
    gradientClass: 'bg-slate-50 dark:bg-[#070A13]',
    orbClass: 'bg-slate-300/20 dark:bg-slate-900/20',
    accentText: 'text-slate-400',
    badgeBg: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
  },
  foggy: {
    gradientClass: 'bg-slate-50 dark:bg-[#070A13]',
    orbClass: 'bg-zinc-300/20 dark:bg-zinc-900/10',
    accentText: 'text-zinc-500 dark:text-zinc-400',
    badgeBg: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500 dark:text-zinc-400',
  },
  drizzle: {
    gradientClass: 'bg-slate-50 dark:bg-[#070A13]',
    orbClass: 'bg-sky-200/30 dark:bg-sky-900/10',
    accentText: 'text-sky-500 dark:text-sky-400',
    badgeBg: 'bg-sky-500/10 border-sky-500/20 text-sky-500 dark:text-sky-400',
  },
  rainy: {
    gradientClass: 'bg-slate-50 dark:bg-[#070A13]',
    orbClass: 'bg-blue-300/25 dark:bg-blue-950/20',
    accentText: 'text-blue-500 dark:text-blue-400',
    badgeBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400',
  },
  snowy: {
    gradientClass: 'bg-slate-50 dark:bg-[#070A13]',
    orbClass: 'bg-sky-100/40 dark:bg-sky-950/10',
    accentText: 'text-sky-500 dark:text-sky-400',
    badgeBg: 'bg-sky-500/10 border-sky-500/20 text-sky-500 dark:text-sky-400',
  },
  thunderstorm: {
    gradientClass: 'bg-slate-50 dark:bg-[#070A13]',
    orbClass: 'bg-purple-300/20 dark:bg-purple-950/10',
    accentText: 'text-purple-500 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400',
  },
};

const DEFAULT_PINNED_CITIES: GeoLocation[] = [
  {
    id: 5128581,
    name: 'New York',
    latitude: 40.71427,
    longitude: -74.00597,
    country_code: 'US',
    admin1: 'New York',
    country: 'United States',
  },
  {
    id: 1850147,
    name: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.69171,
    country_code: 'JP',
    admin1: 'Tokyo',
    country: 'Japan',
  },
  {
    id: 2147714,
    name: 'Sydney',
    latitude: -33.86785,
    longitude: 151.20732,
    country_code: 'AU',
    admin1: 'New South Wales',
    country: 'Australia',
  },
];

export default function App() {
  const [activeLocation, setActiveLocation] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [savedLocations, setSavedLocations] = useState<GeoLocation[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Read saved locations & preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('weatherwave_pinned');
    if (saved) {
      try {
        setSavedLocations(JSON.parse(saved));
      } catch (e) {
        setSavedLocations(DEFAULT_PINNED_CITIES);
      }
    } else {
      setSavedLocations(DEFAULT_PINNED_CITIES);
      localStorage.setItem('weatherwave_pinned', JSON.stringify(DEFAULT_PINNED_CITIES));
    }

    // Default dark/light mode detection
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
  }, []);

  // Sync theme to root class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch report function
  const loadWeather = useCallback(async (location: GeoLocation, backgroundRefresh = false) => {
    if (!backgroundRefresh) setIsLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      const data = await fetchWeatherReport(location);
      setReport(data);
    } catch (err) {
      console.error('Failed to load weather report:', err);
      setError('Failed to fetch the micro-climate telemetry. Check internet connectivity.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Handle auto-geolocation on startup
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          try {
            // Reverse geocode via free BigDataCloud API
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            if (res.ok) {
              const data = await res.json();
              const detectedCity = data.city || data.locality || data.principalSubdivision || 'Detected Station';
              const country = data.countryName || 'Current Location';
              const countryCode = data.countryCode || '';

              const localLoc: GeoLocation = {
                id: Math.round(lat * 1000 + lon * 1000),
                name: detectedCity,
                latitude: lat,
                longitude: lon,
                country: country,
                country_code: countryCode,
                admin1: data.principalSubdivision || '',
              };
              
              setActiveLocation(localLoc);
              loadWeather(localLoc);
            } else {
              throw new Error('Reverse geocoding failed');
            }
          } catch (e) {
            // Coordinate fallback
            const localLoc: GeoLocation = {
              id: Math.round(lat * 1000 + lon * 1000),
              name: `Station ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
              latitude: lat,
              longitude: lon,
              country: 'Detected Location',
            };
            setActiveLocation(localLoc);
            loadWeather(localLoc);
          }
        },
        (geoError) => {
          console.warn('Geolocation denied or failed. Fallback to default London.', geoError);
          // Load default London
          setActiveLocation(DEFAULT_LOCATION);
          loadWeather(DEFAULT_LOCATION);
        },
        { timeout: 8000 }
      );
    } else {
      loadWeather(DEFAULT_LOCATION);
    }
  }, [loadWeather]);

  // Load weather when active location changes
  useEffect(() => {
    if (activeLocation.id !== DEFAULT_LOCATION.id || report === null) {
      loadWeather(activeLocation);
    }
  }, [activeLocation, loadWeather]);

  // Toggle Pinned Location
  const handleToggleSaveLocation = (loc: GeoLocation) => {
    const exists = savedLocations.some((s) => s.id === loc.id);
    let updated: GeoLocation[];

    if (exists) {
      updated = savedLocations.filter((s) => s.id !== loc.id);
    } else {
      updated = [...savedLocations, loc];
    }

    setSavedLocations(updated);
    localStorage.setItem('weatherwave_pinned', JSON.stringify(updated));
  };

  const activeCondition = report
    ? getWeatherCondition(report.current.weatherCode, report.current.isDay)
    : 'sunny';

  const theme = THEME_CONFIGS[activeCondition as WeatherTheme] || THEME_CONFIGS.sunny;

  // Background particle renderings based on condition
  const renderBackgroundParticles = () => {
    if (activeCondition === 'rainy' || activeCondition === 'drizzle') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-[1.5px] h-9 bg-blue-300 dark:bg-sky-400 rounded-full animate-rain-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * -20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 0.8}s`,
              }}
            />
          ))}
        </div>
      );
    }

    if (activeCondition === 'snowy') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-55 z-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse-slow"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      );
    }

    if (activeCondition === 'clear-night' || activeCondition === 'cloudy-night') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse-slow"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`min-h-screen relative flex flex-col transition-all duration-1000 overflow-x-hidden ${theme.gradientClass}`}
      id="weatherwave-root"
    >
      {/* Background Particles layer */}
      {renderBackgroundParticles()}

      {/* Ambient Background Decor (Bento Theme Spec) */}
      <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 -z-10 translate-x-1/2 -translate-y-1/2 animate-drift ${theme.orbClass}`} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-100/20 dark:bg-sky-500/5 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 -z-10 -translate-x-1/4 translate-y-1/4 animate-drift" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-slate-500/10">
        <div className="flex items-center gap-2" id="app-brand">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-md">
            <Compass className="animate-slow-spin text-amber-400" size={18} />
          </div>
          <div>
            <h1 className="font-sans font-bold text-slate-800 dark:text-slate-100 text-base leading-none tracking-tight">
              WeatherWave
            </h1>
            <span className="font-sans text-[10px] text-slate-400 font-medium">
              Acoustic Synoptic Dashboard
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3" id="header-controls">
          {/* Unit Toggle */}
          <button
            onClick={() => setIsCelsius(!isCelsius)}
            className="flex bg-slate-200/60 dark:bg-slate-900/60 border border-white/20 dark:border-slate-800/80 p-0.5 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
            id="unit-toggle"
            title="Toggle unit scale"
          >
            <span
              className={`px-2 py-1 rounded-md transition-all ${
                isCelsius
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              °C
            </span>
            <span
              className={`px-2 py-1 rounded-md transition-all ${
                !isCelsius
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              °F
            </span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-8 h-8 rounded-lg bg-white/15 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer transition-all"
            id="theme-toggle"
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Refresh Action */}
          <button
            onClick={() => loadWeather(activeLocation, true)}
            disabled={isRefreshing}
            className={`w-8 h-8 rounded-lg bg-white/15 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white cursor-pointer transition-all ${
              isRefreshing ? 'opacity-50' : ''
            }`}
            id="refresh-telemetry-btn"
            title="Refresh weather data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Search Module */}
        <div className="w-full max-w-2xl mx-auto md:mx-0">
          <LocationSearch
            onSelectLocation={(loc) => {
              setActiveLocation(loc);
              loadWeather(loc);
            }}
            activeLocation={activeLocation}
            savedLocations={savedLocations}
            onToggleSaveLocation={handleToggleSaveLocation}
          />
        </div>

        {/* Error notification banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3"
              id="error-banner"
            >
              <Info className="text-rose-500 shrink-0 mt-0.5" size={16} />
              <div>
                <h4 className="font-sans text-sm font-semibold text-rose-500">Connection Interrupted</h4>
                <p className="font-sans text-xs text-rose-400 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loader State */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3" id="loading-spinner">
            <RefreshCw size={40} className="animate-spin text-amber-500" />
            <div className="text-center">
              <h3 className="font-sans font-semibold text-slate-700 dark:text-slate-200">
                Calibrating Sensory Wave
              </h3>
              <p className="font-sans text-xs text-slate-400 mt-1">
                Fetching real-time atmospheric coordinates & synoptics...
              </p>
            </div>
          </div>
        ) : report ? (
          <div className="flex flex-col gap-6" id="dashboard-active-state">
            {/* Upper Section: Core weather and 7-day extended */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Primary Current Banner Panel (Left 7-columns) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-6 md:p-8 border border-white/85 dark:border-slate-800/80 shadow-sm flex flex-col justify-between relative overflow-hidden"
                  id="primary-current-banner"
                >
                  <div className="flex items-start justify-between" id="banner-header">
                    <div>
                      {/* Location details */}
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <MapPin size={14} className={theme.accentText} />
                        <span className="font-sans text-xs font-semibold uppercase tracking-wider">
                          {report.location.admin1 ? `${report.location.admin1}, ` : ''}
                          {report.location.country}
                        </span>
                      </div>
                      <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-slate-800 dark:text-white mt-1">
                        {report.location.name}
                      </h2>
                    </div>

                    {/* Quick active climate badge */}
                    <div className={`px-2.5 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 ${theme.badgeBg}`}>
                      <Sparkles size={12} className="animate-pulse" />
                      <span>Live Synoptics</span>
                    </div>
                  </div>

                  {/* Main Display: Temp & Big Icon */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 my-6 md:my-8" id="banner-body">
                    <div className="flex items-baseline">
                      <h3 className="font-mono text-7xl md:text-8xl font-light tracking-tighter text-slate-800 dark:text-white">
                        {Math.round(isCelsius ? report.current.temperature : (report.current.temperature * 9) / 5 + 32)}
                      </h3>
                      <span className="font-sans text-3xl md:text-4xl font-normal text-slate-400 dark:text-slate-500 ml-1">
                        °
                      </span>
                    </div>

                    <div className="flex sm:flex-col items-start gap-3">
                      <div className="p-3 bg-white/50 dark:bg-slate-950/40 rounded-2xl border border-white/40 dark:border-slate-800/40 shadow-xs">
                        <WeatherIcon code={report.current.weatherCode} isDay={report.current.isDay} size={48} />
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-lg md:text-xl text-slate-800 dark:text-white">
                          {getWeatherLabel(report.current.weatherCode)}
                        </h4>
                        <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
                          Apparent: {Math.round(isCelsius ? report.current.apparentTemperature : (report.current.apparentTemperature * 9) / 5 + 32)}°
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* High / Low limits for today */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-500/10 text-xs font-sans text-slate-500 dark:text-slate-400" id="banner-footer">
                    <div>
                      Today's Dispersion:{' '}
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {Math.round(isCelsius ? report.daily.tempMin[0] : (report.daily.tempMin[0] * 9) / 5 + 32)}°
                      </span>{' '}
                      to{' '}
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {Math.round(isCelsius ? report.daily.tempMax[0] : (report.daily.tempMax[0] * 9) / 5 + 32)}°
                      </span>
                    </div>
                    <div className="w-1 h-1 bg-slate-500/30 rounded-full" />
                    <div>
                      Wind: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{Math.round(report.current.windSpeed)} km/h</span>
                    </div>
                  </div>
                </motion.div>

                {/* 24h Hourly scrolling forecast ribbon */}
                <HourlyForecast hourlyData={report.hourly} isCelsius={isCelsius} />
              </div>

              {/* 7-Day Extended forecast (Right 5-columns) */}
              <div className="lg:col-span-5">
                <DailyForecast dailyData={report.daily} isCelsius={isCelsius} />
              </div>
            </div>

            {/* Middle Section: Elegant charts */}
            <WeatherCharts hourlyData={report.hourly} isCelsius={isCelsius} />

            {/* Bottom Section: Climate metrics bento grid */}
            <WeatherMetrics
              current={report.current}
              airQuality={report.airQuality}
              daily={report.daily}
              isCelsius={isCelsius}
            />
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-auto border-t border-slate-500/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="font-sans text-[10.5px] text-slate-400 dark:text-slate-500">
          Climate indices georeferenced from open-source registers. No API license required.
        </p>
        <div className="flex items-center gap-1.5 font-sans text-[10.5px] text-slate-400 dark:text-slate-500">
          <Info size={12} />
          <span>V1.0 - Purely client-side synoptics telemetry</span>
        </div>
      </footer>
    </div>
  );
}
