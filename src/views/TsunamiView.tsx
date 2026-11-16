import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Waves } from 'lucide-react';
import { formatEventTime } from '../services/bmkgService';
import type { BmkgDataset, EarthquakeEvent, TimezoneOption } from '../types/bmkg';

interface TsunamiViewProps {
  dataset: BmkgDataset;
  timezone: TimezoneOption;
  onSelectEvent: (event: EarthquakeEvent) => void;
}

export const TsunamiView: React.FC<TsunamiViewProps> = ({
  dataset,
  timezone,
  onSelectEvent,
}) => {
  const tsunamiCandidates = useMemo(() => {
    const combined = [...dataset.recentM5Plus, ...dataset.last30Alerts];
    const seen = new Set<string>();
    const unique: EarthquakeEvent[] = [];
    for (const ev of combined) {
      if (!seen.has(ev.id)) {
        seen.add(ev.id);
        unique.push(ev);
      }
    }
    return unique.sort((a, b) => b.timestampMs - a.timestampMs);
  }, [dataset.recentM5Plus, dataset.last30Alerts]);

  const activeTsunamiAlerts = useMemo(() => {
    return dataset.allEvents.filter(
      (ev) => ev.tsunamiStatus === 'Berpotensi Tsunami' || ev.tsunamiStatus === 'Pemantauan Pesisir'
    );
  }, [dataset.allEvents]);

  const latest = dataset.latestAutoGempa;
  const cap = dataset.capAlert;
  const hasActiveWarning =
    activeTsunamiAlerts.some((e) => e.tsunamiStatus === 'Berpotensi Tsunami') ||
    (cap?.potential || '').toLowerCase().includes('berpotensi tsunami');

  const coastalObservationEvents = useMemo(() => {
    return tsunamiCandidates.filter((e) => e.magnitude >= 5.0 || e.isFelt).slice(0, 12);
  }, [tsunamiCandidates]);

  return (
    <div className="space-y-6">
      <section
        className={`rounded-xl border p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] ${
          hasActiveWarning
            ? 'bg-red-50 dark:bg-red-950/35 border-red-300 dark:border-red-800'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5">
              {hasActiveWarning ? (
                <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-400 shrink-0" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              )}
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Status Peringatan Tsunami InaTEWS BMKG
              </h3>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {hasActiveWarning
                ? 'Peringatan Dini Tsunami Aktif'
                : 'Tidak Ada Peringatan Dini Tsunami Aktif'}
            </h2>

            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {cap?.headline ||
                (latest
                  ? `M ${latest.magnitude.toFixed(1)} · ${latest.wilayah} · ${latest.tsunamiStatus}`
                  : 'Terhubung ke InaTEWS BMKG')}
            </div>
          </div>

          <div className="shrink-0 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg p-4 min-w-[230px]">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Buletin CAP Terakhir</h3>
            <div className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
              {cap?.sent || (latest ? formatEventTime(latest.timestampMs, timezone).full : '-')}
            </div>
            <div className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              {cap?.potential || latest?.potensi || '-'}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Berpotensi Tsunami
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100 my-2">
            {activeTsunamiAlerts.filter((e) => e.tsunamiStatus === 'Berpotensi Tsunami').length}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Status Resmi BMKG TEWS
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Pemantauan Laut Dangkal (M &ge; 6.5)
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-amber-700 dark:text-amber-400 my-2">
            {activeTsunamiAlerts.filter((e) => e.tsunamiStatus === 'Pemantauan Pesisir').length}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Kedalaman &le; 70 km
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Evaluasi Gempa M &ge; 5.0
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-sky-700 dark:text-sky-400 my-2">
            {dataset.recentM5Plus.length}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Feed Gempaterkini BMKG
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              Pembaruan Peringatan &amp; Wilayah Pesisir Terkait
            </h2>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-4">Waktu ({timezone})</th>
                  <th className="py-2.5 px-4 text-right">Mag</th>
                  <th className="py-2.5 px-4 text-right">Kedalaman</th>
                  <th className="py-2.5 px-4">Wilayah Pesisir / Episenter</th>
                  <th className="py-2.5 px-4">Status Peringatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                {coastalObservationEvents.map((ev) => {
                  const t = formatEventTime(ev.timestampMs, timezone);
                  const isAlert = ev.tsunamiStatus === 'Berpotensi Tsunami';
                  return (
                    <tr
                      key={ev.id}
                      onClick={() => onSelectEvent(ev)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {t.tanggal} · {t.jam.split(' ')[0]}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold tabular-nums text-right text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        M {ev.magnitude.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {ev.depthKm} km
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        <div className="font-medium">{ev.wilayah}</div>
                        {ev.dirasakan && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {ev.dirasakan}
                          </div>
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                          isAlert
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {ev.potensi || ev.tsunamiStatus}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <Waves className="h-4 w-4 text-sky-700 dark:text-sky-400" />
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Parameter Kriteria Tsunami
              </h2>
            </div>
            <dl className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                <dt className="font-semibold text-slate-900 dark:text-slate-100">1. Episenter Dasar Laut</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">
                  Deformasi vertikal kolom air laut
                </dd>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                <dt className="font-semibold text-slate-900 dark:text-slate-100">2. Kedalaman Dangkal</dt>
                <dd className="font-mono text-slate-600 dark:text-slate-400 mt-1">
                  Hiposenter &le; 70 km
                </dd>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                <dt className="font-semibold text-slate-900 dark:text-slate-100">3. Ambang Magnitudo</dt>
                <dd className="font-mono text-slate-600 dark:text-slate-400 mt-1">
                  Magnitudo &ge; 6.5 – 7.0
                </dd>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                <dt className="font-semibold text-slate-900 dark:text-slate-100">4. Tingkat Peringatan InaTEWS</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">
                  Waspada · Siaga · Awas · Pengakhiran
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
};
