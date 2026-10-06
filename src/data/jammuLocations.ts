/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JALRAKSHAK MONITORED LOCATIONS DATASET - JAMMU URBAN AREA
 * -------------------------------------------------------------
 * Dynamic 3-Dimensional Integration:
 * 1. Persistent Historical Incidents (2024-2026)
 * 2. Current Conditions (Live API)
 * 3. Forecast Data (Next 24h & 48h)
 */

import { LocationData, LocationTimelineItem } from '../types';
import { calculateHistoricalVulnerability } from './jammuHistoricalIncidents';
import { calculateLocationDynamicRisk, getRiskLevel } from '../services/riskEngine';

interface RawLocationSpec {
  id: string;
  name: string;
  wardNumber: number;
  coordinates: [number, number];
  elevationMeters: number;
  drainageRisk: number;
  wasteRisk: number;
  terrainRisk: number;
  culvertDescription: string;
  wasteHotspotsCount: number;
  drainCapacityStatus: 'Inadequate' | 'Moderately Constrained' | 'Severely Bottlenecked' | 'Optimal';
  recommendedActions: LocationData['recommendedActions'];
}

const rawLocationsSpecs: RawLocationSpec[] = [
  {
    id: 'loc-chinor',
    name: 'Chinor',
    wardNumber: 38,
    coordinates: [32.7758, 74.8320],
    elevationMeters: 342,
    drainageRisk: 88,
    wasteRisk: 82,
    terrainRisk: 75,
    culvertDescription: 'Low-lying depression catchment receiving stormwater runoff from Shivalik foothill slopes; Ranbir Canal cross-drain culvert bottleneck.',
    wasteHotspotsCount: 6,
    drainCapacityStatus: 'Severely Bottlenecked',
    recommendedActions: [
      {
        id: 'act-c1',
        action: 'Deploy JMC hydraulic suction-jetting machine to Chinor culvert inlet',
        department: 'JMC Drainage',
        priority: 'Immediate',
        completed: false,
      },
      {
        id: 'act-c2',
        action: 'Clear municipal garbage accumulation at 3 upstream stormwater grates',
        department: 'Sanitation Wing',
        priority: 'Immediate',
        completed: false,
      },
      {
        id: 'act-c3',
        action: 'Stage portable 150 GPM de-watering diesel pump on standby',
        department: 'Emergency Quick Response',
        priority: 'Within 6 hrs',
        completed: false,
      },
      {
        id: 'act-c4',
        action: 'Issue low-lying commercial basements precautionary drainage notice',
        department: 'Emergency Quick Response',
        priority: 'Preventive Standby',
        completed: false,
      },
    ],
  },
  {
    id: 'loc-rajinder-nagar',
    name: 'Rajinder Nagar',
    wardNumber: 42,
    coordinates: [32.7489, 74.8450],
    elevationMeters: 335,
    drainageRisk: 86,
    wasteRisk: 78,
    terrainRisk: 70,
    culvertDescription: 'Dense residential neighborhood adjoining Bantalab arterial corridor; sub-surface brick masonry drain aging.',
    wasteHotspotsCount: 5,
    drainCapacityStatus: 'Severely Bottlenecked',
    recommendedActions: [
      {
        id: 'act-rn1',
        action: 'Inspect and desilt Sector 2 storm conduit interceptor screen',
        department: 'JMC Drainage',
        priority: 'Immediate',
        completed: false,
      },
      {
        id: 'act-rn2',
        action: 'Evacuate surface debris and plastic waste from 4 street catch basins',
        department: 'Sanitation Wing',
        priority: 'Immediate',
        completed: false,
      },
      {
        id: 'act-rn3',
        action: 'Position standby suction tanker for rapid road clearing',
        department: 'Emergency Quick Response',
        priority: 'Within 6 hrs',
        completed: false,
      },
    ],
  },
  {
    id: 'loc-muthi',
    name: 'Muthi',
    wardNumber: 36,
    coordinates: [32.7634, 74.8212],
    elevationMeters: 338,
    drainageRisk: 82,
    wasteRisk: 72,
    terrainRisk: 65,
    culvertDescription: 'Confluence point of agricultural canal runoff and newly urbanized residential lanes.',
    wasteHotspotsCount: 4,
    drainCapacityStatus: 'Inadequate',
    recommendedActions: [
      {
        id: 'act-m1',
        action: 'Clear vegetative debris and silt berms along Muthi main drain channel',
        department: 'JMC Drainage',
        priority: 'Immediate',
        completed: false,
      },
      {
        id: 'act-m2',
        action: 'Inspect canal sluice gate regulator and clear floating trash',
        department: 'JMC Drainage',
        priority: 'Within 6 hrs',
        completed: false,
      },
      {
        id: 'act-m3',
        action: 'Deploy emergency warning cones if ponding exceeds 10 cm',
        department: 'Traffic Police',
        priority: 'Preventive Standby',
        completed: false,
      },
    ],
  },
  {
    id: 'loc-patta-bohri',
    name: 'Patta Bohri',
    wardNumber: 40,
    coordinates: [32.7290, 74.8350],
    elevationMeters: 326,
    drainageRisk: 74,
    wasteRisk: 68,
    terrainRisk: 62,
    culvertDescription: 'Talab Tillo low-lying corridor; historic nallah receiving upstream urban stormwater.',
    wasteHotspotsCount: 5,
    drainCapacityStatus: 'Inadequate',
    recommendedActions: [
      {
        id: 'act-pb1',
        action: 'Clear municipal waste accumulation under Patta Bohri bridge culvert',
        department: 'Sanitation Wing',
        priority: 'Immediate',
        completed: false,
      },
      {
        id: 'act-pb2',
        action: 'Verify open drain freeboard and dredge sediment bank',
        department: 'JMC Drainage',
        priority: 'Within 6 hrs',
        completed: false,
      },
      {
        id: 'act-pb3',
        action: 'Alert Talab Tillo emergency dispatch post',
        department: 'Emergency Quick Response',
        priority: 'Preventive Standby',
        completed: false,
      },
    ],
  },
  {
    id: 'loc-jewel-chowk',
    name: 'Jewel Chowk (Canal Road)',
    wardNumber: 14,
    coordinates: [32.7198, 74.8572],
    elevationMeters: 328,
    drainageRisk: 76,
    wasteRisk: 66,
    terrainRisk: 55,
    culvertDescription: 'Critical Jammu transit hub adjacent to Ranbir Canal headworks; high impervious pavement ratio.',
    wasteHotspotsCount: 3,
    drainCapacityStatus: 'Inadequate',
    recommendedActions: [
      {
        id: 'act-jc1',
        action: 'Station mobile emergency de-watering pump unit at Jewel Chowk underpass',
        department: 'Emergency Quick Response',
        priority: 'Immediate',
        completed: false,
      },
      {
        id: 'act-jc2',
        action: 'Inspect canal side-weir overflow bypass gate',
        department: 'JMC Drainage',
        priority: 'Within 6 hrs',
        completed: false,
      },
      {
        id: 'act-jc3',
        action: 'Coordinate traffic diversion protocol if water crosses 10 cm curb level',
        department: 'Traffic Police',
        priority: 'Immediate',
        completed: false,
      },
    ],
  },
  {
    id: 'loc-bantalab',
    name: 'Bantalab',
    wardNumber: 62,
    coordinates: [32.7885, 74.8190],
    elevationMeters: 360,
    drainageRisk: 65,
    wasteRisk: 58,
    terrainRisk: 52,
    culvertDescription: 'Rapidly urbanizing peri-urban sector with incomplete underground stormwater conduits.',
    wasteHotspotsCount: 3,
    drainCapacityStatus: 'Inadequate',
    recommendedActions: [
      {
        id: 'act-b1',
        action: 'Install wire mesh silt-traps upstream of primary culvert',
        department: 'JMC Drainage',
        priority: 'Within 6 hrs',
        completed: false,
      },
      {
        id: 'act-b2',
        action: 'Remove dumping heaps near Bantalab market crossing',
        department: 'Sanitation Wing',
        priority: 'Within 6 hrs',
        completed: false,
      },
    ],
  },
  {
    id: 'loc-lakhdata-bazar',
    name: 'Lakhdata Bazar',
    wardNumber: 10,
    coordinates: [32.7275, 74.8715],
    elevationMeters: 345,
    drainageRisk: 60,
    wasteRisk: 65,
    terrainRisk: 45,
    culvertDescription: 'Historic old Jammu city market with steep gradient streets discharging into older vaulted stone sewers.',
    wasteHotspotsCount: 4,
    drainCapacityStatus: 'Moderately Constrained',
    recommendedActions: [
      {
        id: 'act-lb1',
        action: 'Execute high-pressure water jetting through heritage brick sewers',
        department: 'JMC Drainage',
        priority: 'Immediate',
        completed: false,
      },
      {
        id: 'act-lb2',
        action: 'Intensive waste clearance around retail market trash bins',
        department: 'Sanitation Wing',
        priority: 'Immediate',
        completed: false,
      },
    ],
  },
  {
    id: 'loc-bathindi',
    name: 'Bathindi',
    wardNumber: 52,
    coordinates: [32.6890, 74.8980],
    elevationMeters: 350,
    drainageRisk: 54,
    wasteRisk: 50,
    terrainRisk: 48,
    culvertDescription: 'Hilly terraced topography draining towards natural nallah gorge; localized valley bottlenecks.',
    wasteHotspotsCount: 2,
    drainCapacityStatus: 'Moderately Constrained',
    recommendedActions: [
      {
        id: 'act-bat1',
        action: 'Inspect valley nallah exit throat and remove fallen timber / debris',
        department: 'JMC Drainage',
        priority: 'Within 6 hrs',
        completed: false,
      },
      {
        id: 'act-bat2',
        action: 'Clear municipal waste bins along Bathindi main boulevard',
        department: 'Sanitation Wing',
        priority: 'Preventive Standby',
        completed: false,
      },
    ],
  },
  {
    id: 'loc-sunjwan',
    name: 'Sunjwan',
    wardNumber: 54,
    coordinates: [32.6840, 74.9150],
    elevationMeters: 340,
    drainageRisk: 50,
    wasteRisk: 46,
    terrainRisk: 42,
    culvertDescription: 'Low gradient runoff towards southern drainage perimeter.',
    wasteHotspotsCount: 2,
    drainCapacityStatus: 'Moderately Constrained',
    recommendedActions: [
      {
        id: 'act-s1',
        action: 'Verify bridge culvert opening is clear of sand bags and scrap',
        department: 'JMC Drainage',
        priority: 'Within 6 hrs',
        completed: false,
      },
    ],
  },
  {
    id: 'loc-gandhi-nagar',
    name: 'Gandhi Nagar (Gole Market)',
    wardNumber: 20,
    coordinates: [32.7095, 74.8690],
    elevationMeters: 330,
    drainageRisk: 38,
    wasteRisk: 34,
    terrainRisk: 26,
    culvertDescription: 'Planned urban residential and commercial sector with structured underground storm network.',
    wasteHotspotsCount: 1,
    drainCapacityStatus: 'Optimal',
    recommendedActions: [
      {
        id: 'act-gn1',
        action: 'Routine pre-monsoon curb inlet sweep around Gole Market perimeter',
        department: 'Sanitation Wing',
        priority: 'Preventive Standby',
        completed: false,
      },
    ],
  },
];

/**
 * Builds the dynamic 3-dimensional location records combining:
 * 1. Persistent Historical Incidents (2024-2026)
 * 2. Current precipitation
 * 3. Forecast 24h precipitation
 */
export function buildJammuLocations(
  currentRainfallMm: number,
  forecastRainfallMm: number
): LocationData[] {
  return rawLocationsSpecs.map((raw) => {
    // 1. Calculate persistent historical vulnerability
    const hist = calculateHistoricalVulnerability(raw.id);

    // 2. Compute dynamic risk scores across all modes
    const risk = calculateLocationDynamicRisk(
      {
        historicalVulnerabilityScore: hist.score,
        drainageRisk: raw.drainageRisk,
        wasteRisk: raw.wasteRisk,
        terrainRisk: raw.terrainRisk,
      },
      currentRainfallMm,
      forecastRainfallMm
    );

    // 3. Assemble chronological timeline (PAST 2024, 2025, 2026 -> TODAY -> NEXT 24 HOURS)
    const timelineItems: LocationTimelineItem[] = [];

    // Historical entries sorted by year/date
    hist.incidents
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((inc) => {
        timelineItems.push({
          period: String(inc.year),
          title: `${inc.incidentType.toUpperCase()} INCIDENT`,
          detail: `${inc.description} (${inc.cause})`,
          type: 'past',
          severity: inc.severity,
        });
      });

    // Present entry
    timelineItems.push({
      period: 'TODAY',
      title: 'Current Atmospheric Conditions',
      detail: currentRainfallMm > 0
        ? `Active rainfall: ${currentRainfallMm} mm recorded. Immediate surface runoff factor: ${risk.currentRainfallRisk}/100.`
        : 'Dry surface condition right now. Catchment dry before incoming storm front.',
      type: 'present',
      severity: currentRainfallMm >= 15 ? 'Severe' : currentRainfallMm > 0 ? 'Moderate' : 'Nominal',
    });

    // Future entry
    timelineItems.push({
      period: 'NEXT 24 HOURS',
      title: 'Incoming Precipitation Forecast',
      detail: `Projected precipitation: ${forecastRainfallMm} mm. Predicted flood factor: ${risk.forecastRainfallRisk}/100.`,
      type: 'future',
      severity: forecastRainfallMm >= 50 ? 'Critical' : forecastRainfallMm >= 25 ? 'Severe' : 'Moderate',
    });

    // 4. Generate dynamic explanation bullets grounded in actual values
    const whyAtRisk = [
      `Historical Vulnerability (${hist.score}/100): ${hist.incidents.length} documented incidents recorded in 2024–2026 civic records`,
      `Current Rainfall (${currentRainfallMm} mm): Immediate ground moisture & active conduit inflow index ${risk.currentRainfallRisk}/100`,
      `Upcoming 24h Forecast (${forecastRainfallMm} mm): Projected storm runoff loading index ${risk.forecastRainfallRisk}/100`,
      `Drainage Vulnerability (${raw.drainageRisk}/100): ${raw.drainCapacityStatus} (${raw.culvertDescription})`,
      `Waste Hotspots (${raw.wasteRisk}/100): ${raw.wasteHotspotsCount} surface dumping points impeding stormwater grates`,
      `Elevation Slope (${raw.terrainRisk}/100): Catchment elevation ${raw.elevationMeters}m with natural bowl pooling`,
    ];

    return {
      id: raw.id,
      name: raw.name,
      wardNumber: raw.wardNumber,
      coordinates: raw.coordinates,
      elevationMeters: raw.elevationMeters,
      historicalVulnerabilityScore: hist.score,
      currentRainfallRisk: risk.currentRainfallRisk,
      forecastRainfallRisk: risk.forecastRainfallRisk,
      drainageRisk: raw.drainageRisk,
      wasteRisk: raw.wasteRisk,
      terrainRisk: raw.terrainRisk,
      currentRainfallMm,
      forecastRainfallMm,
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      pastRiskScore: risk.pastRiskScore,
      nowRiskScore: risk.nowRiskScore,
      forecastRiskScore: risk.forecastRiskScore,
      culvertDescription: raw.culvertDescription,
      wasteHotspotsCount: raw.wasteHotspotsCount,
      drainCapacityStatus: raw.drainCapacityStatus,
      historicalIncidents: hist.incidents,
      timeline: timelineItems,
      whyAtRisk,
      recommendedActions: raw.recommendedActions,
    };
  });
}

export function getInitialJammuLocations(
  currentRainfallMm = 8.5,
  forecastRainfallMm = 65
): LocationData[] {
  return buildJammuLocations(currentRainfallMm, forecastRainfallMm);
}
