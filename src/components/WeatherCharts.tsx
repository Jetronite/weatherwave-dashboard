import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { HourlyForecastData } from '../types';
import { Thermometer, CloudRain, Wind, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface WeatherChartsProps {
  hourlyData: HourlyForecastData;
  isCelsius: boolean;
}

type ChartMetric = 'temperature' | 'precipitation' | 'wind';

export const WeatherCharts: React.FC<WeatherChartsProps> = ({ hourlyData, isCelsius }) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('temperature');

  // Slice the next 24 hours starting from current hour
  const chartData = useMemo(() => {
    const now = new Date();
    const currentHourStr = now.toISOString().substring(0, 13) + ':00';
    
    // Find index in hourlyData.time closest to current hour
    let startIndex = hourlyData.time.findIndex(t => t.startsWith(currentHourStr));
    if (startIndex === -1) startIndex = 0; // fallback to start

    // Take next 24 data points
    const slicedData = [];
    const count = Math.min(24, hourlyData.time.length - startIndex);

    for (let i = 0; i < count; i++) {
      const idx = startIndex + i;
      const date = new Date(hourlyData.time[idx]);
      const hourLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      const tempVal = hourlyData.temperature[idx];
      const displayTemp = isCelsius ? tempVal : (tempVal * 9) / 5 + 32;

      slicedData.push({
        time: hourLabel,
        rawTime: hourlyData.time[idx],
        temperature: Math.round(displayTemp),
        precipitation: hourlyData.precipitationProbability[idx],
        wind: Math.round(hourlyData.windSpeed[idx]),
      });
    }
    return slicedData;
  }, [hourlyData, isCelsius]);

  const metricConfig = {
    temperature: {
      label: 'Temperature',
      unit: isCelsius ? '°C' : '°F',
      color: '#f59e0b', // Amber
      gradientId: 'tempGradient',
      icon: Thermometer,
    },
    precipitation: {
      label: 'Rain Probability',
      unit: '%',
      color: '#3b82f6', // Blue
      gradientId: 'rainGradient',
      icon: CloudRain,
    },
    wind: {
      label: 'Wind Speed',
      unit: ' km/h',
      color: '#10b981', // Emerald
      gradientId: 'windGradient',
      icon: Wind,
    },
  };

  const currentConf = metricConfig[activeMetric];

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[32px] p-6 border border-white/85 dark:border-slate-800/80 shadow-sm animate-fade-in" id="weather-charts-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
            <TrendingUp size={20} id="charts-icon-trend" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-slate-800 dark:text-slate-100 text-lg">
              Dynamic Oscillations
            </h3>
            <p className="font-sans text-xs text-slate-500 dark:text-slate-400">
              Interactive forecast metrics over the next 24 hours
            </p>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex bg-slate-200/50 dark:bg-slate-950/40 p-1 rounded-xl self-start md:self-auto" id="charts-tab-selector">
          {(['temperature', 'precipitation', 'wind'] as ChartMetric[]).map((metric) => {
            const Icon = metricConfig[metric].icon;
            const isSelected = activeMetric === metric;
            return (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer z-10 ${
                  isSelected
                    ? 'text-slate-800 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                id={`chart-btn-${metric}`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeChartTab"
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={14} id={`chart-icon-${metric}`} />
                <span>{metricConfig[metric].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full" id="weather-chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={currentConf.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConf.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={currentConf.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(148, 163, 184, 0.15)"
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              dx={-5}
              domain={activeMetric === 'precipitation' ? [0, 100] : ['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md border border-slate-800/80 px-3 py-2 rounded-xl shadow-xl">
                      <p className="font-sans text-xs text-slate-400 font-medium mb-1">
                        Time: {payload[0].payload.time}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: currentConf.color }}
                        />
                        <p className="font-mono text-sm text-slate-100 font-semibold">
                          {payload[0].value}
                          {currentConf.unit}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={currentConf.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${currentConf.gradientId})`}
              id={`area-${activeMetric}`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
