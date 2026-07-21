import React, { useMemo } from 'react';
import { HourlyForecastData } from '../types';
import { WeatherIcon } from './WeatherIcon';
import { CloudRain, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface HourlyForecastProps {
  hourlyData: HourlyForecastData;
  isCelsius: boolean;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourlyData, isCelsius }) => {
  const listData = useMemo(() => {
    const now = new Date();
    const currentHourStr = now.toISOString().substring(0, 13) + ':00';
    
    let startIndex = hourlyData.time.findIndex(t => t.startsWith(currentHourStr));
    if (startIndex === -1) startIndex = 0;

    const list = [];
    // Display next 24 hours
    const count = Math.min(24, hourlyData.time.length - startIndex);

    for (let i = 0; i < count; i++) {
      const idx = startIndex + i;
      const date = new Date(hourlyData.time[idx]);
      const isNow = i === 0;

      list.push({
        rawTime: hourlyData.time[idx],
        hourLabel: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        dateLabel: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        temperature: hourlyData.temperature[idx],
        weatherCode: hourlyData.weatherCode[idx],
        precipitationProb: hourlyData.precipitationProbability[idx],
        isNow,
      });
    }
    return list;
  }, [hourlyData]);

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-6 border border-white/85 dark:border-slate-800/80 shadow-sm animate-fade-in" id="hourly-forecast-container">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
          <Clock size={20} id="hourly-icon" />
        </div>
        <div>
          <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-100 text-lg">
            Chronological Flow
          </h3>
          <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
            Hourly progression & condition changes
          </p>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="overflow-x-auto scrollbar-hide flex gap-3 pb-2 pt-1 -mx-2 px-2" id="hourly-scroll-track">
        {listData.map((item, index) => {
          const displayTemp = isCelsius ? item.temperature : (item.temperature * 9) / 5 + 32;

          return (
            <motion.div
              key={item.rawTime}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
              className={`flex-shrink-0 w-24 py-4 px-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                item.isNow
                  ? 'bg-amber-500/20 dark:bg-amber-500/10 border-amber-500/40 shadow-md shadow-amber-500/5'
                  : 'bg-white/40 dark:bg-slate-900/40 border-white/20 dark:border-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-900/60'
              }`}
              id={`hourly-item-${index}`}
            >
              <span className={`font-mono text-xs font-semibold ${item.isNow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {item.isNow ? 'Now' : item.hourLabel}
              </span>
              
              <div className="my-3 flex justify-center" id={`hourly-icon-${index}`}>
                <WeatherIcon code={item.weatherCode} size={30} />
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <span className="font-sans text-sm font-bold text-slate-800 dark:text-slate-100">
                  {Math.round(displayTemp)}°
                </span>
                
                {/* Precipitation Probability indicator */}
                <div className="flex items-center gap-0.5 min-h-[14px]">
                  {item.precipitationProb > 0 ? (
                    <>
                      <CloudRain size={10} className="text-blue-400" id={`hourly-droplet-${index}`} />
                      <span className="font-mono text-[10px] font-medium text-blue-500 dark:text-blue-400">
                        {item.precipitationProb}%
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">-</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
