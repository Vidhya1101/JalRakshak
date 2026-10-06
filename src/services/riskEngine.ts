/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JALRAKSHAK RISK SCORING ENGINE (3 TIME DIMENSIONS)
 * -------------------------------------------------------------
 * Transparent Prototype Model for Jammu Smart City Hackathon.
 * 
 * CORE FORMULATION (100%):
 * 1. Historical Vulnerability (PAST)     : 25% (0.25)
 * 2. Current Rainfall Conditions (NOW)  : 20% (0.20)
 * 3. Forecast Rainfall (FUTURE)         : 25% (0.25)
 * 4. Drainage Bottleneck Risk           : 15% (0.15)
 * 5. Waste Hotspot Choke Risk           : 10% (0.10)
 * 6. Terrain & Slope Vulnerability       :  5% (0.05)
 * 
 * Disclaimer:
 * Prototype risk model — weights are illustrative and should be calibrated
 * using official historical data and sensor telemetry.
 */

import { LocationData, RiskLevel, RiskWeights, RainfallIntensity, MapTimeMode } from '../types';

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  historicalVulnerability: 0.25,
  currentRainfall: 0.20,
  forecastRainfall: 0.25,
  drainage: 0.15,
  waste: 0.10,
  terrain: 0.05,
};

/**
 * Calculates a 0-100 risk sub-score from precipitation in millimeters.
 * Scaled for Jammu catchment topography.
 */
export function calculateRainfallRiskFactor(rainfallMm: number): number {
  if (rainfallMm <= 0) return 5;
  if (rainfallMm <= 15) {
    // Light rain: 5 to 25
    return Math.round(5 + (rainfallMm / 15) * 20);
  } else if (rainfallMm <= 40) {
    // Moderate rain: 26 to 55
    return Math.round(25 + ((rainfallMm - 15) / 25) * 30);
  } else if (rainfallMm <= 75) {
    // Heavy rain: 56 to 85
    return Math.round(55 + ((rainfallMm - 40) / 35) * 30);
  } else {
    // Extreme / cloudburst warning: 86 to 100
    const score = 85 + ((rainfallMm - 75) / 45) * 15;
    return Math.min(100, Math.round(score));
  }
}

/**
 * Maps rainfall mm to qualitative intensity
 */
export function getRainfallIntensity(rainfallMm: number): RainfallIntensity {
  if (rainfallMm < 15) return 'LOW';
  if (rainfallMm < 45) return 'MODERATE';
  if (rainfallMm < 75) return 'HIGH';
  return 'EXTREME';
}

/**
 * Classifies a 0-100 score into standard municipal risk level
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score < 30) return 'LOW';
  if (score < 50) return 'MODERATE';
  if (score < 70) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Provides standard semantic colors strictly adhering to municipal guidelines:
 * Green (Low), Yellow (Moderate), Orange (High), Red (Critical)
 */
export function getRiskColor(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  hex: string;
  fillHex: string;
} {
  switch (level) {
    case 'LOW':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        text: 'text-emerald-700',
        border: 'border-emerald-500',
        hex: '#16a34a',
        fillHex: 'rgba(22, 163, 74, 0.35)',
      };
    case 'MODERATE':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        text: 'text-amber-700',
        border: 'border-amber-500',
        hex: '#ca8a04',
        fillHex: 'rgba(202, 138, 4, 0.4)',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-50 text-orange-800 border-orange-200',
        text: 'text-orange-700',
        border: 'border-orange-500',
        hex: '#ea580c',
        fillHex: 'rgba(234, 88, 12, 0.45)',
      };
    case 'CRITICAL':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        text: 'text-rose-700',
        border: 'border-rose-500',
        hex: '#dc2626',
        fillHex: 'rgba(220, 38, 38, 0.55)',
      };
  }
}

/**
 * Calculates the dynamic 3-dimensional flood risk for a location
 */
export function calculateLocationDynamicRisk(
  location: {
    historicalVulnerabilityScore: number;
    drainageRisk: number;
    wasteRisk: number;
    terrainRisk: number;
  },
  currentRainfallMm: number,
  forecastRainfallMm: number,
  weights: RiskWeights = DEFAULT_RISK_WEIGHTS
): {
  riskScore: number;
  riskLevel: RiskLevel;
  currentRainfallRisk: number;
  forecastRainfallRisk: number;
  pastRiskScore: number;
  nowRiskScore: number;
  forecastRiskScore: number;
} {
  const currentRainfallRisk = calculateRainfallRiskFactor(currentRainfallMm);
  const forecastRainfallRisk = calculateRainfallRiskFactor(forecastRainfallMm);

  // 1. COMBINED COMPOSITE PREDICTIVE RISK (All 3 time dimensions + static physical factors)
  const rawCombined =
    (location.historicalVulnerabilityScore * weights.historicalVulnerability) +
    (currentRainfallRisk * weights.currentRainfall) +
    (forecastRainfallRisk * weights.forecastRainfall) +
    (location.drainageRisk * weights.drainage) +
    (location.wasteRisk * weights.waste) +
    (location.terrainRisk * weights.terrain);

  const riskScore = Math.min(100, Math.max(0, Math.round(rawCombined)));
  const riskLevel = getRiskLevel(riskScore);

  // 2. PAST MODE RISK (Historical incident profile + structural drainage bottleneck)
  const rawPast =
    (location.historicalVulnerabilityScore * 0.60) +
    (location.drainageRisk * 0.25) +
    (location.wasteRisk * 0.15);
  const pastRiskScore = Math.min(100, Math.max(0, Math.round(rawPast)));

  // 3. NOW MODE RISK (Current rainfall + immediate drainage state + historical vulnerability)
  const rawNow =
    (currentRainfallRisk * 0.40) +
    (location.historicalVulnerabilityScore * 0.25) +
    (location.drainageRisk * 0.20) +
    (location.wasteRisk * 0.15);
  const nowRiskScore = Math.min(100, Math.max(0, Math.round(rawNow)));

  // 4. FORECAST MODE RISK (Upcoming 24h precipitation trajectory + historical vulnerability + drainage)
  const rawForecast =
    (forecastRainfallRisk * 0.45) +
    (location.historicalVulnerabilityScore * 0.25) +
    (location.drainageRisk * 0.20) +
    (location.wasteRisk * 0.10);
  const forecastRiskScore = Math.min(100, Math.max(0, Math.round(rawForecast)));

  return {
    riskScore,
    riskLevel,
    currentRainfallRisk,
    forecastRainfallRisk,
    pastRiskScore,
    nowRiskScore,
    forecastRiskScore,
  };
}

/**
 * Gets the active score and level for a given map mode: PAST, NOW, FORECAST, or COMBINED
 */
export function getScoreForMapMode(
  loc: LocationData,
  mode: MapTimeMode
): { score: number; level: RiskLevel } {
  switch (mode) {
    case 'PAST':
      return { score: loc.pastRiskScore, level: getRiskLevel(loc.pastRiskScore) };
    case 'NOW':
      return { score: loc.nowRiskScore, level: getRiskLevel(loc.nowRiskScore) };
    case 'FORECAST':
      return { score: loc.forecastRiskScore, level: getRiskLevel(loc.forecastRiskScore) };
    case 'COMBINED':
    default:
      return { score: loc.riskScore, level: loc.riskLevel };
  }
}

/**
 * Generates what-if simulation curve for a location across rainfall spectrum (10mm to 120mm)
 */
export function simulateRainfallCurve(
  location: LocationData,
  currentRainfallMm = 10,
  weights: RiskWeights = DEFAULT_RISK_WEIGHTS
) {
  const steps = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
  return steps.map((rain) => {
    const res = calculateLocationDynamicRisk(location, currentRainfallMm, rain, weights);
    return {
      rainfallMm: rain,
      rainfallRisk: res.forecastRainfallRisk,
      floodRiskScore: res.riskScore,
      riskLevel: res.riskLevel,
    };
  });
}
