import React, { useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { SeismicMap } from '../components/SeismicMap';
import { computeHazardZones, formatEventTime } from '../services/bmkgService';
import type { EarthquakeEvent, MapBasemap, SeismicZoneComputed, TimezoneOption } from '../types/bmkg';

interface HazardZonesViewProps {
  events: EarthquakeEvent[];
  timezone: TimezoneOption;
  basemap: MapBasemap;
  onSelectEvent: (event: EarthquakeEvent) => void;
}

type RiskFilter = 'Semua' | 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah';

const RISK_STYLE: Record<Exclude<RiskFilter, 'Semua'>, string> = {
  'Sangat Tinggi': 'text-red-700 dark:text-red-400',
  Tinggi: 'text-orange-700 dark:text-orange-400',
  Sedang: 'text-amber-700 dark:text-amber-400',
  Rendah: 'text-sky-700 dark:text-sky-400',
};

export const HazardZonesView: React.FC<HazardZonesViewProps> = ({
  events,
  timezone,
  basemap,
  onSelectEvent,
}) => {
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('Semua');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('sumatera-tengah-selatan');
  const [focusCenter, setFocusCenter] = useState<[number, number] | null>(null);
  const [focusZoom, setFocusZoom] = useState<number>(5);

  const zones = useMemo(() => computeHazardZones(events), [events]);

  const filteredZones = useMemo(() => {
    if (riskFilter === 'Semua') return zones;
    return zones.filter((z) => z.dynamicHazardLevel === riskFilter);
  }, [zones, riskFilter]);

  const activeZone: SeismicZoneComputed | null =
    zones.find((z) => z.id === selectedZoneId) || filteredZones[0] || zones[0] || null;

  const classCounts = useMemo(() => {
    return {
      sangatTinggi: zones.filter((z) => z.dynamicHazardLevel === 'Sangat Tinggi').length,
      tinggi: zones.filter((z) => z.dynamicHazardLevel === 'Tinggi').length,
      sedang: zones.filter((z) => z.dynamicHazardLevel === 'Sedang').length,
      rendah: zones.filter((z) => z.dynamicHazardLevel === 'Rendah').length,
    };
  }, [zones]);

  const handleSelectZone = (zone: SeismicZoneComputed) => {
    setSelectedZoneId(zone.id);
    setFocusCenter(zone.center);
    setFocusZoom(6);
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Zona Sangat Tinggi
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-red-700 dark:text-red-400 my-2">
            {classCounts.sangatTinggi}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Megathrust &amp; Sesar Aktif
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Zona Tinggi
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-orange-700 dark:text-orange-400 my-2">
            {classCounts.tinggi}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Subduksi &amp; Sesar Darat
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Zona Sedang
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-amber-700 dark:text-amber-400 my-2">
            {classCounts.sedang}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Sesar Lokal
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Zona Rendah
          </h3>
          <div className="font-mono text-3xl font-bold tabular-nums text-sky-700 dark:text-sky-400 my-2">
            {classCounts.rendah}
          </div>
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Stabil Relatif
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              Peta Tingkat Kerawanan Gempa
            </h2>
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="inline-flex items-center gap-1.5 text-red-700 dark:text-red-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-600/60 inline-block" /> Sangat Tinggi
              </span>
              <span className="inline-flex items-center gap-1.5 text-orange-700 dark:text-orange-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-orange-500/60 inline-block" /> Tinggi
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/60 inline-block" /> Sedang
              </span>
              <span className="inline-flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-sky-600/60 inline-block" /> Rendah
              </span>
            </div>
          </div>

          <SeismicMap
            events={events.slice(0, 250)}
            onSelectEvent={onSelectEvent}
            basemap={basemap}
            showAdminLayer={true}
            showTectonicLayer={true}
            hazardMode={true}
            timezone={timezone}
            heightClass="h-[460px]"
            focusCenter={focusCenter}
            focusZoom={focusZoom}
          />
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          {activeZone ? (
            <>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                    {activeZone.name}
                  </h2>
                  <ShieldAlert className={`h-5 w-5 shrink-0 ${RISK_STYLE[activeZone.dynamicHazardLevel]}`} />
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Klasifikasi Zona</h3>
                    <div className={`text-sm font-bold mt-0.5 ${RISK_STYLE[activeZone.dynamicHazardLevel]}`}>
                      {activeZone.dynamicHazardLevel}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">Paparan Tsunami</h3>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {activeZone.coastalTsunamiExposure}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block">Gempa</span>
                    <span className="font-mono text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {activeZone.eventCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block">Mag. Maks</span>
                    <span className="font-mono text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {activeZone.maxMagnitude > 0 ? activeZone.maxMagnitude.toFixed(1) : '-'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block">Dangkal</span>
                    <span className="font-mono text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {activeZone.shallowCount}
                    </span>
                  </div>
                </div>

                <dl className="space-y-3 text-xs">
                  <div>
                    <dt className="font-semibold text-slate-800 dark:text-slate-200">
                      Pemicu Tektonik
                    </dt>
                    <dd className="text-slate-600 dark:text-slate-400 mt-0.5">{activeZone.tectonicDriver}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-800 dark:text-slate-200">
                      Potensi Dampak
                    </dt>
                    <dd className="text-slate-600 dark:text-slate-400 mt-0.5">{activeZone.potentialImpact}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-800 dark:text-slate-200">
                      Provinsi Terkait
                    </dt>
                    <dd className="text-slate-600 dark:text-slate-400 mt-0.5">
                      {activeZone.provinces.join(' · ')}
                    </dd>
                  </div>
                </dl>
              </div>

              {activeZone.latestEvent && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Kejadian Terbaru
                  </h3>
                  <button
                    type="button"
                    onClick={() => onSelectEvent(activeZone.latestEvent!)}
                    className="mt-1 w-full text-left text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    M {activeZone.latestEvent.magnitude.toFixed(1)} ·{' '}
                    {formatEventTime(activeZone.latestEvent.timestampMs, timezone).tanggal} —{' '}
                    {activeZone.latestEvent.wilayah}
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
            Informasi Wilayah Berisiko &amp; Potensi Dampak
          </h2>
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-md bg-slate-100 dark:bg-slate-800">
            {(['Semua', 'Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah'] as RiskFilter[]).map((rf) => (
              <button
                key={rf}
                type="button"
                onClick={() => setRiskFilter(rf)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  riskFilter === rf
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {rf}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs font-medium text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Wilayah</th>
                <th className="py-3 px-4">Klasifikasi</th>
                <th className="py-3 px-4">Sesar Dominan</th>
                <th className="py-3 px-4 text-right">Kejadian</th>
                <th className="py-3 px-4 text-right">Mag. Maks</th>
                <th className="py-3 px-4 text-right">Kedalaman Rata-Rata</th>
                <th className="py-3 px-4">Potensi Dampak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
              {filteredZones.map((zone) => {
                const isSelected = zone.id === activeZone?.id;
                return (
                  <tr
                    key={zone.id}
                    onClick={() => handleSelectZone(zone)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-50/70 dark:bg-sky-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {zone.name}
                    </td>
                    <td className={`py-3 px-4 font-semibold whitespace-nowrap ${RISK_STYLE[zone.dynamicHazardLevel]}`}>
                      {zone.dynamicHazardLevel}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300 max-w-[220px]">
                      {zone.dominantFault}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900 dark:text-slate-100">
                      {zone.eventCount}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900 dark:text-slate-100">
                      {zone.maxMagnitude > 0 ? `M ${zone.maxMagnitude.toFixed(1)}` : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-700 dark:text-slate-300">
                      {zone.avgDepthKm > 0 ? `${zone.avgDepthKm} km` : '-'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-[300px]">
                      {zone.potentialImpact}
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
