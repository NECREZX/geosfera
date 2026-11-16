import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { EventDetailDrawer } from './components/EventDetailDrawer';
import { Layout } from './components/Layout';
import { fetchBmkgDataset } from './services/bmkgService';
import type { AppSettings, BmkgDataset, EarthquakeEvent, MenuId } from './types/bmkg';
import { AnalysisView } from './views/AnalysisView';
import { DashboardView } from './views/DashboardView';
import { EarthquakeMapView } from './views/EarthquakeMapView';
import { HazardZonesView } from './views/HazardZonesView';
import { HistoryView } from './views/HistoryView';
import { MitigationView } from './views/MitigationView';
import { SettingsView } from './views/SettingsView';
import { TsunamiView } from './views/TsunamiView';

const SETTINGS_STORAGE_KEY = 'geosfera_bmkg_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  timezone: 'WIB',
  autoRefreshSeconds: 60,
  defaultBasemap: 'esri_topo',
  compactTable: false,
  notificationsEnabled: false,
  minNotifyMagnitude: 5.0,
  soundAlertEnabled: false,
};

function normalizeStoredBasemap(value: string | undefined): AppSettings['defaultBasemap'] {
  if (value === 'osm' || value === 'esri_street' || value === 'esri_imagery' || value === 'esri_topo') {
    return value;
  }
  return 'esri_topo';
}

function playAlertTone() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Ignore audio context restrictions
  }
}

export default function App() {
  const [activeMenu, setActiveMenu] = useState<MenuId>('dashboard');
  const [dataset, setDataset] = useState<BmkgDataset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inspectedEvent, setInspectedEvent] = useState<EarthquakeEvent | null>(null);
  const [mapFocusEvent, setMapFocusEvent] = useState<EarthquakeEvent | null>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!saved) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(saved) as Partial<AppSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        defaultBasemap: normalizeStoredBasemap(parsed.defaultBasemap),
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const lastKnownLatestIdRef = useRef<string | null>(null);

  // Sync Tailwind dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage write failures
      }
      return next;
    });
  }, []);

  const loadData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setIsRefreshing(true);
      }
      try {
        const data = await fetchBmkgDataset();
        setDataset(data);
        setErrorMsg(null);

        const latest = data.latestAutoGempa;
        if (latest) {
          if (
            lastKnownLatestIdRef.current &&
            lastKnownLatestIdRef.current !== latest.id &&
            latest.magnitude >= settings.minNotifyMagnitude
          ) {
            if (settings.soundAlertEnabled) {
              playAlertTone();
            }
            if (
              settings.notificationsEnabled &&
              typeof Notification !== 'undefined' &&
              Notification.permission === 'granted'
            ) {
              new Notification(`Gempa M ${latest.magnitude.toFixed(1)} · BMKG`, {
                body: `${latest.wilayah} (Kedalaman ${latest.depthKm} km)`,
              });
            }
          }
          lastKnownLatestIdRef.current = latest.id;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal memuat data real-time dari server BMKG.';
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [settings.minNotifyMagnitude, settings.notificationsEnabled, settings.soundAlertEnabled]
  );

  // Initial fetch
  useEffect(() => {
    void loadData(false);
  }, [loadData]);

  // Auto-refresh timer
  useEffect(() => {
    if (!settings.autoRefreshSeconds) return;
    const timer = setInterval(() => {
      void loadData(true);
    }, settings.autoRefreshSeconds * 1000);
    return () => clearInterval(timer);
  }, [settings.autoRefreshSeconds, loadData]);

  const handleLocateOnMap = (ev: EarthquakeEvent) => {
    setMapFocusEvent(ev);
    setActiveMenu('peta');
  };

  const hasTsunamiAlert = Boolean(
    dataset?.allEvents.some((e) => e.tsunamiStatus === 'Berpotensi Tsunami') ||
      (dataset?.capAlert?.potential || '').toLowerCase().includes('berpotensi tsunami')
  );

  return (
    <Layout
      activeMenu={activeMenu}
      onSelectMenu={setActiveMenu}
      fetchedAt={dataset?.fetchedAt || null}
      timezone={settings.timezone}
      isRefreshing={isRefreshing}
      onRefresh={() => void loadData(false)}
      hasTsunamiAlert={hasTsunamiAlert}
    >
      {isLoading && !dataset ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-[360px] rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="lg:col-span-5 h-[360px] rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[124px] rounded-lg bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      ) : errorMsg && !dataset ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center max-w-lg mx-auto my-12">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Koneksi Data BMKG Gagal
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">{errorMsg}</p>
          <button
            type="button"
            onClick={() => void loadData(false)}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium bg-sky-700 hover:bg-sky-800 text-white cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Coba Hubungkan Ulang</span>
          </button>
        </div>
      ) : dataset ? (
        <>
          {activeMenu === 'dashboard' && (
            <DashboardView
              dataset={dataset}
              timezone={settings.timezone}
              basemap={settings.defaultBasemap}
              onSelectEvent={setInspectedEvent}
              onNavigate={setActiveMenu}
            />
          )}

          {activeMenu === 'peta' && (
            <EarthquakeMapView
              events={dataset.allEvents}
              latestEventId={dataset.latestAutoGempa?.id}
              timezone={settings.timezone}
              defaultBasemap={settings.defaultBasemap}
              initialSelectedEvent={mapFocusEvent}
              onInspectEvent={setInspectedEvent}
            />
          )}

          {activeMenu === 'riwayat' && (
            <HistoryView
              events={dataset.allEvents}
              timezone={settings.timezone}
              compactTable={settings.compactTable}
              onSelectEvent={setInspectedEvent}
            />
          )}

          {activeMenu === 'analisis' && (
            <AnalysisView events={dataset.allEvents} timezone={settings.timezone} />
          )}

          {activeMenu === 'kerawanan' && (
            <HazardZonesView
              events={dataset.allEvents}
              timezone={settings.timezone}
              basemap={settings.defaultBasemap}
              onSelectEvent={setInspectedEvent}
            />
          )}

          {activeMenu === 'tsunami' && (
            <TsunamiView
              dataset={dataset}
              timezone={settings.timezone}
              onSelectEvent={setInspectedEvent}
            />
          )}

          {activeMenu === 'mitigasi' && <MitigationView />}

          {activeMenu === 'pengaturan' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={updateSettings}
              onTestAlertSound={playAlertTone}
            />
          )}
        </>
      ) : null}

      <EventDetailDrawer
        event={inspectedEvent}
        timezone={settings.timezone}
        onClose={() => setInspectedEvent(null)}
        onLocateOnMap={handleLocateOnMap}
      />
    </Layout>
  );
}
