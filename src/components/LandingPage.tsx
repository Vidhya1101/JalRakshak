/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActivePage, LocationData } from '../types';
import { ArrowRight, FileText } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: ActivePage) => void;
  locations: LocationData[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, locations }) => {
  const criticalCount = locations.filter((l) => l.riskLevel === 'CRITICAL').length;

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text / Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-900 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-md">
              <span>Jammu Smart City Hackathon (JSCH)</span>
              <span className="text-cyan-400">·</span>
              <span>Prototype Decision-Support System</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                JALRAKSHAK
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-cyan-900">
                Predictive Urban Flood Prevention for Jammu
              </p>
              <p className="text-sm sm:text-base font-semibold text-slate-500 uppercase tracking-wider">
                “Predict before the rain. Prevent before the flood.”
              </p>
            </div>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
              An AI-powered decision-support system that combines rainfall, drainage, waste and
              historical waterlogging data to identify high-risk locations and prioritize
              preventive action before rainfall causes urban flooding.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Analyze Jammu</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate('methodology')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <FileText className="w-4 h-4 text-cyan-800" />
                <span>View How It Works</span>
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs sm:text-sm text-slate-600 italic border-l-2 border-amber-400 pl-3">
              Prototype using demonstration data. Designed for integration with official municipal
              and weather datasets from Jammu Municipal Corporation (JMC).
            </p>
          </div>

          {/* Right Visual Preview of Jammu Risk Operations */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 group">
              <img
                src="/src/assets/images/jammu_monsoon_city_1791306754782.jpg"
                alt="Jammu urban basin with Tawi river under monsoon skies"
                className="w-full h-84 object-cover object-center opacity-90 transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Simulated Active Runoff
                  </span>
                  <span className="text-xs bg-rose-600 text-white font-bold px-2 py-0.5 rounded">
                    {criticalCount} Critical Nodes
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Jammu Basin Hydrology & Drainage Inlets
                </h3>
                <p className="text-xs text-slate-300 mb-3">
                  Live risk scoring across Chinor, Muthi, Rajinder Nagar, and historic Old City.
                </p>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold text-white border border-white/20 transition-colors text-center cursor-pointer"
                >
                  Open City Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY JALRAKSHAK? (Reactive vs Predictive) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-cyan-800 uppercase tracking-widest mb-2 block">
            Paradigm Shift
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why JalRakshak?
          </h2>
          <p className="text-slate-600 mt-2 text-base">
            Existing civic systems detect and respond to problems after waterlogging occurs. 
            JalRakshak focuses on the essential next step: predicting hotspots before the rain begins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reactive Column */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-900 mb-4">
              Traditional Approach: Reactive
            </h3>

            <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl mb-4 text-xs font-bold text-slate-700">
              <span>Problem</span>
              <span className="text-slate-400">→</span>
              <span>Detection</span>
              <span className="text-slate-400">→</span>
              <span className="text-rose-600">Response</span>
            </div>

            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Citizen complaint filed after water enters residential basements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Drain choke identified only when road traffic is already halted</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Emergency de-watering pumps rushed late through congested traffic</span>
              </li>
            </ul>
          </div>

          {/* Predictive Column */}
          <div className="p-6 rounded-2xl border-2 border-cyan-600/40 bg-cyan-50/20 shadow-xs">
            <h3 className="text-base font-bold uppercase tracking-wider text-cyan-950 mb-4">
              JalRakshak: Predictive Prevention
            </h3>

            <div className="flex items-center justify-between py-3 px-4 bg-white border border-cyan-200 rounded-xl mb-4 text-xs font-bold text-cyan-950">
              <span>Data</span>
              <span className="text-cyan-400">→</span>
              <span>Risk Prediction</span>
              <span className="text-cyan-400">→</span>
              <span>Priority Action</span>
              <span className="text-cyan-400">→</span>
              <span className="text-emerald-700">Prevention</span>
            </div>

            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>Synthesizes 24–48h forecasts with local drain capacity beforehand</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>Identifies high-waste grates before stormwater rushes into them</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>Dispatches jetting machines and stages pumps at Chinor & Muthi beforehand</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* The 6 Data Dimensions (Typography-Driven, No Excessive Card Boxes) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-t border-slate-200 pt-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-slate-900">
              6 Integrated Civic & Hydrology Dimensions
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Every Jammu location is evaluated through an explainable multi-factorial risk engine
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 border border-slate-200 bg-white rounded-xl">
              <h4 className="text-base font-bold text-slate-900 mb-1">1. Historical Memory (25%)</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Persistent 2024–2026 recorded incidents establishing baseline vulnerability for recurring choke points.
              </p>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-xl">
              <h4 className="text-base font-bold text-slate-900 mb-1">2. Current Rainfall (20%)</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Live precipitation measured in real time from meteorological sensors to evaluate immediate conduit inflow.
              </p>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-xl">
              <h4 className="text-base font-bold text-slate-900 mb-1">3. Forecast Rainfall (25%)</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Upcoming 24h & 48h expected rain volume, cloudburst flags, and storm intensity trajectories.
              </p>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-xl">
              <h4 className="text-base font-bold text-slate-900 mb-1">4. Drainage Bottlenecks (15%)</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Culvert cross-sectional throttling, age of masonry conduits, and canal distributary backwater surge.
              </p>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-xl">
              <h4 className="text-base font-bold text-slate-900 mb-1">5. Waste Choke Points (10%)</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Solid waste dumping heaps and plastic debris obstructing street drop inlets and silt screens.
              </p>
            </div>

            <div className="p-5 border border-slate-200 bg-white rounded-xl">
              <h4 className="text-base font-bold text-slate-900 mb-1">6. Terrain & Slope (5%)</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Digital elevation gradient, natural bowl depression topography, and foothill runoff sheet-flow.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
