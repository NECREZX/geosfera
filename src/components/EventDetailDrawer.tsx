import React, { useEffect, useState } from 'react';
import { Compass, ExternalLink, MapPin, X } from 'lucide-react';
import { formatEventTime, getDirectShakemapUrl, getShakemapUrl } from '../services/bmkgService';
import type { EarthquakeEvent, TimezoneOption } from '../types/bmkg';

interface EventDetailDrawerProps {
  event: EarthquakeEvent | null;
  timezone: TimezoneOption;
  onClose: () => void;
  onLocateOnMap?: (event: EarthquakeEvent) => void;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  event,
  timezone,
  onClose,
  onLocateOnMap,
}) => {
  const [imgFallbackDirect, setImgFallbackDirect] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFallbackDirect(false);
    setImgFailed(false);
  }, [event?.id]);

  if (!event) return null;

  const formatted = formatEventTime(event.timestampMs, timezone);
  const shakemapSrc = imgFallbackDirect
    ? getDirectShakemapUrl(event.shakemapFile)
    : getShakemapUrl(event.shakemapFile);

  const magColor =
    event.magnitude >= 6.0
      ? 'text-red-700 dark:text-red-400'
      : event.magnitude >= 5.0
      ? 'text-amber-700 dark:text-amber-400'
      : 'text-sky-700 dark:text-sky-400';

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative z-10 w-full max-w-[460px] h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Detail Parameter Gempa · M {event.magnitude.toFixed(1)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Tutup panel detail"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-3 gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Magnitudo</div>
              <div className={`font-mono text-2xl font-bold tabular-nums mt-0.5 ${magColor}`}>
                {event.magnitude.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Kedalaman</div>
              <div className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                {event.depthKm} <span className="text-xs font-normal text-slate-500">km</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Klasifikasi</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2">
                {event.depthCategory}
              </div>
            </div>
          </div>

          <dl className="space-y-3.5 text-sm">
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Lokasi Episenter</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100 mt-0.5 flex items-start gap-2">
                <MapPin className="h-4 w-4 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
                <span>{event.wilayah}</span>
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Waktu Kejadian</dt>
                <dd className="font-mono text-xs sm:text-sm tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatted.tanggal}
                  <br />
                  {formatted.jam}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Koordinat</dt>
                <dd className="font-mono text-xs sm:text-sm tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                  {event.lintangStr}
                  <br />
                  {event.bujurStr}
                </dd>
              </div>
            </div>

            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">Potensi Tsunami</dt>
              <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                {event.potensi || event.tsunamiStatus}
              </dd>
            </div>

            {event.dirasakan && (
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Skala Intensitas MMI</dt>
                <dd className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">
                  {event.dirasakan}
                </dd>
              </div>
            )}

            {event.instruction && (
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Arahan BMKG</dt>
                <dd className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">
                  {event.instruction}
                </dd>
              </div>
            )}
          </dl>

          {shakemapSrc && !imgFailed && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Peta Guncangan BMKG (Shakemap)
                </h3>
                <a
                  href={getDirectShakemapUrl(event.shakemapFile) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-sky-700 dark:text-sky-400 hover:underline"
                >
                  <span>Buka Gambar</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                <img
                  src={shakemapSrc}
                  alt={`Shakemap ${event.wilayah}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-contain"
                  onError={() => {
                    if (!imgFallbackDirect) {
                      setImgFallbackDirect(true);
                    } else {
                      setImgFailed(true);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            BMKG ({event.sourceFeed})
          </span>
          {onLocateOnMap && (
            <button
              type="button"
              onClick={() => {
                onLocateOnMap(event);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium bg-sky-700 hover:bg-sky-800 text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Tampilkan di Peta Gempa</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};
