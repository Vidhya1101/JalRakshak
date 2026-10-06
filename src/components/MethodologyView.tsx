/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const MethodologyView: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Compile Historical Incidents (PAST)',
      desc: 'Maintains a persistent record of 2024–2026 documented waterlogging episodes, drainage blockages, and debris surges in Jammu to establish location-specific vulnerability baselines.',
      badge: 'Past Dimension (25%)',
    },
    {
      num: '02',
      title: 'Fetch Live Current Precipitation (NOW)',
      desc: 'Queries real-time weather from Open-Meteo for Jammu (Lat: 32.73, Lon: 74.86) on every page refresh to measure active conduit inflow and ground moisture saturation.',
      badge: 'Present Dimension (20%)',
    },
    {
      num: '03',
      title: 'Analyze Upcoming Forecasts (FUTURE)',
      desc: 'Evaluates next 24h & 48h precipitation volumes, cloudburst indicators, and rainfall intensity trajectories across Jammu catchment basins.',
      badge: 'Forecast Dimension (25%)',
    },
    {
      num: '04',
      title: 'Synthesize Multi-Criteria Risk Engine',
      desc: 'Applies the 6-factor composite formula balancing historical vulnerability (25%), current rain (20%), forecast rain (25%), drainage bottlenecks (15%), waste choke points (10%), and terrain (5%).',
      badge: 'Risk Engine (100%)',
    },
    {
      num: '05',
      title: 'GIS Map Spatialization across Modes',
      desc: 'Visualizes risk nodes on Leaflet with selectable modes: PAST (historical recurring zones), NOW (current state), FORECAST (predicted storm impact), and COMBINED RISK.',
      badge: 'Spatial Intelligence',
    },
    {
      num: '06',
      title: 'Prioritized Preventive Action Checklist',
      desc: 'Issues department-specific work manifests (JMC Drainage, Sanitation Wing, Quick Response, Traffic Police) to clear screens and stage de-watering pumps before rainfall peaks.',
      badge: 'Municipal Prevention',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12 pb-16">
      {/* Title & Introduction */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
          System Architecture & Decision Framework
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How JalRakshak Works
        </h1>
        <p className="text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
          <strong>PAST + NOW + FORECAST ↓ PREDICTIVE FLOOD RISK ↓ PRIORITIZED PREVENTIVE ACTION.</strong><br />
          Combining verified 2024–2026 historical incident memory with live API weather telemetry to prevent waterlogging before heavy downpours inundate Jammu streets.
        </p>
      </div>

      {/* 6-Step Workflow */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
            The 6-Step End-to-End Decision Pipeline
          </h2>
          <p className="text-sm text-slate-500">
            From historical record intake to field crew task generation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-100">
                    STEP {step.num}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {step.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prototype Weighted Scoring Engine Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Mathematical Formulation
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            Dynamic 6-Factor Multi-Criteria Risk Formula
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Normalized composite flood risk score combining all three time dimensions:
          </p>
        </div>

        {/* Formula Code Banner */}
        <div className="p-5 rounded-xl bg-slate-900 text-slate-100 font-mono text-sm overflow-x-auto shadow-inner">
          <div className="text-cyan-400 font-bold mb-2">
            Composite Flood Risk Score =
          </div>
          <div className="pl-4 space-y-1.5 text-slate-300">
            <div>(Historical Vulnerability × <span className="text-cyan-300 font-bold">0.25</span>) [PAST] +</div>
            <div>(Current Rainfall Conditions × <span className="text-cyan-300 font-bold">0.20</span>) [NOW] +</div>
            <div>(Forecast Rainfall (24h) × <span className="text-cyan-300 font-bold">0.25</span>) [FORECAST] +</div>
            <div>(Drainage Bottleneck Risk × <span className="text-cyan-300 font-bold">0.15</span>) [PHYSICAL] +</div>
            <div>(Waste Hotspot Choke Risk × <span className="text-cyan-300 font-bold">0.10</span>) [PHYSICAL] +</div>
            <div>(Terrain & Slope Elevation × <span className="text-cyan-300 font-bold">0.05</span>) [PHYSICAL]</div>
          </div>
          <div className="mt-4 text-xs text-slate-400 border-t border-slate-800 pt-3 font-sans">
            Total = 100% · Normalized score range: 0–100 · Dynamic updates upon weather API fetch
          </div>
        </div>

        {/* Factor Weights Table (Clean Dividers, No Floating Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-y border-slate-200 py-4 text-left">
          <div className="pr-4 py-2">
            <span className="text-xs text-slate-500 font-semibold uppercase block">Historical (PAST)</span>
            <span className="text-2xl font-mono font-black text-cyan-800 mt-1 block">25%</span>
            <p className="text-xs text-slate-500 mt-0.5">2024–2026 incidents</p>
          </div>

          <div className="px-0 sm:px-4 py-2">
            <span className="text-xs text-slate-500 font-semibold uppercase block">Current Rain (NOW)</span>
            <span className="text-2xl font-mono font-black text-blue-700 mt-1 block">20%</span>
            <p className="text-xs text-slate-500 mt-0.5">Active precipitation</p>
          </div>

          <div className="px-0 sm:px-4 py-2">
            <span className="text-xs text-slate-500 font-semibold uppercase block">Forecast (FUTURE)</span>
            <span className="text-2xl font-mono font-black text-blue-900 mt-1 block">25%</span>
            <p className="text-xs text-slate-500 mt-0.5">Next 24h storm volume</p>
          </div>

          <div className="px-0 sm:px-4 py-2">
            <span className="text-xs text-slate-500 font-semibold uppercase block">Drainage Capacity</span>
            <span className="text-2xl font-mono font-black text-amber-700 mt-1 block">15%</span>
            <p className="text-xs text-slate-500 mt-0.5">Culvert throttling</p>
          </div>

          <div className="px-0 sm:px-4 py-2">
            <span className="text-xs text-slate-500 font-semibold uppercase block">Waste Hotspots</span>
            <span className="text-2xl font-mono font-black text-rose-700 mt-1 block">10%</span>
            <p className="text-xs text-slate-500 mt-0.5">Grate debris density</p>
          </div>

          <div className="pl-0 sm:pl-4 py-2">
            <span className="text-xs text-slate-500 font-semibold uppercase block">Terrain & Slope</span>
            <span className="text-2xl font-mono font-black text-slate-700 mt-1 block">5%</span>
            <p className="text-xs text-slate-500 mt-0.5">Elevation depression</p>
          </div>
        </div>

        {/* Classification */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Standard Municipal Risk Classification
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
              <span className="font-bold text-emerald-900 block">0–29 : LOW</span>
              <span className="text-slate-600 text-xs mt-1 block">Nominal drainage freeboard; routine sweep</span>
            </div>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60">
              <span className="font-bold text-amber-900 block">30–49 : MODERATE</span>
              <span className="text-slate-600 text-xs mt-1 block">Pre-monsoon debris sweep recommended</span>
            </div>
            <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/60">
              <span className="font-bold text-orange-900 block">50–69 : HIGH</span>
              <span className="text-slate-600 text-xs mt-1 block">Dispatch jetting machine; stage backup units</span>
            </div>
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60">
              <span className="font-bold text-rose-900 block">70–100 : CRITICAL</span>
              <span className="text-slate-600 text-xs mt-1 block">Immediate staging of portable de-watering pumps</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 italic border-l-2 border-amber-400 pl-3">
          Prototype risk model — weights are illustrative prototype weights and should be calibrated using official historical data.
        </p>
      </div>
    </div>
  );
};
