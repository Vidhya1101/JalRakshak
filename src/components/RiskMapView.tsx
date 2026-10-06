/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LocationData, MapLayerFilters, RiskLevel, MapTimeMode } from '../types';
import { LeafletMap } from './LeafletMap';
import { getRiskColor, getScoreForMapMode } from '../services/riskEngine';
import { Search } from 'lucide-react';

interface RiskMapViewProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
  layers: MapLayerFilters;
  onToggleLayer: (layerKey: keyof MapLayerFilters) => void;
  mapTimeMode?: MapTimeMode;
  onTimeModeChange?: (mode: MapTimeMode) => void;
}

export const RiskMapView: React.FC<RiskMapViewProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  layers,
  onToggleLayer,
  mapTimeMode = 'COMBINED',
  onTimeModeChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'ALL'>('ALL');
  const [localTimeMode, setLocalTimeMode] = useState<MapTimeMode>(mapTimeMode);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const activeMode = onTimeModeChange ? mapTimeMode : localTimeMode;
  const setMode = onTimeModeChange || setLocalTimeMode;

  const filteredLocations = locations.filter((loc) => {
    const modeData = getScoreForMapMode(loc, activeMode);
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'ALL' || modeData.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const displayList = filteredLocations.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
            GIS Spatial Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Jammu Flood Risk Map
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Isolate historical memory (2024–2026), live rainfall, or upcoming forecast across monitored catchments.
          </p>
        </div>

        {/* Time Dimension Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {(['COMBINED', 'PAST', 'NOW', 'FORECAST'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeMode === m
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m === 'COMBINED' ? 'Combined Risk' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Layer Toggles & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Jammu location (e.g. Chinor, Muthi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900"
          />
        </div>

        {/* Risk Level Filter */}
        <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">Filter:</span>
          {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                filterLevel === level
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* GIS Layer Toggles */}
        <div className="md:col-span-3 flex flex-wrap items-center justify-start md:justify-end gap-1.5 text-xs">
          <button
            onClick={() => onToggleLayer('wasteHotspots')}
            className={`px-2.5 py-1 rounded-md border font-bold transition-colors cursor-pointer ${
              layers.wasteHotspots
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Waste Hotspots
          </button>

          <button
            onClick={() => onToggleLayer('drainageRisk')}
            className={`px-2.5 py-1 rounded-md border font-bold transition-colors cursor-pointer ${
              layers.drainageRisk
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Drainage
          </button>
        </div>
      </div>

      {/* Main Map + Locations List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Map (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <LeafletMap
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation}
            layers={layers}
            timeMode={activeMode}
            onTimeModeChange={setMode}
            heightClass="h-[620px]"
          />
        </div>

        {/* Location Picker Side List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {activeMode} Nodes ({filteredLocations.length})
            </h3>
            <span className="text-xs text-slate-500">Click to fly on map</span>
          </div>

          <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
            {filteredLocations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No locations match the current filter.
              </div>
            ) : (
              displayList.map((loc) => {
                const modeData = getScoreForMapMode(loc, activeMode);
                const colors = getRiskColor(modeData.level);
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => onSelectLocation(loc)}
                    className={`p-3.5 rounded-xl border text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-800 bg-cyan-50/50 shadow-sm ring-1 ring-cyan-700'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900">{loc.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colors.bg} ${colors.border}`}>
                        {modeData.level} ({modeData.score})
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mb-2">
                      {activeMode === 'PAST' && `${loc.historicalIncidents.length} historical incidents recorded (2024–2026)`}
                      {activeMode === 'NOW' && `Current rainfall: ${loc.currentRainfallMm} mm`}
                      {activeMode === 'FORECAST' && `Upcoming 24h forecast: ${loc.forecastRainfallMm} mm`}
                      {activeMode === 'COMBINED' && `Combined score: Past ${loc.historicalVulnerabilityScore} · Rain ${loc.currentRainfallMm}mm`}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1.5 border-t border-slate-100 font-mono">
                      <span>Hist: {loc.historicalVulnerabilityScore}</span>
                      <span>·</span>
                      <span>Drain: {loc.drainageRisk}</span>
                      <span>·</span>
                      <span>Waste: {loc.wasteRisk}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Load More on Side List */}
          {filteredLocations.length > 6 && (
            <div className="pt-3 border-t border-slate-100 flex justify-center">
              <button
                onClick={() => {
                  if (visibleCount >= filteredLocations.length) {
                    setVisibleCount(6);
                  } else {
                    setVisibleCount((prev) => prev + 6);
                  }
                }}
                className="w-full py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {visibleCount >= filteredLocations.length ? 'Show Less' : `Load More (${filteredLocations.length - visibleCount} more)`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
