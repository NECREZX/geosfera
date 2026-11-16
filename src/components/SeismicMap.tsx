import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import provincesGeoJsonRaw from '../data/indonesiaProvinces.json';
import { normalizeProvinceName } from '../data/seismicZones';
import { TECTONIC_PLATES_GEOJSON } from '../data/tectonicPlates';
import { formatEventTime } from '../services/bmkgService';
import type { EarthquakeEvent, MapBasemap, TimezoneOption } from '../types/bmkg';

interface SeismicMapProps {
  events: EarthquakeEvent[];
  selectedEventId?: string | null;
  latestEventId?: string | null;
  onSelectEvent?: (event: EarthquakeEvent) => void;
  basemap: MapBasemap;
  showAdminLayer: boolean;
  showTectonicLayer: boolean;
  hazardMode?: boolean;
  timezone: TimezoneOption;
  heightClass?: string;
  focusCenter?: [number, number] | null;
  focusZoom?: number;
}

const TILE_CONFIG: Record<MapBasemap, { url: string; attribution: string }> = {
  esri_topo: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, USGS, NOAA',
  },
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  esri_street: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin',
  },
  esri_imagery: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  },
};

function getDepthColor(depthKm: number): string {
  if (depthKm <= 60) return '#DC2626';
  if (depthKm <= 300) return '#D97706';
  return '#0284C7';
}

function getMarkerRadius(mag: number): number {
  return Math.max(5, Math.min(18, (mag - 1.4) * 2.5));
}

function getProvinceBaselineHazardColor(rawName: string): { fill: string; label: string } {
  const name = normalizeProvinceName(rawName).toLowerCase();
  const veryHigh = [
    'aceh',
    'sumatera utara',
    'sumatera barat',
    'bengkulu',
    'lampung',
    'banten',
    'nusa tenggara barat',
    'nusa tenggara timur',
    'sulawesi tengah',
    'sulawesi utara',
    'gorontalo',
    'maluku',
    'maluku utara',
  ];
  const high = [
    'jawa barat',
    'dki jakarta',
    'jawa tengah',
    'di yogyakarta',
    'jawa timur',
    'bali',
    'sulawesi barat',
    'sulawesi selatan',
    'sulawesi tenggara',
    'papua',
    'papua barat',
    'papua tengah',
  ];
  const medium = ['sumatera selatan', 'jambi', 'riau', 'kalimantan timur', 'kalimantan selatan'];

  if (veryHigh.some((p) => name.includes(p))) return { fill: '#DC2626', label: 'Sangat Tinggi' };
  if (high.some((p) => name.includes(p))) return { fill: '#EA580C', label: 'Tinggi' };
  if (medium.some((p) => name.includes(p))) return { fill: '#D97706', label: 'Sedang' };
  return { fill: '#0284C7', label: 'Rendah' };
}

export const SeismicMap: React.FC<SeismicMapProps> = ({
  events,
  selectedEventId,
  latestEventId,
  onSelectEvent,
  basemap,
  showAdminLayer,
  showTectonicLayer,
  hazardMode = false,
  timezone,
  heightClass = 'h-[480px]',
  focusCenter = null,
  focusZoom = 6,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const adminLayerRef = useRef<L.GeoJSON | null>(null);
  const tectonicLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-2.2, 118.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 14,
      zoomControl: true,
    });

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = TILE_CONFIG[basemap] || TILE_CONFIG.esri_topo;
    tileLayerRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: 18,
    }).addTo(map);
    tileLayerRef.current.bringToBack();
  }, [basemap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (adminLayerRef.current) {
      map.removeLayer(adminLayerRef.current);
      adminLayerRef.current = null;
    }

    if (showAdminLayer || hazardMode) {
      const layer = L.geoJSON(provincesGeoJsonRaw as GeoJSON.GeoJsonObject, {
        style: (feature) => {
          const propName = String(feature?.properties?.Propinsi || '');
          if (hazardMode) {
            const hz = getProvinceBaselineHazardColor(propName);
            return {
              color: '#334155',
              weight: 1,
              fillColor: hz.fill,
              fillOpacity: 0.28,
            };
          }
          return {
            color: basemap === 'esri_imagery' ? '#E2E8F0' : '#475569',
            weight: 1,
            dashArray: '3 3',
            fillColor: '#0369A1',
            fillOpacity: 0.04,
          };
        },
        onEachFeature: (feature, featureLayer) => {
          const rawName = String(feature?.properties?.Propinsi || 'Wilayah');
          const cleanName = normalizeProvinceName(rawName);
          if (hazardMode) {
            const hz = getProvinceBaselineHazardColor(rawName);
            featureLayer.bindTooltip(
              `<div style="font-size:12px;"><strong>${cleanName}</strong><br/>Kerawanan: ${hz.label}</div>`,
              { sticky: true }
            );
          } else {
            featureLayer.bindTooltip(`<span style="font-size:12px;font-weight:600;">${cleanName}</span>`, {
              sticky: true,
            });
          }
        },
      }).addTo(map);

      adminLayerRef.current = layer;
    }
  }, [showAdminLayer, hazardMode, basemap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tectonicLayerRef.current) {
      map.removeLayer(tectonicLayerRef.current);
      tectonicLayerRef.current = null;
    }

    if (showTectonicLayer) {
      const layer = L.geoJSON(TECTONIC_PLATES_GEOJSON as GeoJSON.GeoJsonObject, {
        style: (feature) => {
          const fType = feature?.properties?.type;
          if (fType === 'subduction') {
            return { color: '#B91C1C', weight: 2.5, opacity: 0.9 };
          }
          if (fType === 'plate_boundary') {
            return { color: '#4338CA', weight: 2.2, dashArray: '6 4', opacity: 0.85 };
          }
          return { color: '#D97706', weight: 2, dashArray: '4 4', opacity: 0.85 };
        },
        onEachFeature: (feature, featureLayer) => {
          const p = feature?.properties;
          if (p) {
            featureLayer.bindPopup(
              `<div style="min-width:190px;max-width:240px;">
                <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${p.name}</div>
                <div style="font-size:11px;opacity:0.85;">${p.plates} · ${p.rate}</div>
              </div>`
            );
          }
        },
      }).addTo(map);

      tectonicLayerRef.current = layer;
    }
  }, [showTectonicLayer]);

  useEffect(() => {
    const map = mapRef.current;
    const group = markersLayerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const ordered = [...events].sort((a, b) => a.magnitude - b.magnitude);

    for (const ev of ordered) {
      const color = getDepthColor(ev.depthKm);
      const radius = getMarkerRadius(ev.magnitude);
      const isSelected = ev.id === selectedEventId;
      const isLatest = ev.id === latestEventId;

      if (isLatest || isSelected) {
        L.circleMarker([ev.latitude, ev.longitude], {
          radius: radius + 7,
          color: isSelected ? '#0369A1' : color,
          weight: 2,
          fillOpacity: 0,
          opacity: 0.8,
        }).addTo(group);
      }

      const marker = L.circleMarker([ev.latitude, ev.longitude], {
        radius,
        color: isSelected ? '#0F172A' : '#FFFFFF',
        weight: isSelected ? 2.5 : 1.25,
        fillColor: color,
        fillOpacity: isSelected ? 0.98 : 0.84,
      });

      const formatted = formatEventTime(ev.timestampMs, timezone);
      marker.bindPopup(
        `<div style="min-width:210px;">
          <div style="font-weight:700;font-size:13px;margin-bottom:2px;">M ${ev.magnitude.toFixed(1)} · ${ev.depthKm} km</div>
          <div style="font-size:11px;opacity:0.75;margin-bottom:5px;">${formatted.full}</div>
          <div style="font-size:12px;font-weight:600;margin-bottom:3px;">${ev.wilayah}</div>
          <div style="font-size:11px;opacity:0.85;">${ev.lintangStr}, ${ev.bujurStr}</div>
        </div>`
      );

      marker.on('click', () => {
        if (onSelectEvent) onSelectEvent(ev);
      });

      marker.addTo(group);
    }
  }, [events, selectedEventId, latestEventId, timezone, onSelectEvent]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusCenter) return;
    map.flyTo(focusCenter, focusZoom, { duration: 0.7 });
  }, [focusCenter, focusZoom]);

  return (
    <div className={`relative isolate z-0 w-full ${heightClass} rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800`}>
      <div ref={containerRef} className="w-full h-full" />

      {/* Compact Legend Overlay strictly scoped inside isolate container */}
      <div className="pointer-events-auto absolute bottom-3 left-3 z-[400] rounded-md bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] text-slate-700 dark:text-slate-200 shadow-sm max-w-[250px]">
        <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Legenda Kedalaman
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 inline-block" />
            <span>Dangkal (&le;60 km)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600 inline-block" />
            <span>Menengah (61–300)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-600 inline-block" />
            <span>Dalam (&gt;300 km)</span>
          </span>
        </div>
        {showTectonicLayer && (
          <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-red-700 inline-block" />
              <span>Subduksi</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-600 inline-block" />
              <span>Sesar Aktif</span>
            </span>
          </div>
        )}
      </div>

      {cursorCoords && (
        <div className="pointer-events-none hidden sm:block absolute top-3 right-3 z-[400] rounded-md bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-mono tabular-nums text-slate-700 dark:text-slate-300">
          {cursorCoords.lat.toFixed(2)}, {cursorCoords.lng.toFixed(2)}
        </div>
      )}
    </div>
  );
};
