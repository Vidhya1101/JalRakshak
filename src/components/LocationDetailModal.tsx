/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LocationData } from '../types';
import { getRiskColor } from '../services/riskEngine';
import { X, ChevronDown, ChevronUp, Sliders, CheckCircle2 } from 'lucide-react';

interface LocationDetailModalProps {
  location: LocationData | null;
  onClose: () => void;
  onOpenSimulator: (locationId: string) => void;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  location,
  onClose,
  onOpenSimulator,
}) => {
  const [activeTab, setActiveTab] = useState<'historical' | 'current' | 'forecast' | 'action'>('historical');
  const [expandedHistoricalCount, setExpandedHistoricalCount] = useState<number>(5);
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  if (!location) return null;

  const colors = getRiskColor(location.riskLevel);
  const histIncidents = location.historicalIncidents;
  const visibleIncidents = histIncidents.slice(0, expandedHistoricalCount);

  const toggleAction = (actionId: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [actionId]: !prev[actionId],
    }));
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Jammu Municipal Corporation · Ward {location.wardNumber}</span>
              <span>·</span>
              <span>Elevation {location.elevationMeters}m</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {location.name}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Predicted Risk
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black font-mono tabular-nums ${colors.text}`}>
                  {location.riskScore}
                  <span className="text-sm font-medium text-slate-500"> / 100</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase border ${colors.bg} ${colors.border}`}>
                  {location.riskLevel}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Unified Horizontal Progress Bars (No card mugging) */}
          <div className="space-y-3 pb-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Risk Contributors Breakdown (100% Total)
              </h3>
              <span className="text-xs text-slate-500">
                Multi-criteria weighted formula
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-700">Historical Vulnerability (25%)</span>
                  <span className="font-mono font-bold text-cyan-800">{location.historicalVulnerabilityScore} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-700 h-full rounded-full" style={{ width: `${location.historicalVulnerabilityScore}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-700">Current Rainfall (20%)</span>
                  <span className="font-mono font-bold text-blue-700">{location.currentRainfallRisk} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${location.currentRainfallRisk}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-700">Forecast 24h Rainfall (25%)</span>
                  <span className="font-mono font-bold text-blue-900">{location.forecastRainfallRisk} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-800 h-full rounded-full" style={{ width: `${location.forecastRainfallRisk}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-700">Drainage Bottleneck (15%)</span>
                  <span className="font-mono font-bold text-amber-700">{location.drainageRisk} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: `${location.drainageRisk}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-700">Waste Choke Points (10%)</span>
                  <span className="font-mono font-bold text-rose-700">{location.wasteRisk} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: `${location.wasteRisk}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-700">Terrain Slope (5%)</span>
                  <span className="font-mono font-bold text-slate-700">{location.terrainRisk} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-600 h-full rounded-full" style={{ width: `${location.terrainRisk}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Useful Tabs: [ Historical ] [ Current ] [ Forecast ] [ Action ] */}
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
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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

            {/* TAB: HISTORICAL */}
            {activeTab === 'historical' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Persistent civic records (2024–2026)</span>
                  <span>Showing {visibleIncidents.length} of {histIncidents.length} incidents</span>
                </div>

                {histIncidents.length === 0 ? (
                  <p className="text-sm text-slate-500 py-3">No historical incident records for this location.</p>
                ) : (
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white text-sm">
                    {visibleIncidents.map((inc) => {
                      const isExpanded = expandedIncidentId === inc.id;
                      return (
                        <div key={inc.id} className="hover:bg-slate-50 transition-colors">
                          <button
                            onClick={() => setExpandedIncidentId(isExpanded ? null : inc.id)}
                            className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-slate-900 w-12 text-xs">
                                {inc.year}
                              </span>
                              <div>
                                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                  {inc.date} · {inc.incidentType.toUpperCase()}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {inc.cause}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                inc.severity === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {inc.severity}
                              </span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-3 pt-1 bg-slate-50 text-xs text-slate-700 space-y-1 border-t border-slate-100">
                              <p><strong>Description:</strong> {inc.description}</p>
                              <p><strong>Water Depth:</strong> {inc.waterDepthCm ? `${inc.waterDepthCm} cm recorded ponding` : 'Sheet flow'}</p>
                              <p><strong>Source:</strong> {inc.sourceStatus}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

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
                      className="px-4 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      {expandedHistoricalCount >= histIncidents.length ? 'Show Less' : 'Load More Historical Incidents'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CURRENT */}
            {activeTab === 'current' && (
              <div className="space-y-3 pt-1 text-sm text-slate-700">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Active Rainfall Input</span>
                    <span className="font-mono font-bold text-blue-700 text-base">{location.currentRainfallMm} mm</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Conduit Inflow Risk Factor:</span>
                    <span className="font-mono font-bold text-slate-800">{location.currentRainfallRisk} / 100</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider block">Drainage & Catchment Infrastructure</span>
                  <p className="text-xs text-slate-600">{location.culvertDescription}</p>
                  <p className="text-xs text-slate-500 mt-1">Status: <strong>{location.drainCapacityStatus}</strong> · Waste dumps: <strong>{location.wasteHotspotsCount}</strong></p>
                </div>
              </div>
            )}

            {/* TAB: FORECAST */}
            {activeTab === 'forecast' && (
              <div className="space-y-3 pt-1 text-sm text-slate-700">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Upcoming 24h Precipitation</span>
                    <span className="font-mono font-bold text-blue-900 text-base">{location.forecastRainfallMm} mm</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Forecast Mode Score:</span>
                    <span className="font-mono font-bold text-slate-800">{location.forecastRiskScore} / 100</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-900 text-xs uppercase tracking-wider block mb-2">Why This Location Is At Risk</span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {location.whyAtRisk.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-800 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB: ACTION */}
            {activeTab === 'action' && (
              <div className="space-y-3 pt-1 text-sm">
                <p className="text-xs text-slate-500">
                  Municipal preventive task checklist. Click to acknowledge completed tasks.
                </p>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {location.recommendedActions.map((task, idx) => {
                    const isDone = completedActions[task.id];
                    return (
                      <div
                        key={task.id}
                        onClick={() => toggleAction(task.id)}
                        className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isDone ? 'bg-emerald-50/60 line-through text-slate-500' : 'hover:bg-slate-50 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-emerald-600' : 'text-slate-300'}`} />
                          <div>
                            <div className="font-bold text-xs sm:text-sm">
                              {idx + 1}. {task.action}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {task.department}
                            </div>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          task.priority === 'Immediate' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Historical Data: <strong>2024–2026</strong> · Weather: <strong>Open-Meteo</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenSimulator(location.id);
              }}
              className="px-4 py-2 text-xs font-bold text-cyan-900 bg-cyan-100/70 hover:bg-cyan-200/80 rounded-xl transition-colors cursor-pointer"
            >
              Simulate Precipitation
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
