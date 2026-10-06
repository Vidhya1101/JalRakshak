/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LocationData, RiskLevel } from '../types';
import { getRiskColor } from '../services/riskEngine';
import { ArrowUpDown, Download, Search } from 'lucide-react';

interface LocationsTableProps {
  locations: LocationData[];
  onSelectLocation: (loc: LocationData) => void;
  onOpenSimulator: (locationId: string) => void;
}

type SortField =
  | 'name'
  | 'historicalVulnerabilityScore'
  | 'currentRainfallRisk'
  | 'forecastRainfallRisk'
  | 'drainageRisk'
  | 'wasteRisk'
  | 'terrainRisk'
  | 'riskScore';

export const LocationsTable: React.FC<LocationsTableProps> = ({
  locations,
  onSelectLocation,
  onOpenSimulator,
}) => {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<SortField>('riskScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredLocations = locations
    .filter((loc) => {
      const matchSearch =
        loc.name.toLowerCase().includes(search.toLowerCase()) ||
        String(loc.wardNumber).includes(search);
      const matchLevel = levelFilter === 'ALL' || loc.riskLevel === levelFilter;
      return matchSearch && matchLevel;
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

  const displayLocations = filteredLocations.slice(0, visibleCount);

  const exportCSV = () => {
    const headers = [
      'Location Name',
      'Ward',
      'Historical Vulnerability (25%)',
      'Historical Incidents (2024-2026)',
      'Current Rainfall (mm)',
      'Current Rain Risk (20%)',
      'Forecast 24h Rainfall (mm)',
      'Forecast Rain Risk (25%)',
      'Drainage Risk (15%)',
      'Waste Risk (10%)',
      'Terrain Risk (5%)',
      'Combined Flood Risk',
      'Risk Level',
      'Drain Capacity Status',
      'Primary Preventive Action',
    ];

    const rows = filteredLocations.map((l) => [
      `"${l.name}"`,
      l.wardNumber,
      l.historicalVulnerabilityScore,
      l.historicalIncidents.length,
      l.currentRainfallMm,
      l.currentRainfallRisk,
      l.forecastRainfallMm,
      l.forecastRainfallRisk,
      l.drainageRisk,
      l.wasteRisk,
      l.terrainRisk,
      l.riskScore,
      l.riskLevel,
      `"${l.drainCapacityStatus}"`,
      `"${l.recommendedActions[0]?.action || 'Desilt drain'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Jammu_Predictive_Flood_Risk_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
            Municipal Monitoring Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Monitored Jammu Locations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            3-dimensional assessment combining persistent past incidents (2024–2026), live rainfall, and 24h forecasts.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4 text-slate-700" />
          <span>Export Municipal Report (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by location name or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-xl">
          {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                levelFilter === lvl
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-xs">
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Location</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('historicalVulnerabilityScore')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Historical Risk</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('currentRainfallRisk')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Current Risk</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('forecastRainfallRisk')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Forecast Risk</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('riskScore')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Overall Flood Risk</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-cyan-700" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayLocations.map((loc) => {
                const colors = getRiskColor(loc.riskLevel);
                return (
                  <tr
                    key={loc.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => onSelectLocation(loc)}
                  >
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div>{loc.name}</div>
                      <div className="text-xs text-slate-500 font-normal">
                        Ward {loc.wardNumber} · {loc.historicalIncidents.length} past incidents
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-cyan-800 tabular-nums">
                      {loc.historicalVulnerabilityScore}
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-blue-700 tabular-nums">
                      {loc.currentRainfallRisk}
                      <span className="text-xs text-slate-400 font-normal ml-1">({loc.currentRainfallMm}mm)</span>
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-blue-900 tabular-nums">
                      {loc.forecastRainfallRisk}
                      <span className="text-xs text-slate-400 font-normal ml-1">({loc.forecastRainfallMm}mm)</span>
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-black text-slate-900 text-base tabular-nums">
                      {loc.riskScore}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase border ${colors.bg} ${colors.border}`}
                      >
                        {loc.riskLevel}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectLocation(loc)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onOpenSimulator(loc.id)}
                          className="px-3 py-1.5 text-xs font-bold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Simulate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load More Button */}
        {filteredLocations.length > 8 && (
          <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50/50">
            <button
              onClick={() => {
                if (visibleCount >= filteredLocations.length) {
                  setVisibleCount(8);
                } else {
                  setVisibleCount((prev) => prev + 8);
                }
              }}
              className="px-5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              {visibleCount >= filteredLocations.length
                ? 'Show Less'
                : `Load More Locations (${filteredLocations.length - visibleCount} remaining)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
