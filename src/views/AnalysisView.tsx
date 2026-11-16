import React, { useMemo, useState } from 'react';
import { DailyTrendChart, HorizontalBarChart, VerticalBarChart } from '../components/Charts';
import { formatEventTime } from '../services/bmkgService';
import type { EarthquakeEvent, TimezoneOption } from '../types/bmkg';

interface AnalysisViewProps {
  events: EarthquakeEvent[];
  timezone: TimezoneOption;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ events, timezone }) => {
  const [comparisonWindow, setComparisonWindow] = useState<'24h' | '72h'>('24h');

  const summary = useMemo(() => {
    const n = events.length;
    if (n === 0) {
      return { avgMag: 0, maxMag: 0, avgDepth: 0, minDepth: 0, maxDepth: 0, shallowPct: 0 };
    }
    const avgMag = events.reduce((acc, e) => acc + e.magnitude, 0) / n;
    const maxMag = events.reduce((acc, e) => Math.max(acc, e.magnitude), 0);
    const avgDepth = Math.round(events.reduce((acc, e) => acc + e.depthKm, 0) / n);
    const minDepth = events.reduce((acc, e) => Math.min(acc, e.depthKm), Infinity);
    const maxDepth = events.reduce((acc, e) => Math.max(acc, e.depthKm), 0);
    const shallowCount = events.filter((e) => e.depthKm <= 60).length;
    const shallowPct = Math.round((shallowCount / n) * 100);
    return { avgMag, maxMag, avgDepth, minDepth, maxDepth, shallowPct };
  }, [events]);

  const magnitudeDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0];
    for (const ev of events) {
      if (ev.magnitude < 2.5) counts[0]++;
      else if (ev.magnitude < 3.5) counts[1]++;
      else if (ev.magnitude < 4.5) counts[2]++;
      else if (ev.magnitude < 5.0) counts[3]++;
      else if (ev.magnitude < 6.0) counts[4]++;
      else counts[5]++;
    }
    return [
      { label: '<2.5', value: counts[0], color: '#0EA5E9' },
      { label: '2.5–3.4', value: counts[1], color: '#0284C7' },
      { label: '3.5–4.4', value: counts[2], color: '#0369A1' },
      { label: '4.5–4.9', value: counts[3], color: '#D97706' },
      { label: '5.0–5.9', value: counts[4], color: '#EA580C' },
      { label: '≥6.0', value: counts[5], color: '#DC2626' },
    ];
  }, [events]);

  const dailySeries = useMemo(() => {
    const grouped = new Map<string, { sortKey: number; count: number; maxMag: number }>();
    for (const ev of events) {
      const formatted = formatEventTime(ev.timestampMs, timezone);
      const shortDate = formatted.tanggal.slice(0, 6);
      const ex = grouped.get(shortDate);
      if (!ex) {
        grouped.set(shortDate, { sortKey: ev.timestampMs, count: 1, maxMag: ev.magnitude });
      } else {
        ex.count += 1;
        ex.maxMag = Math.max(ex.maxMag, ev.magnitude);
      }
    }
    return Array.from(grouped.entries())
      .sort((a, b) => a[1].sortKey - b[1].sortKey)
      .slice(-10)
      .map(([dateLabel, v]) => ({ dateLabel, count: v.count, maxMag: v.maxMag }));
  }, [events, timezone]);

  const depthBreakdown = useMemo(() => {
    const dangkal = events.filter((e) => e.depthKm <= 60);
    const menengah = events.filter((e) => e.depthKm > 60 && e.depthKm <= 300);
    const dalam = events.filter((e) => e.depthKm > 300);
    const total = Math.max(1, events.length);
    return [
      {
        label: 'Dangkal (0 – 60 km)',
        value: dangkal.length,
        sublabel: `${Math.round((dangkal.length / total) * 100)}%`,
        color: '#DC2626',
      },
      {
        label: 'Menengah (61 – 300 km)',
        value: menengah.length,
        sublabel: `${Math.round((menengah.length / total) * 100)}%`,
        color: '#D97706',
      },
      {
        label: 'Dalam (> 300 km)',
        value: dalam.length,
        sublabel: `${Math.round((dalam.length / total) * 100)}%`,
        color: '#0284C7',
      },
    ];
  }, [events]);

  const regionDistribution = useMemo(() => {
    const map = new Map<string, { count: number; maxMag: number }>();
    for (const ev of events) {
      const ex = map.get(ev.regionGroup);
      if (!ex) map.set(ev.regionGroup, { count: 1, maxMag: ev.magnitude });
      else {
        ex.count += 1;
        ex.maxMag = Math.max(ex.maxMag, ev.magnitude);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([region, stat]) => ({
        label: region,
        value: stat.count,
        sublabel: `Maks M ${stat.maxMag.toFixed(1)}`,
        color: '#0369A1',
      }));
  }, [events]);

  const periodComparison = useMemo(() => {
    const latestTs = events[0]?.timestampMs || Date.now();
    const spanMs = comparisonWindow === '24h' ? 24 * 3600_000 : 72 * 3600_000;

    const currentPeriod = events.filter(
      (e) => e.timestampMs > latestTs - spanMs && e.timestampMs <= latestTs
    );
    const prevPeriod = events.filter(
      (e) => e.timestampMs > latestTs - spanMs * 2 && e.timestampMs <= latestTs - spanMs
    );

    const calcMetrics = (list: EarthquakeEvent[]) => {
      const count = list.length;
      const m45 = list.filter((e) => e.magnitude >= 4.5).length;
      const shallow = list.filter((e) => e.depthKm <= 60).length;
      const maxMag = list.reduce((acc, e) => Math.max(acc, e.magnitude), 0);
      return { count, m45, shallow, maxMag };
    };

    const curr = calcMetrics(currentPeriod);
    const prev = calcMetrics(prevPeriod);
    const deltaCountPct =
      prev.count > 0 ? Math.round(((curr.count - prev.count) / prev.count) * 100) : 0;

    return { curr, prev, deltaCountPct };
  }, [events, comparisonWindow]);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Magnitudo Rata-Rata
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100 my-2">
            M {summary.avgMag.toFixed(2)}
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
            n = {events.length}
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Magnitudo Tertinggi
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-red-700 dark:text-red-400 my-2">
            M {summary.maxMag.toFixed(1)}
          </div>
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
            Rekaman Puncak
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Kedalaman Rata-Rata
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100 my-2">
            {summary.avgDepth} <span className="text-sm font-normal text-slate-500">km</span>
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
            {summary.minDepth === Infinity ? 0 : summary.minDepth}–{summary.maxDepth} km
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Proporsi Gempa Dangkal
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-amber-700 dark:text-amber-400 my-2">
            {summary.shallowPct}%
          </div>
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
            &le; 60 km
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              Statistik Magnitudo
            </h2>
          </div>
          <VerticalBarChart data={magnitudeDistribution} />
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              Grafik Aktivitas Gempa
            </h2>
          </div>
          <DailyTrendChart data={dailySeries} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div>
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              Analisis Kedalaman Gempa
            </h2>
            <HorizontalBarChart data={depthBreakdown} />
          </div>
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Minimum</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {summary.minDepth === Infinity ? 0 : summary.minDepth} km
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Rata-Rata</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {summary.avgDepth} km
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Maksimum</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {summary.maxDepth} km
              </span>
            </div>
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            Distribusi Gempa Berdasarkan Wilayah
          </h2>
          <HorizontalBarChart data={regionDistribution} />
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
            Perbandingan Aktivitas Gempa Antarperiode
          </h2>
          <div className="flex items-center gap-1 p-1 rounded-md bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setComparisonWindow('24h')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                comparisonWindow === '24h'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              24 Jam
            </button>
            <button
              type="button"
              onClick={() => setComparisonWindow('72h')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                comparisonWindow === '72h'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              3 Hari
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Jumlah Kejadian</h3>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {periodComparison.curr.count}
              </span>
              <span
                className={`font-mono text-xs font-semibold tabular-nums ${
                  periodComparison.deltaCountPct > 0
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {periodComparison.deltaCountPct >= 0 ? '+' : ''}
                {periodComparison.deltaCountPct}%
              </span>
            </div>
            <div className="mt-1 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              Sebelumnya: {periodComparison.prev.count}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Gempa M &ge; 4.5</h3>
            <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {periodComparison.curr.m45}
            </div>
            <div className="mt-1 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              Sebelumnya: {periodComparison.prev.m45}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Gempa Dangkal</h3>
            <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {periodComparison.curr.shallow}
            </div>
            <div className="mt-1 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              Sebelumnya: {periodComparison.prev.shallow}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Magnitudo Puncak</h3>
            <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-red-700 dark:text-red-400">
              M {periodComparison.curr.maxMag.toFixed(1)}
            </div>
            <div className="mt-1 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              Sebelumnya: M {periodComparison.prev.maxMag.toFixed(1)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
