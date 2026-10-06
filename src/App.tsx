/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ActivePage, LocationData, WeatherData, MapLayerFilters, MapTimeMode } from './types';
import { buildJammuLocations } from './data/jammuLocations';
import { fetchJammuWeather, createSimulatedWeather } from './services/weatherService';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { RiskMapView } from './components/RiskMapView';
import { LocationsTable } from './components/LocationsTable';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { MethodologyView } from './components/MethodologyView';
import { LocationDetailModal } from './components/LocationDetailModal';
import { Shield, RefreshCw } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [weather, setWeather] = useState<WeatherData>(() => createSimulatedWeather(65, 8.5));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [mapTimeMode, setMapTimeMode] = useState<MapTimeMode>('COMBINED');

  // Selected location for detail modal
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // Target location for simulator jump
  const [simulatorLocationId, setSimulatorLocationId] = useState<string>('loc-chinor');

  // GIS Layer toggles
  const [layers, setLayers] = useState<MapLayerFilters>({
    floodRisk: true,
    wasteHotspots: true,
    drainageRisk: true,
    historicalWaterlogging: true,
    rainfallIntensity: true,
  });

  // Load weather and recalculate risk
  const refreshWeatherData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchJammuWeather();
      setWeather(data);
    } catch (err) {
      console.error('Error fetching live weather:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load: Fetch real live weather for Jammu immediately
  useEffect(() => {
    refreshWeatherData();
  }, [refreshWeatherData]);

  // Optional auto-refresh every 15 minutes (900,000 ms)
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const interval = setInterval(() => {
      refreshWeatherData();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshWeatherData]);

  // DYNAMIC RECALCULATION:
  // Every time weather changes (real-time fetch or simulation), rebuild all locations
  const locations: LocationData[] = useMemo(() => {
    return buildJammuLocations(
      weather.currentPrecipitationMm,
      weather.expectedRainfall24hMm
    );
  }, [weather.currentPrecipitationMm, weather.expectedRainfall24hMm]);

  // Keep selectedLocation updated if its underlying score changed
  const activeSelectedLocation = useMemo(() => {
    if (!selectedLocation) return null;
    return locations.find((l) => l.id === selectedLocation.id) || selectedLocation;
  }, [locations, selectedLocation]);

  const handleToggleLayer = (layerKey: keyof MapLayerFilters) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  const handleOpenSimulator = (locationId: string) => {
    setSimulatorLocationId(locationId);
    setActivePage('simulator');
  };

  // City-wide overall status
  const avgCityScore = Math.round(
    locations.reduce((acc, l) => acc + l.riskScore, 0) / locations.length
  );
  const cityRiskLevel =
    avgCityScore >= 70 ? 'CRITICAL' : avgCityScore >= 50 ? 'HIGH' : avgCityScore >= 30 ? 'MODERATE' : 'LOW';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <Header
        activePage={activePage}
        onNavigate={setActivePage}
        isDemoMode={weather.isDemo}
        onToggleDemoMode={() => {
          if (weather.isDemo) {
            refreshWeatherData();
          } else {
            setWeather(createSimulatedWeather(65, 8.5));
          }
        }}
        overallRiskLevel={cityRiskLevel}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {activePage === 'landing' && (
          <LandingPage onNavigate={setActivePage} locations={locations} />
        )}

        {activePage === 'dashboard' && (
          <DashboardView
            locations={locations}
            weather={weather}
            selectedLocation={activeSelectedLocation}
            onSelectLocation={setSelectedLocation}
            layers={layers}
            onToggleLayer={handleToggleLayer}
            mapTimeMode={mapTimeMode}
            onTimeModeChange={setMapTimeMode}
            onRefreshWeather={refreshWeatherData}
            isRefreshing={isRefreshing}
            autoRefreshEnabled={autoRefreshEnabled}
            onToggleAutoRefresh={() => setAutoRefreshEnabled((prev) => !prev)}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'risk-map' && (
          <RiskMapView
            locations={locations}
            selectedLocation={activeSelectedLocation}
            onSelectLocation={setSelectedLocation}
            layers={layers}
            onToggleLayer={handleToggleLayer}
            mapTimeMode={mapTimeMode}
            onTimeModeChange={setMapTimeMode}
          />
        )}

        {activePage === 'locations' && (
          <LocationsTable
            locations={locations}
            onSelectLocation={setSelectedLocation}
            onOpenSimulator={handleOpenSimulator}
          />
        )}

        {activePage === 'simulator' && (
          <WhatIfSimulator
            locations={locations}
            initialLocationId={simulatorLocationId}
            onSelectLocationForInspection={setSelectedLocation}
          />
        )}

        {activePage === 'methodology' && <MethodologyView />}
      </main>

      {/* Location Detail Modal with Timeline & Action Checklist */}
      {activeSelectedLocation && (
        <LocationDetailModal
          location={activeSelectedLocation}
          onClose={() => setSelectedLocation(null)}
          onOpenSimulator={handleOpenSimulator}
        />
      )}

      {/* Civic Decision Support Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-cyan-700 flex items-center justify-center text-white">
              <Shield className="w-3 h-3" />
            </div>
            <span className="font-extrabold text-slate-900">JALRAKSHAK</span>
            <span>·</span>
            <span>Predictive Urban Flood Prevention for Jammu</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span>Historical Incidents: <strong>2024–2026</strong></span>
            <span>·</span>
            <span>Live Weather: <strong>Open-Meteo API</strong></span>
            <span>·</span>
            <span className="text-amber-700 font-semibold">JSCH Prototype</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
