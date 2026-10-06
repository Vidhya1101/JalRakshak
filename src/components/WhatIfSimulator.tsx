/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { LocationData } from '../types';
import { 
  calculateLocationDynamicRisk, 
  simulateRainfallCurve, 
  getRiskColor, 
  getRainfallIntensity 
} from '../services/riskEngine';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { ArrowRight } from 'lucide-react';

interface WhatIfSimulatorProps {
  locations: LocationData[];
  initialLocationId?: string;
  onSelectLocationForInspection: (loc: LocationData) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  locations,
  initialLocationId,
  onSelectLocationForInspection,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialLocationId || locations[0]?.id || 'loc-chinor'
  );
  const [simulatedCurrentRain, setSimulatedCurrentRain] = useState<number>(10);
  const [simulatedForecastRain, setSimulatedForecastRain] = useState<number>(65);

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedId) || locations[0],
    [locations, selectedId]
  );

  const simulation = useMemo(() => {
    return calculateLocationDynamicRisk(
      selectedLocation,
      simulatedCurrentRain,
      simulatedForecastRain
    );
  }, [selectedLocation, simulatedCurrentRain, simulatedForecastRain]);

  const colors = getRiskColor(simulation.riskLevel);
  const intensity = getRainfallIntensity(simulatedForecastRain);

  const chartData = useMemo(() => {
    return simulateRainfallCurve(selectedLocation, simulatedCurrentRain);
  }, [selectedLocation, simulatedCurrentRain]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
          Scenario Modeling & Sensitivity
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          What-If Flood Risk Simulator
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore how varying current precipitation and 24h storm forecasts affect location-specific risk, maintaining historical vulnerability baseline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sliders and Outcome */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Select Jammu Location
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-4 py-3 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-600 focus:outline-none"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} (Ward {loc.wardNumber}) — Hist: {loc.historicalVulnerabilityScore}/100
                </option>
              ))}
            </select>
          </div>

          {/* Current Rainfall Slider */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Current Rainfall (Now)
              </label>
              <span className="font-mono font-bold text-blue-900 text-sm">
                {simulatedCurrentRain} mm
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="2"
              value={simulatedCurrentRain}
              onChange={(e) => setSimulatedCurrentRain(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>0 mm (Dry)</span>
              <span>15 mm (Moderate)</span>
              <span>40 mm (Extreme)</span>
            </div>
          </div>

          {/* Forecast 24h Slider */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Expected 24h Rainfall (Forecast)
              </label>
              <span className="font-mono font-bold text-blue-900 text-sm">
                {simulatedForecastRain} mm
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              value={simulatedForecastRain}
              onChange={(e) => setSimulatedForecastRain(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>10 mm (Light)</span>
              <span>65 mm (Heavy)</span>
              <span>120 mm (Cloudburst)</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2">
              {[20, 40, 65, 95].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSimulatedForecastRain(preset)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    simulatedForecastRain === preset
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset} mm
                </button>
              ))}
            </div>
          </div>

          {/* Combined Simulated Outcome */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div
              className="p-5 rounded-xl border flex items-center justify-between gap-4"
              style={{ backgroundColor: colors.fillHex, borderColor: colors.hex }}
            >
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Simulated Predicted Risk
                </span>
                <span className={`text-3xl sm:text-4xl font-black font-mono tabular-nums ${colors.text}`}>
                  {simulation.riskScore}
                  <span className="text-sm font-medium text-slate-600"> / 100</span>
                </span>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-md text-xs font-extrabold uppercase border ${colors.bg} ${colors.border}`}>
                  {simulation.riskLevel}
                </span>
                <span className="block text-xs text-slate-700 font-semibold mt-1">
                  {intensity} Rainfall Intensity
                </span>
              </div>
            </div>

            {/* Clean Progress Breakdown */}
            <div className="space-y-2 text-xs text-slate-700">
              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Historical Baseline (25%)</span>
                  <span className="font-mono font-bold text-cyan-900">{selectedLocation.historicalVulnerabilityScore}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-800 h-full rounded-full" style={{ width: `${selectedLocation.historicalVulnerabilityScore}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Now Rain Factor (20%)</span>
                  <span className="font-mono font-bold text-blue-700">{simulation.currentRainfallRisk}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${simulation.currentRainfallRisk}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-0.5">
                  <span>Forecast Factor (25%)</span>
                  <span className="font-mono font-bold text-blue-900">{simulation.forecastRainfallRisk}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-800 h-full rounded-full" style={{ width: `${simulation.forecastRainfallRisk}%` }}></div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
              <strong className="block text-slate-900 mb-1 uppercase tracking-wider">Dynamic Municipal Advisory:</strong>
              {simulation.riskLevel === 'CRITICAL'
                ? `CRITICAL: Immediate dispatch of high-capacity portable de-watering diesel pumps to ${selectedLocation.name} bottleneck.`
                : simulation.riskLevel === 'HIGH'
                ? `HIGH ADVISORY: Deploy JMC jetting tanker to desilt culvert screens within 4 hours.`
                : `NOMINAL MONITORING: Standard drain capacity sufficient.`}
            </div>
          </div>
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Forecast Rainfall vs Flood Risk Curve
            </h3>
            <p className="text-sm text-slate-500">
              Continuous sensitivity trajectory for {selectedLocation.name} as forecast precipitation increases from 10 to 120 mm.
            </p>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="rainfallMm" unit="mm" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any, name?: any) => [
                    `${value} / 100`,
                    name === 'floodRiskScore' ? 'Predicted Flood Risk' : 'Forecast Factor',
                  ]}
                  labelFormatter={(label) => `Forecast Rainfall: ${label} mm / 24h`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine y={70} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'Critical (70)', fill: '#dc2626', fontSize: 11, position: 'insideTopRight' }} />
                <ReferenceLine y={50} stroke="#ea580c" strokeDasharray="4 4" label={{ value: 'High (50)', fill: '#ea580c', fontSize: 11, position: 'insideTopRight' }} />
                <ReferenceLine x={simulatedForecastRain} stroke="#0284c7" strokeWidth={2} />

                <Line
                  type="monotone"
                  dataKey="floodRiskScore"
                  stroke="#0f766e"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0f766e' }}
                  activeDot={{ r: 7, fill: '#0284c7' }}
                  name="floodRiskScore"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
            <strong>Catchment Sensitivity:</strong> At {simulatedForecastRain} mm, {selectedLocation.name} reaches a predicted risk of {simulation.riskScore}/100. Because it has an established historical vulnerability baseline ({selectedLocation.historicalVulnerabilityScore}/100) and constrained drainage ({selectedLocation.drainageRisk}/100), risk scales rapidly beyond 45 mm of rain.
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => onSelectLocationForInspection(selectedLocation)}
              className="inline-flex items-center gap-2 text-sm font-bold text-cyan-900 hover:text-cyan-950 cursor-pointer"
            >
              <span>Inspect Full Historical Timeline for {selectedLocation.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
