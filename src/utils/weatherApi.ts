import { WeatherReport, GeoLocation, CurrentWeatherData, HourlyForecastData, DailyForecastData, AirQualityData } from '../types';

export const DEFAULT_LOCATION: GeoLocation = {
  id: 2643743,
  name: 'London',
  latitude: 51.50853,
  longitude: -0.12574,
  country_code: 'GB',
  admin1: 'England',
  country: 'United Kingdom',
};

export async function searchLocations(query: string): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query
      )}&count=10&language=en&format=json`
    );
    if (!res.ok) throw new Error('Geocoding fetch failed');
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Error searching locations:', err);
    return [];
  }
}

export async function fetchWeatherReport(location: GeoLocation): Promise<WeatherReport> {
  const { latitude, longitude } = location;

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,uv_index,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;

  const [weatherRes, aqRes] = await Promise.all([
    fetch(weatherUrl),
    fetch(aqUrl),
  ]);

  if (!weatherRes.ok) throw new Error('Failed to fetch weather forecast');
  if (!aqRes.ok) throw new Error('Failed to fetch air quality measurements');

  const weatherData = await weatherRes.json();
  const aqData = await aqRes.json();

  const current: CurrentWeatherData = {
    temperature: weatherData.current.temperature_2m,
    humidity: weatherData.current.relative_humidity_2m,
    apparentTemperature: weatherData.current.apparent_temperature,
    isDay: weatherData.current.is_day === 1,
    precipitation: weatherData.current.precipitation,
    rain: weatherData.current.rain,
    showers: weatherData.current.showers,
    snowfall: weatherData.current.snowfall,
    weatherCode: weatherData.current.weather_code,
    cloudCover: weatherData.current.cloud_cover,
    pressure: weatherData.current.pressure_msl,
    windSpeed: weatherData.current.wind_speed_10m,
    windDirection: weatherData.current.wind_direction_10m,
  };

  const hourly: HourlyForecastData = {
    time: weatherData.hourly.time,
    temperature: weatherData.hourly.temperature_2m,
    humidity: weatherData.hourly.relative_humidity_2m,
    apparentTemperature: weatherData.hourly.apparent_temperature,
    precipitationProbability: weatherData.hourly.precipitation_probability,
    precipitation: weatherData.hourly.precipitation,
    weatherCode: weatherData.hourly.weather_code,
    uvIndex: weatherData.hourly.uv_index,
    windSpeed: weatherData.hourly.wind_speed_10m,
  };

  const daily: DailyForecastData = {
    time: weatherData.daily.time,
    weatherCode: weatherData.daily.weather_code,
    tempMax: weatherData.daily.temperature_2m_max,
    tempMin: weatherData.daily.temperature_2m_min,
    apparentTempMax: weatherData.daily.apparent_temperature_max,
    apparentTempMin: weatherData.daily.apparent_temperature_min,
    sunrise: weatherData.daily.sunrise,
    sunset: weatherData.daily.sunset,
    uvIndexMax: weatherData.daily.uv_index_max,
    precipitationSum: weatherData.daily.precipitation_sum,
    precipitationProbability: weatherData.daily.precipitation_probability_max,
    windSpeedMax: weatherData.daily.wind_speed_10m_max,
  };

  const airQuality: AirQualityData = {
    aqi: aqData.current.us_aqi || 0,
    pm2_5: aqData.current.pm2_5 || 0,
    pm10: aqData.current.pm10 || 0,
    co: aqData.current.carbon_monoxide || 0,
    no2: aqData.current.nitrogen_dioxide || 0,
    so2: aqData.current.sulphur_dioxide || 0,
    o3: aqData.current.ozone || 0,
  };

  return {
    location,
    current,
    hourly,
    daily,
    airQuality,
  };
}

export function getWeatherCondition(code: number, isDay: boolean = true) {
  // Return key condition mappings
  if (code === 0) {
    return isDay ? 'sunny' : 'clear-night';
  } else if ([1, 2, 3].includes(code)) {
    return isDay ? 'partly-cloudy' : 'cloudy-night';
  } else if ([45, 48].includes(code)) {
    return 'foggy';
  } else if ([51, 53, 55, 56, 57].includes(code)) {
    return 'drizzle';
  } else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return 'rainy';
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return 'snowy';
  } else if ([95, 96, 99].includes(code)) {
    return 'thunderstorm';
  }
  return 'sunny';
}
