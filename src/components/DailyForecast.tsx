import React, { useMemo } from 'react';
import { DailyForecastData } from '../types';
import { WeatherIcon, getWeatherLabel } from './WeatherIcon';
import { Calendar, CloudRain } from 'lucide-react';
import { motion } from 'motion/react';

interface DailyForecastProps {
  dailyData: DailyForecastData;
  isCelsius: boolean;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ dailyData, isCelsius }) => {
  const days = useMemo(() => {
    return dailyData.time.map((t, idx) => {
      const date = new Date(t);
      const isToday = idx === 0;

      // Get short day name (e.g., "Mon") or "Today"
      const dayLabel = isToday
        ? 'Today'
        : date.toLocaleDateString([], { weekday: 'short' });

      const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

      return {
        idx,
        rawTime: t,
        dayLabel,
        dateLabel,
        weatherCode: dailyData.weatherCode[idx],
        tempMax: dailyData.tempMax[idx],
        tempMin: dailyData.tempMin[idx],
        precipProb: dailyData.precipitationProbability[idx],
      };
    });
  }, [dailyData]);

  // Calculate global min and max over the week for the visual thermometer bars
  const { globalMin, globalMax } = useMemo(() => {
    const mins = dailyData.tempMin;
    const maxes = dailyData.tempMax;
    return {
      globalMin: Math.min(...mins),
      globalMax: Math.max(...maxes),
    };
  }, [dailyData]);

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-6 border border-white/85 dark:border-slate-800/80 shadow-sm flex flex-col h-full animate-fade-in" id="daily-forecast-container">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
          <Calendar size={20} id="daily-icon-calendar" />
        </div>
        <div>
          <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-100 text-lg">
            7-Day Synoptic Cycle
          </h3>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
            Extended forecast & temperature dispersion
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1 justify-between" id="daily-days-list">
        {days.map((day, index) => {
          const displayMax = Math.round(isCelsius ? day.tempMax : (day.tempMax * 9) / 5 + 32);
          const displayMin = Math.round(isCelsius ? day.tempMin : (day.tempMin * 9) / 5 + 32);

          // For the bar representation, we map min/max to percentages
          const rangeTotal = globalMax - globalMin || 1;
          const leftPercent = ((day.tempMin - globalMin) / rangeTotal) * 100;
          const widthPercent = ((day.tempMax - day.tempMin) / rangeTotal) * 100;

          return (
            <motion.div
              key={day.rawTime}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className="grid grid-cols-12 items-center gap-3 py-1 border-b border-slate-500/10 last:border-0 pb-3 last:pb-0"
              id={`daily-day-row-${index}`}
            >
              {/* Day title & date */}
              <div className="col-span-3 flex flex-col justify-center">
                <span className="font-sans text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {day.dayLabel}
                </span>
                <span className="font-sans text-[10px] text-slate-400 dark:text-slate-500">
                  {day.dateLabel}
                </span>
              </div>

              {/* Weather condition icon & label */}
              <div className="col-span-4 flex items-center gap-2">
                <div id={`daily-icon-${index}`}>
                  <WeatherIcon code={day.weatherCode} size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                    {getWeatherLabel(day.weatherCode)}
                  </span>
                  {day.precipProb > 10 && (
                    <div className="flex items-center gap-0.5">
                      <CloudRain size={10} className="text-blue-400" id={`daily-precip-icon-${index}`} />
                      <span className="font-mono text-[9px] font-semibold text-blue-500 dark:text-blue-400">
                        {day.precipProb}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Temperature extremes & relative slider bar */}
              <div className="col-span-5 flex items-center gap-3">
                <span className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400 w-7 text-right">
                  {displayMin}°
                </span>

                {/* iOS-style visual temperature spread bar */}
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-950/60 rounded-full relative overflow-hidden" id={`daily-spread-bg-${index}`}>
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 via-amber-400 to-orange-400 opacity-80"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${Math.max(widthPercent, 5)}%`,
                    }}
                    id={`daily-spread-bar-${index}`}
                  />
                </div>

                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 w-7">
                  {displayMax}°
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
