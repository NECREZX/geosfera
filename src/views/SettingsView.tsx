import React, { useState } from 'react';
import { Bell, Database, ExternalLink, Monitor } from 'lucide-react';
import type { AppSettings, MapBasemap, TimezoneOption } from '../types/bmkg';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onTestAlertSound: () => void;
}

const BMKG_SOURCES = [
  {
    name: 'BMKG TEWS Autogempa',
    url: 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json',
  },
  {
    name: 'BMKG TEWS Gempa M ≥ 5.0 (Gempaterkini)',
    url: 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json',
  },
  {
    name: 'BMKG TEWS Gempa Dirasakan (Gempadirasakan)',
    url: 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json',
  },
  {
    name: 'BMKG InaTEWS GeoJSON (GempaQL)',
    url: 'https://bmkg-content-inatews.storage.googleapis.com/gempaQL.json',
  },
  {
    name: 'BMKG InaTEWS CAP Alert (Datagempa)',
    url: 'https://bmkg-content-inatews.storage.googleapis.com/datagempa.json',
  },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onTestAlertSound,
}) => {
  const [notifPermission, setNotifPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      onUpdateSettings({ notificationsEnabled: perm === 'granted' });
      return;
    }
    onUpdateSettings({ notificationsEnabled: enabled });
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Monitor className="h-4 w-4 text-sky-700 dark:text-sky-400" />
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Preferensi Tampilan
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Tema Antarmuka
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(['light', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: t })}
                    className={`py-2.5 px-4 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                      settings.theme === t
                        ? 'border-sky-700 bg-sky-50 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t === 'light' ? 'Mode Terang' : 'Mode Gelap'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Zona Waktu
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {(['WIB', 'WITA', 'WIT', 'UTC'] as TimezoneOption[]).map((tz) => (
                  <button
                    key={tz}
                    type="button"
                    onClick={() => onUpdateSettings({ timezone: tz })}
                    className={`py-2 px-3 rounded-md border text-xs font-mono font-medium transition-colors cursor-pointer ${
                      settings.timezone === tz
                        ? 'border-sky-700 bg-sky-50 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tz}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Peta Dasar Default
              </h3>
              <select
                value={settings.defaultBasemap}
                onChange={(e) => onUpdateSettings({ defaultBasemap: e.target.value as MapBasemap })}
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="esri_topo">Topografi (Esri Topo)</option>
                <option value="osm">Peta Standar (OSM)</option>
                <option value="esri_street">Peta Jalan (Esri Street)</option>
                <option value="esri_imagery">Citra Satelit (Esri Satellite)</option>
              </select>
            </div>

            <label className="flex items-center justify-between gap-3 pt-2 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Tampilan Tabel Ringkas
              </span>
              <input
                type="checkbox"
                checked={settings.compactTable}
                onChange={(e) => onUpdateSettings({ compactTable: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
              />
            </label>
          </div>
        </div>

        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Bell className="h-4 w-4 text-sky-700 dark:text-sky-400" />
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Pengaturan Notifikasi
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Interval Pembaruan Otomatis
              </h3>
              <select
                value={settings.autoRefreshSeconds}
                onChange={(e) =>
                  onUpdateSettings({
                    autoRefreshSeconds: Number(e.target.value) as 0 | 30 | 60 | 300,
                  })
                }
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value={30}>30 Detik</option>
                <option value={60}>1 Menit</option>
                <option value={300}>5 Menit</option>
                <option value={0}>Manual</option>
              </select>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ambang Batas Magnitudo Notifikasi
              </h3>
              <select
                value={settings.minNotifyMagnitude}
                onChange={(e) => onUpdateSettings({ minNotifyMagnitude: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value={4.0}>M &ge; 4.0</option>
                <option value={5.0}>M &ge; 5.0</option>
                <option value={6.0}>M &ge; 6.0</option>
              </select>
            </div>

            <label className="flex items-center justify-between gap-3 pt-1 cursor-pointer">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Notifikasi Browser ({notifPermission})
              </span>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => void handleToggleNotifications(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
              />
            </label>

            <div className="flex items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundAlertEnabled}
                  onChange={(e) => onUpdateSettings({ soundAlertEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Nada Peringatan Audio
                </span>
              </label>
              <button
                type="button"
                onClick={onTestAlertSound}
                className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap cursor-pointer"
              >
                Uji Nada
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
          <Database className="h-5 w-5 text-sky-700 dark:text-sky-400 shrink-0" />
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Sumber Data Resmi: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
          </h2>
        </div>

        <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
          {BMKG_SOURCES.map((src) => (
            <div
              key={src.url}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {src.name}
              </h3>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-sky-700 dark:text-sky-400 hover:underline shrink-0"
              >
                <span className="truncate max-w-[290px] sm:max-w-none">{src.url.replace('https://', '')}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
