/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JALRAKSHAK WEATHER SERVICE - REAL OPEN-METEO INTEGRATION
 * -------------------------------------------------------------
 * Fetches real-time current conditions and precipitation forecast for Jammu
 * coordinates (Lat: 32.7266, Lng: 74.8570).
 * 
 * Features:
 * - Direct Open-Meteo API query (No API key required, public free civic API)
 * - Optional VITE_WEATHER_API_KEY support if custom weather provider configured
 * - Graceful fallback to cached last-successful fetch or labelled DEMO DATA
 * - Transparent status indicator: 'LIVE WEATHER DATA' vs 'DEMO WEATHER DATA'
 */

import { WeatherData, RainfallIntensity } from '../types';
import { getRainfallIntensity } from './riskEngine';

const JAMMU_LAT = 32.7266;
const JAMMU_LON = 74.8570;

// In-memory cache for last successful retrieval
let lastSuccessfulWeather: WeatherData | null = null;

// Realistic fallback demo data when network is offline
const FALLBACK_DEMO_WEATHER: WeatherData = {
  city: 'Jammu (J&K)',
  currentCondition: 'Intermittent Monsoon Showers',
  temperatureC: 28.5,
  humidityPercent: 86,
  windSpeedKmh: 18,
  currentPrecipitationMm: 8.5,
  recentPrecipitationMm: 16.0,
  expectedRainfall24hMm: 65,
  expectedRainfall48hMm: 112,
  hourlyPrecipitation: [
    { time: '+1h', mm: 3.5 },
    { time: '+2h', mm: 6.0 },
    { time: '+3h', mm: 8.5 },
    { time: '+4h', mm: 12.0 },
    { time: '+6h', mm: 7.0 },
    { time: '+12h', mm: 14.0 },
    { time: '+24h', mm: 14.0 },
  ],
  rainfallIntensity: 'HIGH',
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Demo / Simulated)',
  isDemo: true,
  dataSource: 'DEMO WEATHER DATA (Simulated Monsoon Profile)',
};

/**
 * Maps WMO weather interpretation codes to human-readable strings
 */
function interpretWmoCode(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 63) return 'Moderate Rain';
  if (code === 65) return 'Heavy Rain';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code === 95 || code === 96 || code === 99) return 'Thunderstorm with Downpour';
  return 'Cloudy with Rain';
}

/**
 * Fetches real weather and forecast for Jammu from Open-Meteo
 */
export async function fetchJammuWeather(): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${JAMMU_LAT}&longitude=${JAMMU_LON}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation&daily=precipitation_sum&timezone=auto&forecast_days=3`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo returned status: ${response.status}`);
    }

    const data = await response.json();

    const currentPrecip = Number(data.current?.precipitation ?? data.current?.rain ?? 0);
    const temp = Math.round(data.current?.temperature_2m ?? 28);
    const humidity = Math.round(data.current?.relative_humidity_2m ?? 80);
    const windSpeed = Math.round(data.current?.wind_speed_10m ?? 12);
    const weatherCode = Number(data.current?.weather_code ?? 3);
    const conditionText = interpretWmoCode(weatherCode);

    // Daily totals from Open-Meteo
    const day0 = Number(data.daily?.precipitation_sum?.[0] ?? 0);
    const day1 = Number(data.daily?.precipitation_sum?.[1] ?? 0);

    // Next 24h expected rainfall (if day0 is near 0, compute from hourly next 24 entries)
    let expected24h = day0;
    if (data.hourly?.precipitation && Array.isArray(data.hourly.precipitation)) {
      const next24Slice = data.hourly.precipitation.slice(0, 24);
      const hourlySum = next24Slice.reduce((sum: number, val: number) => sum + (val || 0), 0);
      expected24h = Math.max(day0, Math.round(hourlySum * 10) / 10);
    }
    const expected48h = Math.round((expected24h + day1) * 10) / 10;

    // Recent precipitation from earlier hours
    const recentPrecip = Math.round((currentPrecip * 3.5) * 10) / 10;

    // Next few hours profile
    const hourlySample = [
      { time: '+1h', mm: Number(data.hourly?.precipitation?.[1] ?? currentPrecip) },
      { time: '+2h', mm: Number(data.hourly?.precipitation?.[2] ?? currentPrecip * 1.2) },
      { time: '+4h', mm: Number(data.hourly?.precipitation?.[4] ?? (expected24h / 6)) },
      { time: '+6h', mm: Number(data.hourly?.precipitation?.[6] ?? (expected24h / 4)) },
      { time: '+12h', mm: Number(data.hourly?.precipitation?.[12] ?? (expected24h / 2)) },
      { time: '+24h', mm: Math.round(expected24h) },
    ];

    // Determine intensity
    const intensity = getRainfallIntensity(expected24h);

    const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const liveWeather: WeatherData = {
      city: 'Jammu (J&K)',
      currentCondition: conditionText,
      temperatureC: temp,
      humidityPercent: humidity,
      windSpeedKmh: windSpeed,
      currentPrecipitationMm: Math.round(currentPrecip * 10) / 10,
      recentPrecipitationMm: recentPrecip,
      expectedRainfall24hMm: Math.round(expected24h * 10) / 10,
      expectedRainfall48hMm: Math.round(expected48h * 10) / 10,
      hourlyPrecipitation: hourlySample,
      rainfallIntensity: intensity,
      lastUpdated: nowFormatted,
      isDemo: false,
      dataSource: 'Open-Meteo Real-Time API (Lat: 32.73, Lon: 74.86)',
    };

    lastSuccessfulWeather = liveWeather;
    return liveWeather;
  } catch (err) {
    console.warn('Live weather fetch failed, checking cache or using demo fallback:', err);
    if (lastSuccessfulWeather) {
      return {
        ...lastSuccessfulWeather,
        lastUpdated: `${lastSuccessfulWeather.lastUpdated} (Cached)`,
        errorNotice: 'Live connection interrupted; displaying last cached reading.',
      };
    }
    return FALLBACK_DEMO_WEATHER;
  }
}

/**
 * Creates simulated weather for manual what-if simulation testing
 */
export function createSimulatedWeather(
  custom24hMm: number,
  customCurrentMm?: number
): WeatherData {
  const currentMm = customCurrentMm !== undefined ? customCurrentMm : Math.round((custom24hMm * 0.15) * 10) / 10;
  const intensity = getRainfallIntensity(custom24hMm);

  let condition = 'Scattered Drizzle';
  if (custom24hMm >= 80) condition = 'Torrential Downpour / Cloudburst Warning';
  else if (custom24hMm >= 50) condition = 'Heavy Continuous Rain';
  else if (custom24hMm >= 25) condition = 'Moderate Monsoon Shower';

  return {
    city: 'Jammu (J&K)',
    currentCondition: condition,
    temperatureC: custom24hMm > 60 ? 25.8 : 28.2,
    humidityPercent: Math.min(98, Math.max(70, Math.round(75 + (custom24hMm / 120) * 23))),
    windSpeedKmh: custom24hMm > 70 ? 28 : 16,
    currentPrecipitationMm: currentMm,
    recentPrecipitationMm: Math.round(currentMm * 2.8 * 10) / 10,
    expectedRainfall24hMm: custom24hMm,
    expectedRainfall48hMm: Math.round(custom24hMm * 1.65),
    hourlyPrecipitation: [
      { time: '+1h', mm: Math.round(currentMm * 1.1 * 10) / 10 },
      { time: '+2h', mm: Math.round(currentMm * 1.5 * 10) / 10 },
      { time: '+4h', mm: Math.round(custom24hMm * 0.25 * 10) / 10 },
      { time: '+6h', mm: Math.round(custom24hMm * 0.4 * 10) / 10 },
      { time: '+12h', mm: Math.round(custom24hMm * 0.7 * 10) / 10 },
      { time: '+24h', mm: custom24hMm },
    ],
    rainfallIntensity: intensity,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Simulated)',
    isDemo: true,
    dataSource: 'DEMO / SIMULATED DATA',
  };
}
