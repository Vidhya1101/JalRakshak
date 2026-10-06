/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LocationData, WeatherData, MapLayerFilters, ActivePage, MapTimeMode } from '../types';
import { LeafletMap } from './LeafletMap';
import { getRiskColor } from '../services/riskEngine';
import { RefreshCw, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface DashboardViewProps {
  locations: LocationData[];
  weather: WeatherData;
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
  layers: MapLayerFilters;
  onToggleLayer: (layerKey: keyof MapLayerFilters) => void;
  mapTimeMode: MapTimeMode;
  onTimeModeChange: (mode: MapTimeMode) => void;
  onRefreshWeather: () => void;
  isRefreshing: boolean;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
  onNavigate: (page: ActivePage) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  locations,
  weather,
  selectedLocation,
  onSelectLocation,
  layers,
  onToggleLayer,
  mapTimeMode,
  onTimeModeChange,
  onRefreshWeather,
  isRefreshing,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  onNavigate,
}) => {
  // Active tab inside the location detail panel
  const [activeDetailTab, setActiveDetailTab] = useState<'historical' | 'current' | 'forecast' | 'action'>('historical');

  // Load more states
  const [expandedHistoricalCount, setExpandedHistoricalCount] = useState<number>(5);
  const [expandedLocationsCount, setExpandedLocationsCount] = useState<number>(6);
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null);

  // Selected location fallback to top critical location
  const currentLoc = selectedLocation || locations[0];
  const locColors = getRiskColor(currentLoc.riskLevel);

  // City-wide summary
  const sortedLocations = [...locations].sort((a, b) => b.riskScore - a.riskScore);
  const criticalCount = locations.filter((l) => l.riskLevel === 'CRITICAL').length;
  const highCount = locations.filter((l) => l.riskLevel === 'HIGH').length;
  const avgScore = Math.round(
    locations.reduce((acc, l) => acc + l.riskScore, 0) / locations.length
  );
  const cityRiskLevel = avgScore >= 70 ? 'CRITICAL' : avgScore >= 50 ? 'HIGH' : avgScore >= 30 ? 'MODERATE' : 'LOW';
  const cityRiskColors = getRiskColor(cityRiskLevel);

  // Historical incidents for the selected location
  const histIncidents = currentLoc.historicalIncidents;
  const visibleIncidents = histIncidents.slice(0, expandedHistoricalCount);

  // Visible locations in ranking table
  const visibleLocations = sortedLocations.slice(0, expandedLocationsCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. TOP SECTION: CLEAN COMPACT STATS & LIVE REFRESH BAR (NO CARD MUGGING) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {/* Header row: Live status and refresh control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
              Jammu Smart Flood Risk Intelligence
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              City Flood Risk Command
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Live Data Indicator */}
            <div className="text-left sm:text-right">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${weather.isDemo ? 'bg-amber-500' : 'bg-emerald-600 animate-pulse'}`}></span>
                <span className="text-sm font-bold text-slate-900">
                  {weather.isDemo ? 'DEMO DATA' : 'LIVE DATA'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRefreshing ? 'Updating Jammu risk data...' : `Last updated: ${weather.lastUpdated}`}
              </p>
            </div>

            {/* Auto-Refresh subtle indicator */}
            <button
              onClick={onToggleAutoRefresh}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer ${
                autoRefreshEnabled
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
              }`}
              title="Polls Open-Meteo every 15 minutes"
            >
              Auto-refresh: {autoRefreshEnabled ? 'ON' : 'OFF'}
            </button>

            {/* Refresh Data button */}
            <button
              onClick={onRefreshWeather}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Updating...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {/* Unified Statistics Grid (Using Clean Dividers instead of 5 separate cards) */}
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-200 pt-5 text-left">
          {/* Current City Risk */}
          <div className="pr-4 py-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Current City Risk
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl font-black ${cityRiskColors.text}`}>
                {cityRiskLevel}
              </span>
              <span className="text-sm font-mono font-bold text-slate-600">
                ({avgScore}/100)
              </span>
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">Synthesized Risk</span>
          </div>

          {/* Current Rainfall */}
          <div className="px-0 md:px-4 py-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Current Rainfall
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black font-mono text-blue-700 tabular-nums">
                {weather.currentPrecipitationMm}
              </span>
              <span className="text-sm font-bold text-slate-700">mm</span>
            </div>
            <span className="text-xs text-blue-800 font-semibold mt-0.5 block">
              {weather.rainfallIntensity} Intensity
            </span>
          </div>

          {/* Next 24h Rainfall */}
          <div className="px-0 md:px-4 py-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Next 24h Forecast
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black font-mono text-blue-900 tabular-nums">
                {weather.expectedRainfall24hMm}
              </span>
              <span className="text-sm font-bold text-slate-700">mm</span>
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              48h: {weather.expectedRainfall48hMm} mm
            </span>
          </div>

          {/* High-Risk Locations */}
          <div className="px-0 md:px-4 py-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              High-Risk Zones
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black font-mono text-orange-600 tabular-nums">
                {highCount}
              </span>
              <span className="text-sm font-medium text-slate-600">zones</span>
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">Desilting alerted</span>
          </div>

          {/* Critical Locations */}
          <div className="pl-0 md:pl-4 py-2">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">
              Critical Locations
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black font-mono text-rose-600 tabular-nums animate-pulse">
                {criticalCount}
              </span>
              <span className="text-sm font-bold text-rose-800">locations</span>
            </div>
            <span className="text-xs text-rose-700 font-medium mt-0.5 block">
              Standby pumps staged
            </span>
          </div>
        </div>
      </section>

      {/* 2. WEATHER FLOOD IMPACT COMPONENT */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-cyan-900 uppercase tracking-wider">
                Weather Impact on Flood Risk
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-600">Jammu (Lat: 32.73, Lon: 74.86)</span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
              Current precipitation is <span className="font-bold text-blue-700">{weather.currentPrecipitationMm} mm</span>, with <span className="font-bold text-blue-900">{weather.expectedRainfall24hMm} mm</span> expected in the next 24 hours ({weather.rainfallIntensity} intensity).
            </p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 shrink-0 max-w-md">
            <strong className="text-cyan-900 uppercase tracking-wide block text-xs mb-0.5">
              Impact on Flood Risk:
            </strong>
            {weather.expectedRainfall24hMm >= 50
              ? 'Forecast rainfall is significantly increasing the flood risk in historically vulnerable drainage locations (Chinor, Muthi, Rajinder Nagar).'
              : weather.expectedRainfall24hMm >= 25
              ? 'Moderate rainfall trajectory requires proactive drain screen sweeps before peak precipitation.'
              : 'Light precipitation conditions; baseline risk remains anchored by historical culvert constraints.'}
          </div>
        </div>
      </section>

      {/* 3. HERO MAP COMPONENT (DOMINANT VISUAL COMPONENT) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Map Header and Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Jammu Flood Risk Map
            </h2>
            <p className="text-sm text-slate-500">
              Interactive municipal GIS: click any location to inspect the 3-dimensional risk breakdown and preventive checklist below.
            </p>
          </div>

          {/* Time Dimension Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(['COMBINED', 'PAST', 'NOW', 'FORECAST'] as const).map((mode) => {
              const isActive = mapTimeMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => onTimeModeChange(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {mode === 'COMBINED' ? 'Combined Risk' : mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* GIS Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mr-1">
            Map Layers:
          </span>
          <button
            onClick={() => onToggleLayer('floodRisk')}
            className={`px-3 py-1 rounded-md border font-semibold transition-colors cursor-pointer ${
              layers.floodRisk ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Flood Risk {layers.floodRisk ? '✓' : ''}
          </button>
          <button
            onClick={() => onToggleLayer('wasteHotspots')}
            className={`px-3 py-1 rounded-md border font-semibold transition-colors cursor-pointer ${
              layers.wasteHotspots ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Waste Hotspots {layers.wasteHotspots ? '✓' : ''}
          </button>
          <button
            onClick={() => onToggleLayer('drainageRisk')}
            className={`px-3 py-1 rounded-md border font-semibold transition-colors cursor-pointer ${
              layers.drainageRisk ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Drainage Bottlenecks {layers.drainageRisk ? '✓' : ''}
          </button>
          <button
            onClick={() => onToggleLayer('historicalWaterlogging')}
            className={`px-3 py-1 rounded-md border font-semibold transition-colors cursor-pointer ${
              layers.historicalWaterlogging ? 'bg-cyan-800 text-white border-cyan-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Historical Incidents (2024–2026) {layers.historicalWaterlogging ? '✓' : ''}
          </button>
        </div>

        {/* The Leaflet Map with generous height */}
        <LeafletMap
          locations={locations}
          selectedLocation={currentLoc}
          onSelectLocation={onSelectLocation}
          layers={layers}
          timeMode={mapTimeMode}
          onTimeModeChange={onTimeModeChange}
          heightClass="h-[520px] sm:h-[580px]"
        />
      </section>

      {/* 4. SELECTED LOCATION ANALYSIS PANEL (WITH TABS & CLEAN PROGRESS BARS) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span>Selected Location Analysis</span>
              <span>·</span>
              <span>Ward {currentLoc.wardNumber}</span>
              <span>·</span>
              <span>Elevation {currentLoc.elevationMeters}m</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {currentLoc.name}
            </h2>
          </div>

          {/* Current Predicted Risk Score */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Current Predicted Risk
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl sm:text-4xl font-black font-mono tabular-nums ${locColors.text}`}>
                  {currentLoc.riskScore}
                  <span className="text-base font-medium text-slate-500"> / 100</span>
                </span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase border ${locColors.bg} ${locColors.border}`}>
                  {currentLoc.riskLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Horizontal Progress Bars (No separate cards per metric!) */}
        <div className="space-y-3 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Risk Contributors Breakdown (100% Total)
            </h3>
            <span className="text-xs text-slate-500">
              Multi-criteria weighted formula
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {/* Historical Vulnerability */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700">Historical Vulnerability (25%)</span>
                <span className="font-mono font-bold text-cyan-800">{currentLoc.historicalVulnerabilityScore} / 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-700 h-full rounded-full transition-all" style={{ width: `${currentLoc.historicalVulnerabilityScore}%` }}></div>
              </div>
            </div>

            {/* Current Rainfall */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700">Current Rainfall (20%)</span>
                <span className="font-mono font-bold text-blue-700">{currentLoc.currentRainfallRisk} / 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${currentLoc.currentRainfallRisk}%` }}></div>
              </div>
            </div>

            {/* Forecast Rainfall */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700">Forecast Rainfall 24h (25%)</span>
                <span className="font-mono font-bold text-blue-900">{currentLoc.forecastRainfallRisk} / 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-800 h-full rounded-full transition-all" style={{ width: `${currentLoc.forecastRainfallRisk}%` }}></div>
              </div>
            </div>

            {/* Drainage Risk */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700">Drainage Risk (15%)</span>
                <span className="font-mono font-bold text-amber-700">{currentLoc.drainageRisk} / 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full transition-all" style={{ width: `${currentLoc.drainageRisk}%` }}></div>
              </div>
            </div>

            {/* Waste Risk */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700">Waste Risk (10%)</span>
                <span className="font-mono font-bold text-rose-700">{currentLoc.wasteRisk} / 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-600 h-full rounded-full transition-all" style={{ width: `${currentLoc.wasteRisk}%` }}></div>
              </div>
            </div>

            {/* Terrain Risk */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700">Terrain Risk (5%)</span>
                <span className="font-mono font-bold text-slate-700">{currentLoc.terrainRisk} / 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-600 h-full rounded-full transition-all" style={{ width: `${currentLoc.terrainRisk}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* USEFUL TABS: [ Historical ] [ Current ] [ Forecast ] [ Action ] */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200">
            {(
              [
                { id: 'historical', label: 'Historical' },
                { id: 'current', label: 'Current' },
                { id: 'forecast', label: 'Forecast' },
                { id: 'action', label: 'Action' },
              ] as const
            ).map((tab) => {
              const isActive = activeDetailTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'border-cyan-800 text-cyan-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: HISTORICAL (TIMELINE & EXPANDABLE RECORDS WITH LOAD MORE) */}
          {activeDetailTab === 'historical' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Recorded incidents in Jammu municipal registers (2024–2026). Locations with repeated historical waterlogging carry higher baseline vulnerability.
                </p>
                <span className="text-xs font-semibold text-slate-500">
                  Showing {visibleIncidents.length} of {histIncidents.length} records
                </span>
              </div>

              {histIncidents.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">No historical waterlogging incidents recorded for this location.</p>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {visibleIncidents.map((inc) => {
                    const isExpanded = expandedIncidentId === inc.id;
                    return (
                      <div key={inc.id} className="transition-colors hover:bg-slate-50">
                        <button
                          onClick={() => setExpandedIncidentId(isExpanded ? null : inc.id)}
                          className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-mono font-bold text-slate-900 w-16">
                              {inc.year}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {inc.date} · {inc.incidentType.toUpperCase()}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {inc.cause}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              inc.severity === 'Critical' ? 'bg-rose-100 text-rose-800' : inc.severity === 'Severe' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {inc.severity}
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </button>

                        {/* Expandable Incident Details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 bg-slate-50 text-xs text-slate-700 space-y-1.5 border-t border-slate-100">
                            <p><strong>Description:</strong> {inc.description}</p>
                            <p><strong>Water Depth:</strong> {inc.waterDepthCm ? `${inc.waterDepthCm} cm recorded ponding` : 'Significant sheet flow'}</p>
                            <p><strong>Verification:</strong> {inc.sourceStatus}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More / Show Less for Historical Records */}
              {histIncidents.length > 5 && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      if (expandedHistoricalCount >= histIncidents.length) {
                        setExpandedHistoricalCount(5);
                      } else {
                        setExpandedHistoricalCount((prev) => prev + 5);
                      }
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {expandedHistoricalCount >= histIncidents.length ? 'Show Less' : 'Load More Historical Incidents'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CURRENT */}
          {activeDetailTab === 'current' && (
            <div className="space-y-4 pt-2 text-sm text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase block">Active Precipitation</span>
                  <span className="text-2xl font-black font-mono text-blue-700 mt-1 block">
                    {currentLoc.currentRainfallMm} mm
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">Inflow factor: {currentLoc.currentRainfallRisk}/100</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase block">Drainage Status</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">
                    {currentLoc.drainCapacityStatus}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">{currentLoc.culvertDescription}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase block">Waste Hotspots</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">
                    {currentLoc.wasteHotspotsCount} Surface Dump Sites
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">Vulnerability: {currentLoc.wasteRisk}/100</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
                <strong>Current State Assessment:</strong> Immediate street runoff is influenced by active precipitation of {currentLoc.currentRainfallMm} mm interacting with {currentLoc.culvertDescription.toLowerCase()}
              </div>
            </div>
          )}

          {/* TAB 3: FORECAST */}
          {activeDetailTab === 'forecast' && (
            <div className="space-y-4 pt-2 text-sm text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase block">Next 24 Hours Expected Rainfall</span>
                  <span className="text-3xl font-black font-mono text-blue-900 mt-1 block">
                    {currentLoc.forecastRainfallMm} mm
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">Projected storm loading factor: {currentLoc.forecastRainfallRisk}/100</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase block">Forecast Mode Risk Score</span>
                  <span className="text-3xl font-black font-mono text-slate-900 mt-1 block">
                    {currentLoc.forecastRiskScore} / 100
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">Upcoming rainfall combined with historical memory</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Catchment Vulnerability Reasons
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {currentLoc.whyAtRisk.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-800 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: ACTION */}
          {activeDetailTab === 'action' && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-slate-600">
                Prioritized municipal preventive checklist for Jammu Municipal Corporation (JMC). Dispatch teams before rainfall causes waterlogging.
              </p>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {currentLoc.recommendedActions.map((task, idx) => (
                  <div key={task.id} className="p-4 flex items-center justify-between gap-4 text-sm">
                    <div>
                      <div className="font-bold text-slate-900">
                        {idx + 1}. {task.action}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Department: <strong>{task.department}</strong>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap ${
                      task.priority === 'Immediate' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. LOCATION RANKINGS TABLE (CLEAN TABLE WITH LOAD MORE) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Monitored Jammu Locations
            </h2>
            <p className="text-sm text-slate-500">
              Ranked by composite flood risk. Click any row to focus map and view full analysis.
            </p>
          </div>
          <button
            onClick={() => onNavigate('locations')}
            className="text-sm font-bold text-cyan-800 hover:text-cyan-900 cursor-pointer"
          >
            Open All ({locations.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Historical Risk</th>
                <th className="py-3 px-4 text-right">Current Risk</th>
                <th className="py-3 px-4 text-right">Forecast Risk</th>
                <th className="py-3 px-4 text-center">Overall Risk</th>
                <th className="py-3 px-4 text-center">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleLocations.map((loc) => {
                const colors = getRiskColor(loc.riskLevel);
                const isSelected = currentLoc.id === loc.id;
                return (
                  <tr
                    key={loc.id}
                    onClick={() => onSelectLocation(loc)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-cyan-50/50 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {loc.name}
                      <span className="text-xs text-slate-500 font-normal ml-2">Ward {loc.wardNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-800 tabular-nums">
                      {loc.historicalVulnerabilityScore}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-700 tabular-nums">
                      {loc.currentRainfallRisk}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-900 tabular-nums">
                      {loc.forecastRainfallRisk}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900 text-base tabular-nums">
                      {loc.riskScore}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${colors.bg} ${colors.border}`}>
                        {loc.riskLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load More Locations button */}
        {sortedLocations.length > 6 && (
          <div className="flex justify-center pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                if (expandedLocationsCount >= sortedLocations.length) {
                  setExpandedLocationsCount(6);
                } else {
                  setExpandedLocationsCount((prev) => prev + 6);
                }
              }}
              className="px-5 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              {expandedLocationsCount >= sortedLocations.length ? 'Show Less Locations' : `Load More Locations (${sortedLocations.length - expandedLocationsCount} remaining)`}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
