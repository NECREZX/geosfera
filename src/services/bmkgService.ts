import { SEISMIC_ZONES } from '../data/seismicZones';
import type {
  BmkgAutoGempaRaw,
  BmkgCapAlertRaw,
  BmkgDataset,
  BmkgGeoJsonFeature,
  BmkgLast30EventItem,
  DepthCategory,
  EarthquakeEvent,
  SeismicZoneComputed,
  TimezoneOption,
  TsunamiStatus,
} from '../types/bmkg';

const DIRECT_ENDPOINTS = {
  autogempa: 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json',
  gempaterkini: 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json',
  gempadirasakan: 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json',
  gempaql: 'https://bmkg-content-inatews.storage.googleapis.com/gempaQL.json',
  datagempa: 'https://bmkg-content-inatews.storage.googleapis.com/datagempa.json',
};

export function classifyDepth(depthKm: number): DepthCategory {
  if (depthKm <= 60) return 'Dangkal';
  if (depthKm <= 300) return 'Menengah';
  return 'Dalam';
}

export function classifyTsunamiStatus(potensi: string | undefined, magnitude: number, depthKm: number): TsunamiStatus {
  const text = (potensi || '').toLowerCase();
  if (text.includes('tidak berpotensi tsunami')) return 'Tidak Berpotensi Tsunami';
  if (text.includes('berpotensi tsunami') || text.includes('peringatan dini tsunami')) {
    return 'Berpotensi Tsunami';
  }
  if (magnitude >= 6.5 && depthKm <= 70) {
    return 'Pemantauan Pesisir';
  }
  if (text.includes('dirasakan') || text.includes('diteruskan')) {
    return 'Tidak Berpotensi Tsunami';
  }
  return 'Belum Terklasifikasi';
}

export function parseMagnitude(raw: string | number | undefined): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  const parsed = parseFloat(String(raw || '0').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseDepthKm(raw: string | number | undefined): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 10;
  const match = String(raw || '').replace(',', '.').match(/[\d.]+/);
  const parsed = match ? parseFloat(match[0]) : 10;
  return Number.isFinite(parsed) ? parsed : 10;
}

export function parseCoordinates(coordStr: string | undefined, latFirst = true): [number, number] {
  if (!coordStr) return [0, 0];
  const parts = coordStr.split(',').map((s) => parseFloat(s.trim()));
  if (parts.length < 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) {
    return [0, 0];
  }
  return latFirst ? [parts[0], parts[1]] : [parts[1], parts[0]];
}

export function formatCoordLabel(lat: number, lng: number): { lintang: string; bujur: string } {
  const lintang = `${Math.abs(lat).toFixed(2)} ${lat < 0 ? 'LS' : 'LU'}`;
  const bujur = `${Math.abs(lng).toFixed(2)} ${lng >= 0 ? 'BT' : 'BB'}`;
  return { lintang, bujur };
}

export function classifyRegionGroup(wilayah: string, lat: number, lng: number): string {
  const text = wilayah.toLowerCase();
  if (
    text.includes('aceh') ||
    text.includes('sumatera') ||
    text.includes('sumatra') ||
    text.includes('nias') ||
    text.includes('mentawai') ||
    text.includes('simeulue') ||
    text.includes('bengkulu') ||
    text.includes('lampung') ||
    text.includes('jambi') ||
    text.includes('selat sunda') ||
    text.includes('padang') ||
    text.includes('medan') ||
    text.includes('tanggamus') ||
    text.includes('enggano')
  ) {
    return 'Sumatera';
  }
  if (
    text.includes('jawa') ||
    text.includes('java') ||
    text.includes('banten') ||
    text.includes('jakarta') ||
    text.includes('bandung') ||
    text.includes('sukabumi') ||
    text.includes('cianjur') ||
    text.includes('garut') ||
    text.includes('cilacap') ||
    text.includes('yogyakarta') ||
    text.includes('bantul') ||
    text.includes('pacitan') ||
    text.includes('malang') ||
    text.includes('banyuwangi')
  ) {
    return 'Jawa';
  }
  if (
    text.includes('bali') ||
    text.includes('lombok') ||
    text.includes('sumbawa') ||
    text.includes('bima') ||
    text.includes('flores') ||
    text.includes('sumba') ||
    text.includes('kupang') ||
    text.includes('timor') ||
    text.includes('alor') ||
    text.includes('ntb') ||
    text.includes('ntt') ||
    text.includes('nusa tenggara') ||
    text.includes('manggarai') ||
    text.includes('ende') ||
    text.includes('maumere')
  ) {
    return 'Bali & Nusa Tenggara';
  }
  if (
    text.includes('sulawesi') ||
    text.includes('gorontalo') ||
    text.includes('manado') ||
    text.includes('minahasa') ||
    text.includes('palu') ||
    text.includes('poso') ||
    text.includes('mamuju') ||
    text.includes('luwu') ||
    text.includes('kendari') ||
    text.includes('sangihe') ||
    text.includes('talaud') ||
    text.includes('bolaang') ||
    text.includes('bone') ||
    text.includes('makassar')
  ) {
    return 'Sulawesi';
  }
  if (
    text.includes('maluku') ||
    text.includes('malut') ||
    text.includes('halmahera') ||
    text.includes('ternate') ||
    text.includes('ambon') ||
    text.includes('seram') ||
    text.includes('buru') ||
    text.includes('tanimbar') ||
    text.includes('saumlaki') ||
    text.includes('banda') ||
    text.includes('tual') ||
    text.includes('morotai') ||
    text.includes('obi')
  ) {
    return 'Maluku & Laut Banda';
  }
  if (
    text.includes('papua') ||
    text.includes('sorong') ||
    text.includes('manokwari') ||
    text.includes('jayapura') ||
    text.includes('nabire') ||
    text.includes('biak') ||
    text.includes('sarmi') ||
    text.includes('kaimana') ||
    text.includes('fakfak') ||
    text.includes('merauke') ||
    text.includes('irian') ||
    text.includes('cenderawasih')
  ) {
    return 'Papua';
  }
  if (text.includes('kalimantan') || text.includes('borneo') || text.includes('tarakan') || text.includes('berau')) {
    return 'Kalimantan';
  }

  // Coordinate fallback if region name is generic English or sea name
  if (lng < 105.6 && lat > -7.5) return 'Sumatera';
  if (lng >= 105.0 && lng < 114.6 && lat < -5.2) return 'Jawa';
  if (lng >= 114.6 && lng < 125.5 && lat < -7.0) return 'Bali & Nusa Tenggara';
  if (lng >= 108.0 && lng < 119.0 && lat >= -4.2) return 'Kalimantan';
  if (lng >= 118.0 && lng < 126.0 && lat >= -6.5) return 'Sulawesi';
  if (lng >= 125.0 && lng < 133.5) return 'Maluku & Laut Banda';
  if (lng >= 133.5) return 'Papua';
  return 'Lainnya';
}

export function formatEventTime(timestampMs: number, tz: TimezoneOption): { tanggal: string; jam: string; full: string } {
  const offsetHours: Record<TimezoneOption, number> = {
    WIB: 7,
    WITA: 8,
    WIT: 9,
    UTC: 0,
  };
  const shifted = new Date(timestampMs + offsetHours[tz] * 3600_000);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = String(shifted.getUTCDate()).padStart(2, '0');
  const month = months[shifted.getUTCMonth()];
  const year = shifted.getUTCFullYear();
  const hh = String(shifted.getUTCHours()).padStart(2, '0');
  const mm = String(shifted.getUTCMinutes()).padStart(2, '0');
  const ss = String(shifted.getUTCSeconds()).padStart(2, '0');
  const tanggal = `${day} ${month} ${year}`;
  const jam = `${hh}:${mm}:${ss} ${tz}`;
  return { tanggal, jam, full: `${tanggal} · ${jam}` };
}

function parseBmkgGeoJsonTime(rawTime: string): number {
  // Format from gempaQL.json is UTC: "2026-11-16 22:21:27.474967"
  const clean = rawTime.trim().replace(' ', 'T').split('.')[0] + 'Z';
  const ts = Date.parse(clean);
  return Number.isFinite(ts) ? ts : Date.now();
}

function parseCapTime(dateStr: string, timeStr: string): number {
  // dateStr: "17-11-26" (DD-MM-YY) or "17 Nov 2026", timeStr: "04:11:20 WIB"
  const ddmmyy = dateStr.match(/^(\d{2})-(\d{2})-(\d{2,4})$/);
  const hms = timeStr.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (ddmmyy && hms) {
    const day = Number(ddmmyy[1]);
    const month = Number(ddmmyy[2]) - 1;
    const yearRaw = Number(ddmmyy[3]);
    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
    const hour = Number(hms[1]);
    const min = Number(hms[2]);
    const sec = Number(hms[3]);
    // WIB is UTC+7
    const tzOffset = timeStr.includes('WITA') ? 8 : timeStr.includes('WIT') ? 9 : 7;
    return Date.UTC(year, month, day, hour - tzOffset, min, sec);
  }
  return Date.now();
}

function normalizeBmkgStandardEvent(
  raw: BmkgAutoGempaRaw,
  sourceFeed: 'autogempa' | 'gempaterkini' | 'gempadirasakan'
): EarthquakeEvent {
  const [lat, lng] = parseCoordinates(raw.Coordinates, true);
  const magnitude = parseMagnitude(raw.Magnitude);
  const depthKm = parseDepthKm(raw.Kedalaman);
  const ts = Date.parse(raw.DateTime) || Date.now();
  const wilayah = raw.Wilayah || 'Wilayah Indonesia';
  const potensi = raw.Potensi || '';
  const dirasakan = raw.Dirasakan || '';
  return {
    id: `${Math.round(ts / 1000)}_${lat.toFixed(2)}_${lng.toFixed(2)}`,
    timestampMs: ts,
    isoDateTime: new Date(ts).toISOString(),
    tanggalLabel: raw.Tanggal,
    jamLabel: raw.Jam,
    latitude: lat,
    longitude: lng,
    lintangStr: raw.Lintang,
    bujurStr: raw.Bujur,
    magnitude,
    depthKm,
    depthCategory: classifyDepth(depthKm),
    wilayah,
    regionGroup: classifyRegionGroup(wilayah, lat, lng),
    potensi,
    tsunamiStatus: classifyTsunamiStatus(potensi, magnitude, depthKm),
    dirasakan,
    shakemapFile: raw.Shakemap,
    sourceFeed,
    isFelt: Boolean(dirasakan && dirasakan.trim().length > 0) || sourceFeed === 'gempadirasakan',
    isM5Plus: magnitude >= 5.0 || sourceFeed === 'gempaterkini',
  };
}

function normalizeGeoJsonFeature(feature: BmkgGeoJsonFeature): EarthquakeEvent {
  const [lngRaw, latRaw] = feature.geometry.coordinates;
  const lng = parseMagnitude(lngRaw);
  const lat = parseMagnitude(latRaw);
  const magnitude = Number(parseMagnitude(feature.properties.mag).toFixed(1));
  const depthKm = Math.max(1, Math.round(parseDepthKm(feature.properties.depth)));
  const ts = parseBmkgGeoJsonTime(feature.properties.time);
  const coords = formatCoordLabel(lat, lng);
  const formatted = formatEventTime(ts, 'WIB');
  const wilayah = feature.properties.place || 'Indonesia';
  return {
    id: feature.properties.id || `${Math.round(ts / 1000)}_${lat.toFixed(2)}_${lng.toFixed(2)}`,
    timestampMs: ts,
    isoDateTime: new Date(ts).toISOString(),
    tanggalLabel: formatted.tanggal,
    jamLabel: formatted.jam,
    latitude: lat,
    longitude: lng,
    lintangStr: coords.lintang,
    bujurStr: coords.bujur,
    magnitude,
    depthKm,
    depthCategory: classifyDepth(depthKm),
    wilayah,
    regionGroup: classifyRegionGroup(wilayah, lat, lng),
    potensi:
      magnitude >= 6.5 && depthKm <= 70
        ? 'Memerlukan pemantauan parameter potensi tsunami InaTEWS'
        : 'Tidak berpotensi tsunami',
    tsunamiStatus: classifyTsunamiStatus(undefined, magnitude, depthKm),
    dirasakan: '',
    sourceFeed: 'gempaql',
    isFelt: false,
    isM5Plus: magnitude >= 5.0,
    faseCount: feature.properties.fase ? Number(feature.properties.fase) : undefined,
  };
}

function normalizeLast30Item(item: BmkgLast30EventItem): EarthquakeEvent {
  // CAP coordinates are "lng,lat"
  const [lat, lng] = parseCoordinates(item.coordinates, false);
  const magnitude = parseMagnitude(item.magnitude);
  const depthKm = parseDepthKm(item.depth);
  const ts = parseCapTime(item.date, item.time);
  const formatted = formatEventTime(ts, 'WIB');
  const coords = formatCoordLabel(lat, lng);
  const wilayah = item.area || 'Indonesia';
  const potensi = item.potential || '';
  return {
    id: item.eventid || `${Math.round(ts / 1000)}_${lat.toFixed(2)}_${lng.toFixed(2)}`,
    timestampMs: ts,
    isoDateTime: new Date(ts).toISOString(),
    tanggalLabel: formatted.tanggal,
    jamLabel: item.time || formatted.jam,
    latitude: lat,
    longitude: lng,
    lintangStr: item.latitude || coords.lintang,
    bujurStr: item.longitude || coords.bujur,
    magnitude,
    depthKm,
    depthCategory: classifyDepth(depthKm),
    wilayah,
    regionGroup: classifyRegionGroup(wilayah, lat, lng),
    potensi,
    tsunamiStatus: classifyTsunamiStatus(potensi, magnitude, depthKm),
    dirasakan: item.felt || '',
    shakemapFile: item.shakemap || undefined,
    instruction: item.instruction || undefined,
    headline: item.headline || undefined,
    sourceFeed: 'last30event',
    isFelt: Boolean(item.felt && item.felt.trim().length > 0),
    isM5Plus: magnitude >= 5.0,
  };
}

function mergeAndDeduplicateEvents(groups: EarthquakeEvent[][]): EarthquakeEvent[] {
  const merged: EarthquakeEvent[] = [];

  for (const group of groups) {
    for (const candidate of group) {
      if (!Number.isFinite(candidate.latitude) || !Number.isFinite(candidate.longitude)) continue;
      if (candidate.latitude === 0 && candidate.longitude === 0) continue;

      // Match events occurring within 90 seconds and 0.45 degrees of each other
      const existingIdx = merged.findIndex(
        (ev) =>
          Math.abs(ev.timestampMs - candidate.timestampMs) <= 90_000 &&
          Math.abs(ev.latitude - candidate.latitude) <= 0.45 &&
          Math.abs(ev.longitude - candidate.longitude) <= 0.45
      );

      if (existingIdx === -1) {
        merged.push(candidate);
      } else {
        const existing = merged[existingIdx];
        // Prefer richer Indonesian TEWS descriptions, shakemaps, and felt reports
        const preferCandidate =
          (candidate.sourceFeed === 'autogempa' && existing.sourceFeed !== 'autogempa') ||
          (candidate.dirasakan && !existing.dirasakan) ||
          (candidate.shakemapFile && !existing.shakemapFile) ||
          (existing.sourceFeed === 'gempaql' && candidate.sourceFeed !== 'gempaql');

        if (preferCandidate) {
          merged[existingIdx] = {
            ...existing,
            ...candidate,
            dirasakan: candidate.dirasakan || existing.dirasakan,
            shakemapFile: candidate.shakemapFile || existing.shakemapFile,
            instruction: candidate.instruction || existing.instruction,
            headline: candidate.headline || existing.headline,
            potensi: candidate.potensi || existing.potensi,
            isFelt: candidate.isFelt || existing.isFelt,
            isM5Plus: candidate.isM5Plus || existing.isM5Plus,
            faseCount: candidate.faseCount ?? existing.faseCount,
          };
        } else {
          merged[existingIdx] = {
            ...existing,
            dirasakan: existing.dirasakan || candidate.dirasakan,
            shakemapFile: existing.shakemapFile || candidate.shakemapFile,
            instruction: existing.instruction || candidate.instruction,
            headline: existing.headline || candidate.headline,
            isFelt: existing.isFelt || candidate.isFelt,
            isM5Plus: existing.isM5Plus || candidate.isM5Plus,
            faseCount: existing.faseCount ?? candidate.faseCount,
          };
        }
      }
    }
  }

  return merged.sort((a, b) => b.timestampMs - a.timestampMs);
}

interface RawAllResponse {
  fetchedAt?: string;
  autogempa?: { Infogempa?: { gempa?: BmkgAutoGempaRaw } } | null;
  gempaterkini?: { Infogempa?: { gempa?: BmkgAutoGempaRaw[] } } | null;
  gempadirasakan?: { Infogempa?: { gempa?: BmkgAutoGempaRaw[] } } | null;
  gempaql?: { features?: BmkgGeoJsonFeature[] } | null;
  datagempa?: BmkgCapAlertRaw | null;
  last30event?: BmkgLast30EventItem[] | null;
  errors?: Record<string, string | null>;
}

async function fetchDirectFallback(): Promise<RawAllResponse> {
  const [auto, terkini, dirasakan, ql, cap] = await Promise.allSettled([
    fetch(DIRECT_ENDPOINTS.autogempa).then((r) => r.json()),
    fetch(DIRECT_ENDPOINTS.gempaterkini).then((r) => r.json()),
    fetch(DIRECT_ENDPOINTS.gempadirasakan).then((r) => r.json()),
    fetch(DIRECT_ENDPOINTS.gempaql).then((r) => r.json()),
    fetch(DIRECT_ENDPOINTS.datagempa).then((r) => r.json()),
  ]);

  return {
    fetchedAt: new Date().toISOString(),
    autogempa: auto.status === 'fulfilled' ? auto.value : null,
    gempaterkini: terkini.status === 'fulfilled' ? terkini.value : null,
    gempadirasakan: dirasakan.status === 'fulfilled' ? dirasakan.value : null,
    gempaql: ql.status === 'fulfilled' ? ql.value : null,
    datagempa: cap.status === 'fulfilled' ? cap.value : null,
    last30event: [],
    errors: {},
  };
}

export async function fetchBmkgDataset(): Promise<BmkgDataset> {
  let raw: RawAllResponse;
  try {
    const resp = await fetch('/api/bmkg?feed=all', {
      headers: { Accept: 'application/json' },
    });
    if (!resp.ok) {
      throw new Error(`Proxy HTTP ${resp.status}`);
    }
    raw = (await resp.json()) as RawAllResponse;
  } catch {
    raw = await fetchDirectFallback();
  }

  const autoRaw = raw.autogempa?.Infogempa?.gempa;
  const latestAutoGempa = autoRaw ? normalizeBmkgStandardEvent(autoRaw, 'autogempa') : null;

  const recentM5Plus = (raw.gempaterkini?.Infogempa?.gempa ?? []).map((g) =>
    normalizeBmkgStandardEvent(g, 'gempaterkini')
  );

  const recentFelt = (raw.gempadirasakan?.Infogempa?.gempa ?? []).map((g) =>
    normalizeBmkgStandardEvent(g, 'gempadirasakan')
  );

  const last30Alerts = (raw.last30event ?? []).map(normalizeLast30Item);

  const qlEvents = (raw.gempaql?.features ?? []).map(normalizeGeoJsonFeature);

  // Merge priority: autogempa, last30, gempaterkini, gempadirasakan, gempaQL
  const allEvents = mergeAndDeduplicateEvents([
    latestAutoGempa ? [latestAutoGempa] : [],
    last30Alerts,
    recentM5Plus,
    recentFelt,
    qlEvents,
  ]);

  const capRaw = raw.datagempa;
  const capAlert =
    capRaw && capRaw.info
      ? {
          identifier: capRaw.identifier || '',
          sent: capRaw.sent || capRaw.info.timesent || '',
          msgType: capRaw.msgType || 'Alert',
          subject: capRaw.info.subject || '',
          headline: capRaw.info.headline || '',
          description: capRaw.info.description || '',
          instruction: capRaw.info.instruction || '',
          potential: capRaw.info.potential || '',
          area: capRaw.info.area || '',
          magnitude: parseMagnitude(capRaw.info.magnitude),
          depthKm: parseDepthKm(capRaw.info.depth),
          shakemap: capRaw.info.shakemap,
          felt: capRaw.info.felt,
        }
      : null;

  return {
    fetchedAt: raw.fetchedAt || new Date().toISOString(),
    latestAutoGempa,
    capAlert,
    recentM5Plus,
    recentFelt,
    last30Alerts,
    allEvents,
    feedErrors: raw.errors || {},
  };
}

export function getShakemapUrl(shakemapFile?: string): string | null {
  if (!shakemapFile) return null;
  const clean = shakemapFile.trim();
  if (!clean) return null;
  return `/api/bmkg?feed=shakemap&file=${encodeURIComponent(clean)}`;
}

export function getDirectShakemapUrl(shakemapFile?: string): string | null {
  if (!shakemapFile) return null;
  return `https://data.bmkg.go.id/DataMKG/TEWS/${encodeURIComponent(shakemapFile.trim())}`;
}

export function computeHazardZones(events: EarthquakeEvent[]): SeismicZoneComputed[] {
  return SEISMIC_ZONES.map((zone) => {
    const zoneEvents = events.filter(
      (ev) =>
        ev.latitude >= zone.bounds.minLat &&
        ev.latitude <= zone.bounds.maxLat &&
        ev.longitude >= zone.bounds.minLng &&
        ev.longitude <= zone.bounds.maxLng
    );

    const eventCount = zoneEvents.length;
    const shallowCount = zoneEvents.filter((e) => e.depthKm <= 60).length;
    const feltCount = zoneEvents.filter((e) => e.isFelt).length;
    const m5Count = zoneEvents.filter((e) => e.magnitude >= 5.0).length;
    const maxMagnitude = zoneEvents.reduce((acc, e) => Math.max(acc, e.magnitude), 0);
    const avgDepthKm =
      eventCount > 0 ? Math.round(zoneEvents.reduce((acc, e) => acc + e.depthKm, 0) / eventCount) : 0;
    const latestEvent = zoneEvents.length > 0 ? zoneEvents[0] : null;

    let dynamicHazardLevel = zone.baselineRiskClass;
    if (maxMagnitude >= 6.0 || m5Count >= 3 || eventCount >= 120) {
      dynamicHazardLevel = 'Sangat Tinggi';
    } else if (maxMagnitude >= 5.0 || eventCount >= 40) {
      dynamicHazardLevel = zone.baselineRiskClass === 'Rendah' ? 'Sedang' : 'Tinggi';
    }

    return {
      ...zone,
      eventCount,
      shallowCount,
      feltCount,
      m5Count,
      maxMagnitude,
      avgDepthKm,
      latestEvent,
      dynamicHazardLevel,
    };
  }).sort((a, b) => b.eventCount - a.eventCount || b.maxMagnitude - a.maxMagnitude);
}

export function exportEventsToCsv(events: EarthquakeEvent[], tz: TimezoneOption) {
  const headers = [
    'ID',
    'Tanggal',
    'Jam',
    'Magnitudo',
    'Kedalaman_km',
    'Kategori_Kedalaman',
    'Lintang',
    'Bujur',
    'Wilayah',
    'Koridor',
    'Potensi_Tsunami',
    'Dirasakan_MMI',
    'Sumber',
  ];

  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = events.map((ev) => {
    const t = formatEventTime(ev.timestampMs, tz);
    return [
      ev.id,
      t.tanggal,
      t.jam,
      ev.magnitude.toFixed(1),
      ev.depthKm,
      ev.depthCategory,
      ev.latitude.toFixed(2),
      ev.longitude.toFixed(2),
      ev.wilayah,
      ev.regionGroup,
      ev.tsunamiStatus,
      ev.dirasakan || '-',
      `BMKG (${ev.sourceFeed})`,
    ]
      .map(escapeCsv)
      .join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `data-gempa-bmkg-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
