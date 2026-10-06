/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationData, MapLayerFilters, MapTimeMode } from '../types';
import { getRiskColor, getScoreForMapMode } from '../services/riskEngine';
import { JAMMU_HISTORICAL_INCIDENTS } from '../data/jammuHistoricalIncidents';

interface LeafletMapProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
  layers: MapLayerFilters;
  timeMode?: MapTimeMode;
  onTimeModeChange?: (mode: MapTimeMode) => void;
  heightClass?: string;
  className?: string;
  interactive?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  layers,
  timeMode = 'COMBINED',
  onTimeModeChange,
  heightClass = 'h-[540px]',
  className = '',
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{
    riskMarkers: L.LayerGroup;
    wasteMarkers: L.LayerGroup;
    drainageMarkers: L.LayerGroup;
    historicalMarkers: L.LayerGroup;
  } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Jammu City (lat: 32.7350, lng: 74.8550)
    const map = L.map(mapContainerRef.current, {
      center: [32.7350, 74.8550],
      zoom: 12,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a> | JSCH Prototype',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const riskMarkers = L.layerGroup().addTo(map);
    const wasteMarkers = L.layerGroup().addTo(map);
    const drainageMarkers = L.layerGroup().addTo(map);
    const historicalMarkers = L.layerGroup().addTo(map);

    layerGroupsRef.current = {
      riskMarkers,
      wasteMarkers,
      drainageMarkers,
      historicalMarkers,
    };

    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [interactive]);

  // Handle Layer & Marker Updates based on timeMode and filters
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupsRef.current) return;
    const { riskMarkers, wasteMarkers, drainageMarkers, historicalMarkers } = layerGroupsRef.current;

    riskMarkers.clearLayers();
    wasteMarkers.clearLayers();
    drainageMarkers.clearLayers();
    historicalMarkers.clearLayers();

    locations.forEach((loc) => {
      const modeScore = getScoreForMapMode(loc, timeMode);
      const colors = getRiskColor(modeScore.level);
      const isSelected = selectedLocation?.id === loc.id;

      // 1. Primary Risk Node for the current time mode
      if (layers.floodRisk) {
        const pulseClass = modeScore.level === 'CRITICAL' ? 'animate-pulse' : '';
        const markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
            ${
              modeScore.level === 'CRITICAL'
                ? `<span class="absolute inline-flex h-11 w-11 rounded-full opacity-75 ${pulseClass}" style="background-color: ${colors.fillHex}"></span>`
                : ''
            }
            <div class="relative flex items-center justify-center rounded-full border-2 shadow-md ${
              isSelected ? 'ring-4 ring-cyan-600 scale-125' : ''
            }" style="background-color: ${colors.hex}; border-color: white; width: 36px; height: 36px;">
              <span class="text-white text-xs font-black font-mono tracking-tight">${modeScore.score}</span>
            </div>
            <div class="absolute -bottom-6 whitespace-nowrap bg-white/95 backdrop-blur-xs border border-slate-300 px-2 py-0.5 rounded shadow text-xs font-bold text-slate-900 pointer-events-none">
              ${loc.name}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-risk-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker(loc.coordinates, { icon: customIcon });

        // Popup showing 3 time dimensions & factor breakdown with increased readability
        const popupContent = `
          <div class="p-4 text-slate-900 max-w-xs font-sans">
            <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5 mb-2.5">
              <div>
                <h4 class="font-extrabold text-base text-slate-900 leading-snug">${loc.name}</h4>
                <p class="text-xs text-slate-600">Ward ${loc.wardNumber} · Mode: <strong>${timeMode}</strong></p>
              </div>
              <span class="px-2.5 py-1 rounded text-xs font-black uppercase" style="background-color: ${colors.fillHex}; color: ${colors.hex}">
                ${modeScore.level} (${modeScore.score})
              </span>
            </div>

            <!-- 3 TIME DIMENSIONS -->
            <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3 text-xs space-y-1.5">
              <div class="flex justify-between items-center text-slate-700">
                <span>Historical Vulnerability (25%)</span>
                <span class="font-mono font-bold text-slate-900">${loc.historicalVulnerabilityScore}/100</span>
              </div>
              <div class="flex justify-between items-center text-slate-700">
                <span>Current Rainfall (20%)</span>
                <span class="font-mono font-bold text-blue-700">${loc.currentRainfallMm} mm</span>
              </div>
              <div class="flex justify-between items-center text-slate-700">
                <span>Forecast Rainfall (25%)</span>
                <span class="font-mono font-bold text-blue-900">${loc.forecastRainfallMm} mm</span>
              </div>
            </div>

            <p class="text-xs text-slate-600 line-clamp-2 italic mb-3">
              Action: ${loc.recommendedActions[0]?.action || 'Desilt drain culvert'}
            </p>

            <button id="popup-btn-${loc.id}" class="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors text-center cursor-pointer">
              Inspect Location Details →
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 320 });
        marker.on('click', () => {
          onSelectLocation(loc);
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`popup-btn-${loc.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectLocation(loc);
            };
          }
        });

        riskMarkers.addLayer(marker);

        // Catchment circle
        const circle = L.circle(loc.coordinates, {
          radius: 320 + modeScore.score * 4,
          color: colors.hex,
          weight: 1.5,
          opacity: 0.6,
          fillColor: colors.hex,
          fillOpacity: modeScore.level === 'CRITICAL' ? 0.22 : 0.12,
        });
        riskMarkers.addLayer(circle);
      }

      // 2. Waste Hotspots Layer (Clean badge instead of emoji)
      if (layers.wasteHotspots && loc.wasteHotspotsCount > 0) {
        const wasteCoords: [number, number] = [
          loc.coordinates[0] + 0.0025,
          loc.coordinates[1] - 0.0028,
        ];
        const wasteHtml = `
          <div class="bg-amber-600 text-white rounded-full p-1 shadow border border-white text-[10px] font-bold flex items-center justify-center w-7 h-7" title="Waste Hotspot: ${loc.wasteHotspotsCount} dump sites">
            W
          </div>
        `;
        const icon = L.divIcon({ html: wasteHtml, className: 'icon-waste', iconSize: [26, 26] });
        const m = L.marker(wasteCoords, { icon }).bindPopup(
          `<div class="p-3 text-xs"><strong>${loc.name} Waste Hotspots</strong><br/>${loc.wasteHotspotsCount} solid waste dumping sites impeding stormwater flow.</div>`
        );
        wasteMarkers.addLayer(m);
      }

      // 3. Drainage Vulnerability Layer (Clean badge instead of emoji)
      if (layers.drainageRisk) {
        const drainCoords: [number, number] = [
          loc.coordinates[0] - 0.0022,
          loc.coordinates[1] + 0.0025,
        ];
        const drainHtml = `
          <div class="bg-blue-700 text-white rounded-full p-1 shadow border border-white text-[10px] font-bold flex items-center justify-center w-7 h-7" title="Drainage: ${loc.drainCapacityStatus}">
            D
          </div>
        `;
        const icon = L.divIcon({ html: drainHtml, className: 'icon-drainage', iconSize: [26, 26] });
        const m = L.marker(drainCoords, { icon }).bindPopup(
          `<div class="p-3 text-xs"><strong>${loc.name} Culvert Status</strong><br/>Capacity: ${loc.drainCapacityStatus}<br/>${loc.culvertDescription}</div>`
        );
        drainageMarkers.addLayer(m);
      }
    });

    // 4. Historical Waterlogging Layer — Verified incident markers
    if (layers.historicalWaterlogging || timeMode === 'PAST') {
      JAMMU_HISTORICAL_INCIDENTS.forEach((inc) => {
        const histHtml = `
          <div class="bg-cyan-800 text-white rounded-full p-1 shadow border-2 border-white text-[10px] font-bold flex items-center justify-center w-6 h-6 hover:scale-125 transition-transform cursor-pointer" title="Historical ${inc.year}: ${inc.incidentType}">
            H
          </div>
        `;
        const icon = L.divIcon({ html: histHtml, className: 'icon-hist-node', iconSize: [24, 24] });
        const m = L.marker([inc.latitude, inc.longitude], { icon }).bindPopup(`
          <div class="p-3 text-xs font-sans max-w-xs">
            <div class="flex items-center justify-between gap-1 mb-1 border-b border-slate-200 pb-1">
              <strong class="text-slate-900">${inc.locationName} (${inc.year})</strong>
              <span class="text-[10px] font-bold text-rose-700">${inc.severity}</span>
            </div>
            <p class="font-bold text-cyan-950 text-xs mb-1">${inc.incidentType.toUpperCase()}</p>
            <p class="text-slate-700 text-xs mb-1.5 leading-relaxed">${inc.description}</p>
            <div class="text-[11px] text-slate-500">
              Cause: ${inc.cause} · Source: <em>${inc.sourceStatus}</em>
            </div>
          </div>
        `);
        historicalMarkers.addLayer(m);
      });
    }
  }, [locations, layers, timeMode, selectedLocation, onSelectLocation]);

  // Pan to selected location smoothly
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    mapInstanceRef.current.flyTo(selectedLocation.coordinates, 14, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedLocation]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 ${className}`}>
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className={`w-full ${heightClass}`} />

      {/* Floating Map Legend (Clear text, no decorative icons) */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl p-3 shadow-md pointer-events-auto">
        <div className="flex items-center justify-between gap-4 mb-2">
          <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Risk Legend ({timeMode})
          </p>
          <span className="text-xs text-slate-500 font-mono">0–100</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            <span className="text-slate-800 text-xs font-semibold">Low (0-29)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-800 text-xs font-semibold">Mod (30-49)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-600"></span>
            <span className="text-slate-800 text-xs font-semibold">High (50-69)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="text-slate-900 text-xs font-black">Critical (70-100)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
