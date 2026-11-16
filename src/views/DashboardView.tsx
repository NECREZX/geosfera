import React, { useMemo, useState } from 'react';
import { ArrowRight, Compass, MapPin } from 'lucide-react';
import { DailyTrendChart, VerticalBarChart } from '../components/Charts';
import { SeismicMap } from '../components/SeismicMap';
import { formatEventTime, getDirectShakemapUrl, getShakemapUrl } from '../services/bmkgService';
import type { BmkgDataset, EarthquakeEvent, MapBasemap, MenuId, TimezoneOption } from '../types/bmkg';

interface DashboardViewProps {
  dataset: BmkgDataset;
  timezone: TimezoneOption;
  basemap: MapBasemap;
  onSelectEvent: (event: EarthquakeEvent) => void;
  onNavigate: (menu: MenuId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  dataset,
  timezone,
  basemap,
  onSelectEvent,
  onNavigate,
}) => {
  const [heroViewMode, setHeroViewMode] = useState<'map' | 'shakemap'>('map');
  const [shakemapDirect, setShakemapDirect] = useState(false);
  const [shakemapError, setShakemapError] = useState(false);

  const latest = dataset.latestAutoGempa || dataset.allEvents[0] || null;

  const stats = useMemo(() => {
    const events = dataset.allEvents;
    const total = events.length;
    const m5Count = events.filter((e) => e.magnitude >= 5.0).length;
    const maxMag = events.reduce((acc, e) => Math.max(acc, e.magnitude), 0);
    const feltCount = Math.max(dataset.recentFelt.length, events.filter((e) => e.isFelt).length);
    const shallowCount = events.filter((e) => e.depthKm <= 60).length;
    const shallowPct = total > 0 ? Math.round((shallowCount / total) * 100) : 0;
    const now = Date.now();
    const last24h = events.filter((e) => now - e.timestampMs <= 86_400_000).length;
    return { total, m5Count, maxMag, feltCount, shallowCount, shallowPct, last24h };
  }, [dataset]);

  const magnitudeBuckets = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const ev of dataset.allEvents) {
      if (ev.magnitude < 3.0) counts[0]++;
      else if (ev.magnitude < 4.0) counts[1]++;
      else if (ev.magnitude < 5.0) counts[2]++;
      else if (ev.magnitude < 6.0) counts[3]++;
      else counts[4]++;
    }
    return [
      { label: '< 3.0', value: counts[0], color: '#0284C7' },
      { label: '3.0–3.9', value: counts[1], color: '#0369A1' },
      { label: '4.0–4.9', value: counts[2], color: '#D97706' },
      { label: '5.0–5.9', value: counts[3], color: '#EA580C' },
      { label: '≥ 6.0', value: counts[4], color: '#DC2626' },
    ];
  }, [dataset.allEvents]);

  const dailySeries = useMemo(() => {
    const grouped = new Map<string, { sortKey: number; count: number; maxMag: number }>();
    for (const ev of dataset.allEvents) {
      const formatted = formatEventTime(ev.timestampMs, timezone);
      const shortDate = formatted.tanggal.slice(0, 6);
      const existing = grouped.get(shortDate);
      if (!existing) {
        grouped.set(shortDate, { sortKey: ev.timestampMs, count: 1, maxMag: ev.magnitude });
      } else {
        existing.count += 1;
        existing.maxMag = Math.max(existing.maxMag, ev.magnitude);
      }
    }
    return Array.from(grouped.entries())
      .sort((a, b) => a[1].sortKey - b[1].sortKey)
      .slice(-8)
      .map(([dateLabel, v]) => ({ dateLabel, count: v.count, maxMag: v.maxMag }));
  }, [dataset.allEvents, timezone]);

  const recentSignificant = useMemo(() => dataset.allEvents.slice(0, 8), [dataset.allEvents]);

  const shakemapUrl = latest
    ? shakemapDirect
      ? getDirectShakemapUrl(latest.shakemapFile)
      : getShakemapUrl(latest.shakemapFile)
    : null;

  return (
    <div className="space-y-6">
      {/* Gempa Terkini BMKG */}
      {latest && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Gempa Terkini BMKG · {formatEventTime(latest.timestampMs, timezone).full}
                </h2>
                <span
                  className={`text-xs font-semibold ${
                    latest.tsunamiStatus === 'Berpotensi Tsunami'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {latest.tsunamiStatus}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Magnitudo</h3>
                  <div
                    className={`font-mono text-3xl sm:text-4xl font-bold tabular-nums mt-1 ${
                      latest.magnitude >= 6.0
                        ? 'text-red-700 dark:text-red-400'
                        : latest.magnitude >= 5.0
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-sky-700 dark:text-sky-400'
                    }`}
                  >
                    {latest.magnitude.toFixed(1)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Kedalaman</h3>
                  <div className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
                    {latest.depthKm}
                    <span className="text-sm font-normal text-slate-500 ml-1">km</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Koordinat</h3>
                  <div className="font-mono text-sm sm:text-base font-semibold tabular-nums text-slate-900 dark:text-slate-100 mt-2">
                    {latest.lintangStr}
                    <span className="block text-slate-600 dark:text-slate-400">
                      {latest.bujurStr}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-sky-700 dark:text-sky-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Lokasi Episenter</h3>
                    <div className="font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {latest.wilayah}
                    </div>
                  </div>
                </div>

                {latest.dirasakan && (
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Skala Dirasakan (MMI)</h3>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                      {latest.dirasakan}
                    </div>
                  </div>
                )}

                {latest.potensi && (
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Potensi</h3>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                      {latest.potensi}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelectEvent(latest)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span>Detail &amp; Shakemap</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('peta')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium bg-sky-700 hover:bg-sky-800 text-white transition-colors cursor-pointer"
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Peta Gempa Interaktif</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Posisi Episenter Terkini
              </h2>
              {shakemapUrl && !shakemapError && (
                <div className="flex items-center gap-1 p-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setHeroViewMode('map')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      heroViewMode === 'map'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Peta GIS
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroViewMode('shakemap')}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      heroViewMode === 'shakemap'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Shakemap
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[290px]">
              {heroViewMode === 'shakemap' && shakemapUrl && !shakemapError ? (
                <div className="h-[310px] w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <img
                    src={shakemapUrl}
                    alt={`Shakemap BMKG ${latest.wilayah}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain"
                    onError={() => {
                      if (!shakemapDirect) setShakemapDirect(true);
                      else setShakemapError(true);
                    }}
                  />
                </div>
              ) : (
                <SeismicMap
                  events={[latest]}
                  latestEventId={latest.id}
                  selectedEventId={latest.id}
                  onSelectEvent={onSelectEvent}
                  basemap={basemap}
                  showAdminLayer={true}
                  showTectonicLayer={true}
                  timezone={timezone}
                  heightClass="h-[310px]"
                  focusCenter={[latest.latitude, latest.longitude]}
                  focusZoom={6}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4 KPI Simetris */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Kejadian Terpantau
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100 my-2">
            {stats.total.toLocaleString('id-ID')}
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
            24 Jam Terakhir: {stats.last24h}
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Gempa Signifikan (M &ge; 5.0)
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-amber-700 dark:text-amber-400 my-2">
            {stats.m5Count}
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
            Maksimum: M {stats.maxMag.toFixed(1)}
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Gempa Dirasakan (MMI)
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-sky-700 dark:text-sky-400 my-2">
            {stats.feltCount}
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
            Laporan BMKG Terkini
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Rasio Gempa Dangkal (&le; 60 km)
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-red-700 dark:text-red-400 my-2">
            {stats.shallowPct}%
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
            {stats.shallowCount} / {stats.total} Kejadian
          </div>
        </div>
      </section>

      {/* Grafik Statistik */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              Tren Aktivitas Gempa Harian
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('analisis')}
              className="text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Analisis Lengkap
            </button>
          </div>
          <DailyTrendChart data={dailySeries} />
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              Distribusi Magnitudo Gempa
            </h2>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              n = {stats.total}
            </span>
          </div>
          <VerticalBarChart data={magnitudeBuckets} />
        </div>
      </section>

      {/* Tabel Aktivitas Terbaru */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
            Aktivitas Gempa Bumi Terbaru
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('riwayat')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
          >
            <span>Semua Riwayat</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-medium text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-4">Waktu ({timezone})</th>
                <th className="py-2.5 px-4 text-right">Magnitudo</th>
                <th className="py-2.5 px-4 text-right">Kedalaman</th>
                <th className="py-2.5 px-4">Wilayah</th>
                <th className="py-2.5 px-4">Koridor</th>
                <th className="py-2.5 px-4">Status Tsunami</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
              {recentSignificant.map((ev) => {
                const t = formatEventTime(ev.timestampMs, timezone);
                return (
                  <tr
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {t.tanggal} · {t.jam.replace(` ${timezone}`, '')}
                    </td>
                    <td
                      className={`py-3 px-4 font-mono font-semibold tabular-nums text-right whitespace-nowrap ${
                        ev.magnitude >= 6.0
                          ? 'text-red-700 dark:text-red-400'
                          : ev.magnitude >= 5.0
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      M {ev.magnitude.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {ev.depthKm} km
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-[320px] truncate">
                      {ev.wilayah}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {ev.regionGroup}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {ev.tsunamiStatus}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
