import React, { useEffect, useMemo, useState } from 'react';
import { Crosshair, Layers, MapPin, RotateCcw } from 'lucide-react';
import { SeismicMap } from '../components/SeismicMap';
import { formatEventTime } from '../services/bmkgService';
import type { DepthCategory, EarthquakeEvent, MapBasemap, TimezoneOption } from '../types/bmkg';

interface EarthquakeMapViewProps {
  events: EarthquakeEvent[];
  latestEventId?: string | null;
  timezone: TimezoneOption;
  defaultBasemap: MapBasemap;
  initialSelectedEvent?: EarthquakeEvent | null;
  onInspectEvent: (event: EarthquakeEvent) => void;
}

export const EarthquakeMapView: React.FC<EarthquakeMapViewProps> = ({
  events,
  latestEventId,
  timezone,
  defaultBasemap,
  initialSelectedEvent = null,
  onInspectEvent,
}) => {
  const [minMag, setMinMag] = useState<number>(0);
  const [depthFilter, setDepthFilter] = useState<'Semua' | DepthCategory>('Semua');
  const [periodHours, setPeriodHours] = useState<number>(168);
  const [basemap, setBasemap] = useState<MapBasemap>(defaultBasemap);
  const [showAdminLayer, setShowAdminLayer] = useState<boolean>(true);
  const [showTectonicLayer, setShowTectonicLayer] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<EarthquakeEvent | null>(
    initialSelectedEvent || events[0] || null
  );
  const [focusCenter, setFocusCenter] = useState<[number, number] | null>(
    initialSelectedEvent ? [initialSelectedEvent.latitude, initialSelectedEvent.longitude] : null
  );
  const [focusZoom, setFocusZoom] = useState<number>(initialSelectedEvent ? 7 : 5);

  useEffect(() => {
    setBasemap(defaultBasemap);
  }, [defaultBasemap]);

  useEffect(() => {
    if (initialSelectedEvent) {
      setSelectedEvent(initialSelectedEvent);
      setFocusCenter([initialSelectedEvent.latitude, initialSelectedEvent.longitude]);
      setFocusZoom(7);
    }
  }, [initialSelectedEvent]);

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    return events.filter((ev) => {
      if (ev.magnitude < minMag) return false;
      if (depthFilter !== 'Semua' && ev.depthCategory !== depthFilter) return false;
      if (periodHours > 0 && now - ev.timestampMs > periodHours * 3600_000) return false;
      return true;
    });
  }, [events, minMag, depthFilter, periodHours]);

  const activePoint = selectedEvent || filteredEvents[0] || null;

  const handleResetView = () => {
    setMinMag(0);
    setDepthFilter('Semua');
    setPeriodHours(168);
    setFocusCenter([-2.2, 118.0]);
    setFocusZoom(5);
  };

  const handleFocusLatest = () => {
    const newest = filteredEvents[0] || events[0];
    if (!newest) return;
    setSelectedEvent(newest);
    setFocusCenter([newest.latitude, newest.longitude]);
    setFocusZoom(7);
  };

  return (
    <div className="space-y-5">
      {/* Kontrol Filter & Layer Peta */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Magnitudo
            </label>
            <select
              value={minMag}
              onChange={(e) => setMinMag(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value={0}>Semua Magnitudo</option>
              <option value={3}>M &ge; 3.0</option>
              <option value={4}>M &ge; 4.0</option>
              <option value={5}>M &ge; 5.0</option>
              <option value={6}>M &ge; 6.0</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kedalaman
            </label>
            <select
              value={depthFilter}
              onChange={(e) => setDepthFilter(e.target.value as 'Semua' | DepthCategory)}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value="Semua">Semua Kedalaman</option>
              <option value="Dangkal">Dangkal (&le; 60 km)</option>
              <option value="Menengah">Menengah (61–300 km)</option>
              <option value="Dalam">Dalam (&gt; 300 km)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Periode
            </label>
            <select
              value={periodHours}
              onChange={(e) => setPeriodHours(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value={24}>24 Jam Terakhir</option>
              <option value={72}>3 Hari Terakhir</option>
              <option value={168}>7 Hari Terakhir</option>
              <option value={0}>Semua Data BMKG</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Peta Dasar
            </label>
            <select
              value={basemap}
              onChange={(e) => setBasemap(e.target.value as MapBasemap)}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
            >
              <option value="esri_topo">Topografi (Esri Topo)</option>
              <option value="osm">Peta Standar (OSM)</option>
              <option value="esri_street">Peta Jalan (Esri Street)</option>
              <option value="esri_imagery">Citra Satelit (Esri Satellite)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetView}
              className="w-full h-10 inline-flex items-center justify-center gap-2 px-3 rounded-md border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Peta</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Layers className="h-3.5 w-3.5 text-sky-700 dark:text-sky-400" />
              <span>Layer Peta:</span>
            </span>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showAdminLayer}
                onChange={(e) => setShowAdminLayer(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
              />
              <span>Batas Administrasi Provinsi</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showTectonicLayer}
                onChange={(e) => setShowTectonicLayer(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
              />
              <span>Lempeng Tektonik &amp; Sesar Aktif</span>
            </label>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
            {filteredEvents.length} Titik Gempa
          </span>
        </div>
      </section>

      {/* Peta Interaktif + Panel Titik Terpilih Saja */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 xl:col-span-9">
          <SeismicMap
            events={filteredEvents}
            selectedEventId={activePoint?.id}
            latestEventId={latestEventId}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            basemap={basemap}
            showAdminLayer={showAdminLayer}
            showTectonicLayer={showTectonicLayer}
            timezone={timezone}
            heightClass="h-[480px] lg:h-[600px]"
            focusCenter={focusCenter}
            focusZoom={focusZoom}
          />
        </div>

        <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          {activePoint ? (
            <>
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Titik Gempa Terpilih
                  </h2>
                  <button
                    type="button"
                    onClick={handleFocusLatest}
                    className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                    title="Fokus ke gempa terbaru"
                  >
                    <Crosshair className="h-3.5 w-3.5" />
                    <span>Terbaru</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Magnitudo</h3>
                    <div
                      className={`font-mono text-3xl font-bold tabular-nums mt-1 ${
                        activePoint.magnitude >= 6.0
                          ? 'text-red-700 dark:text-red-400'
                          : activePoint.magnitude >= 5.0
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-sky-700 dark:text-sky-400'
                      }`}
                    >
                      {activePoint.magnitude.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Kedalaman</h3>
                    <div className="font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
                      {activePoint.depthKm}
                      <span className="text-xs font-normal text-slate-500 ml-1">km</span>
                    </div>
                  </div>
                </div>

                <dl className="space-y-3.5 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Lokasi Episenter</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-1 flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>{activePoint.wilayah}</span>
                    </dd>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Klasifikasi</dt>
                      <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                        {activePoint.depthCategory}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Koridor</dt>
                      <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                        {activePoint.regionGroup}
                      </dd>
                    </div>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Waktu ({timezone})</dt>
                    <dd className="font-mono text-xs tabular-nums text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatEventTime(activePoint.timestampMs, timezone).full}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Koordinat</dt>
                    <dd className="font-mono text-xs tabular-nums text-slate-800 dark:text-slate-200 mt-0.5">
                      {activePoint.lintangStr} · {activePoint.bujurStr}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Status Tsunami</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                      {activePoint.tsunamiStatus}
                    </dd>
                  </div>

                  {activePoint.dirasakan && (
                    <div>
                      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Skala MMI</dt>
                      <dd className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                        {activePoint.dirasakan}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="pt-4 mt-5 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onInspectEvent(activePoint)}
                  className="w-full py-2.5 px-4 rounded-md text-xs font-medium bg-sky-700 hover:bg-sky-800 text-white transition-colors cursor-pointer"
                >
                  Lihat Detail Lengkap
                </button>
              </div>
            </>
          ) : (
            <div className="m-auto text-center py-8">
              <h2 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tidak Ada Titik Terpilih
              </h2>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
