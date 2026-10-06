/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type RainfallIntensity = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';

export type MapTimeMode = 'PAST' | 'NOW' | 'FORECAST' | 'COMBINED';

export type IncidentType =
  | 'drainage blockage'
  | 'drain overflow'
  | 'waterlogging'
  | 'waste obstruction'
  | 'flooding'
  | 'construction debris obstruction';

export interface HistoricalIncident {
  id: string;
  locationId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  date: string;
  year: number;
  incidentType: IncidentType;
  severity: 'Moderate' | 'Severe' | 'Critical';
  cause: string;
  description: string;
  sourceStatus: 'Verified Municipal Record' | 'Citizen Report (Validated)' | 'DEMO / SIMULATED DATA';
  waterDepthCm?: number;
}

export interface LocationTimelineItem {
  period: string; // e.g. "2024", "2025", "2026", "TODAY", "NEXT 24 HOURS"
  title: string;
  detail: string;
  type: 'past' | 'present' | 'future';
  severity?: 'Moderate' | 'Severe' | 'Critical' | 'Nominal';
}

export interface LocationData {
  id: string;
  name: string;
  wardNumber: number;
  coordinates: [number, number]; // [lat, lng]
  elevationMeters: number;
  
  // Three-dimensional sub-factors (0 - 100)
  historicalVulnerabilityScore: number; // 25% weight
  currentRainfallRisk: number;          // 20% weight
  forecastRainfallRisk: number;         // 25% weight
  drainageRisk: number;                 // 15% weight
  wasteRisk: number;                    // 10% weight
  terrainRisk: number;                  // 5% weight

  // Measured precipitation inputs
  currentRainfallMm: number;
  forecastRainfallMm: number;
  
  // Composite calculated risk
  riskScore: number;
  riskLevel: RiskLevel;

  // Partial mode-specific risk scores
  pastRiskScore: number;
  nowRiskScore: number;
  forecastRiskScore: number;
  
  // Detailed civic factors
  culvertDescription: string;
  wasteHotspotsCount: number;
  drainCapacityStatus: 'Inadequate' | 'Moderately Constrained' | 'Severely Bottlenecked' | 'Optimal';
  
  // Persistent historical records
  historicalIncidents: HistoricalIncident[];
  timeline: LocationTimelineItem[];
  
  // Qualitative explanation
  whyAtRisk: string[];
  
  // Municipal actionable tasks
  recommendedActions: {
    id: string;
    action: string;
    department: 'JMC Drainage' | 'Sanitation Wing' | 'Emergency Quick Response' | 'Traffic Police';
    priority: 'Immediate' | 'Within 6 hrs' | 'Preventive Standby';
    completed?: boolean;
  }[];
}

export interface WeatherData {
  city: string;
  currentCondition: string;
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  currentPrecipitationMm: number;
  recentPrecipitationMm: number;
  expectedRainfall24hMm: number;
  expectedRainfall48hMm: number;
  hourlyPrecipitation?: { time: string; mm: number }[];
  rainfallIntensity: RainfallIntensity;
  lastUpdated: string;
  isDemo: boolean;
  dataSource: string;
  errorNotice?: string;
}

export interface RiskWeights {
  historicalVulnerability: number; // 0.25
  currentRainfall: number;          // 0.20
  forecastRainfall: number;         // 0.25
  drainage: number;                 // 0.15
  waste: number;                    // 0.10
  terrain: number;                  // 0.05
}

export interface MapLayerFilters {
  floodRisk: boolean;
  wasteHotspots: boolean;
  drainageRisk: boolean;
  historicalWaterlogging: boolean;
  rainfallIntensity: boolean;
}

export type ActivePage = 'landing' | 'dashboard' | 'risk-map' | 'locations' | 'simulator' | 'methodology';
