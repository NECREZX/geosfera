import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { exportEventsToCsv, formatEventTime } from '../services/bmkgService';
import type { EarthquakeEvent, TimezoneOption } from '../types/bmkg';

interface HistoryViewProps {
  events: EarthquakeEvent[];
  timezone: TimezoneOption;
  compactTable: boolean;
  onSelectEvent: (event: EarthquakeEvent) => void;
}

const REGION_OPTIONS = [
  'Semua Wilayah',
  'Sumatera',
  'Jawa',
  'Bali & Nusa Tenggara',
  'Sulawesi',
  'Maluku & Laut Banda',
  'Papua',
  'Kalimantan',
];

export const HistoryView: React.FC<HistoryViewProps> = ({
  events,
  timezone,
  compactTable,
  onSelectEvent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('Semua Wilayah');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minMag, setMinMag] = useState<number>(0);
  const [onlyFelt, setOnlyFelt] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const fromMs = dateFrom ? Date.parse(`${dateFrom}T00:00:00`) : null;
    const toMs = dateTo ? Date.parse(`${dateTo}T23:59:59`) : null;

    return events.filter((ev) => {
      if (regionFilter !== 'Semua Wilayah' && ev.regionGroup !== regionFilter) return false;
      if (ev.magnitude < minMag) return false;
      if (onlyFelt && !ev.isFelt) return false;
      if (fromMs && ev.timestampMs < fromMs) return false;
      if (toMs && ev.timestampMs > toMs) return false;
      if (q) {
        const hay = `${ev.wilayah} ${ev.regionGroup} ${ev.dirasakan} ${ev.potensi}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, searchQuery, regionFilter, dateFrom, dateTo, minMag, onlyFelt]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedEvents = filteredEvents.slice((safePage - 1) * pageSize, safePage * pageSize);

  const rowPadding = compactTable ? 'py-2 px-4' : 'py-3 px-4';

  return (
    <div className="space-y-5">
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Cari Wilayah / MMI
            </label>
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Nama wilayah atau kota..."
                className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Wilayah
            </label>
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
            >
              {REGION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Magnitudo:</span>
              <div className="flex items-center gap-1 p-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                {[0, 3, 4, 5].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMinMag(m);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                      minMag === m
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {m === 0 ? 'Semua' : `≥${m}.0`}
                  </button>
                ))}
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyFelt}
                onChange={(e) => {
                  setOnlyFelt(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
              />
              <span>Hanya Gempa Dirasakan</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
              {filteredEvents.length} Kejadian
            </span>
            <button
              type="button"
              onClick={() => exportEventsToCsv(filteredEvents, timezone)}
              disabled={filteredEvents.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
            Daftar Kejadian Gempa Bumi
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-medium text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Waktu ({timezone})</th>
                <th className="py-3 px-4 text-right">Magnitudo</th>
                <th className="py-3 px-4 text-right">Kedalaman</th>
                <th className="py-3 px-4">Koordinat</th>
                <th className="py-3 px-4">Wilayah Episenter</th>
                <th className="py-3 px-4">Koridor</th>
                <th className="py-3 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
              {pagedEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center text-sm font-medium text-slate-500">
                    Data Tidak Ditemukan
                  </td>
                </tr>
              ) : (
                pagedEvents.map((ev) => {
                  const t = formatEventTime(ev.timestampMs, timezone);
                  return (
                    <tr
                      key={ev.id}
                      onClick={() => onSelectEvent(ev)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className={`${rowPadding} font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap`}>
                        {t.tanggal} · {t.jam.replace(` ${timezone}`, '')}
                      </td>
                      <td
                        className={`${rowPadding} font-mono font-semibold tabular-nums text-right whitespace-nowrap ${
                          ev.magnitude >= 6.0
                            ? 'text-red-700 dark:text-red-400'
                            : ev.magnitude >= 5.0
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        M {ev.magnitude.toFixed(1)}
                      </td>
                      <td className={`${rowPadding} font-mono tabular-nums text-right text-slate-700 dark:text-slate-300 whitespace-nowrap`}>
                        {ev.depthKm} km
                      </td>
                      <td className={`${rowPadding} font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap`}>
                        {ev.lintangStr}, {ev.bujurStr}
                      </td>
                      <td className={`${rowPadding} font-medium text-slate-900 dark:text-slate-100 max-w-[280px] truncate`}>
                        {ev.wilayah}
                      </td>
                      <td className={`${rowPadding} text-slate-600 dark:text-slate-400 whitespace-nowrap`}>
                        {ev.regionGroup}
                      </td>
                      <td className={`${rowPadding} text-xs text-slate-600 dark:text-slate-400 max-w-[240px] truncate`}>
                        {ev.dirasakan || ev.tsunamiStatus}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredEvents.length > pageSize && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
              Halaman {safePage} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
