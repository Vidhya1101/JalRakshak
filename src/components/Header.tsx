/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActivePage } from '../types';

interface HeaderProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  overallRiskLevel: string;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  isDemoMode,
  onToggleDemoMode,
  overallRiskLevel,
}) => {
  const navItems: { id: ActivePage; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'risk-map', label: 'Risk Map' },
    { id: 'locations', label: 'Locations' },
    { id: 'simulator', label: 'Simulation' },
    { id: 'methodology', label: 'Methodology' },
    { id: 'landing', label: 'Overview' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-cyan-800 transition-colors">
                JALRAKSHAK
              </span>
              <span className="hidden sm:inline-block ml-3 text-sm font-semibold text-slate-500 border-l border-slate-300 pl-3">
                Jammu Smart Flood Intelligence
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Typography-driven, single-line) */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-cyan-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Live/Demo status & City Risk Status) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDemoMode}
            title="Click to toggle live API vs demo mode"
            className={`px-3 py-1.5 text-xs font-bold rounded-md border flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              isDemoMode
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'}`}></span>
            {isDemoMode ? 'DEMO DATA' : 'LIVE API'}
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold whitespace-nowrap">
            <span className="text-slate-400">City Risk:</span>
            <span className="text-cyan-300">{overallRiskLevel}</span>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-100 gap-2 bg-slate-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
              activePage === item.id
                ? 'bg-cyan-800 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
