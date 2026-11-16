export type MenuId =
  | 'dashboard'
  | 'peta'
  | 'riwayat'
  | 'analisis'
  | 'kerawanan'
  | 'tsunami'
  | 'mitigasi'
  | 'pengaturan';

export type DepthCategory = 'Dangkal' | 'Menengah' | 'Dalam';
export type TsunamiStatus = 'Berpotensi Tsunami' | 'Pemantauan Pesisir' | 'Tidak Berpotensi Tsunami' | 'Belum Terklasifikasi';
export type TimezoneOption = 'WIB' | 'WITA' | 'WIT' | 'UTC';
export type MapBasemap = 'esri_topo' | 'osm' | 'esri_street' | 'esri_imagery';

export interface BmkgAutoGempaRaw {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi?: string;
  Dirasakan?: string;
  Shakemap?: string;
}

export interface BmkgGeoJsonFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [string | number, string | number, number?];
  };
  properties: {
    status: string;
    depth: string;
    place: string;
    mag: string;
    time: string;
    id: string;
    fase?: string;
  };
}

export interface BmkgCapAlertRaw {
  identifier?: string;
  sender?: string;
  sent?: string;
  status?: string;
  msgType?: string;
  info?: {
    event?: string;
    date?: string;
    time?: string;
    point?: { coordinates?: string };
    latitude?: string;
    longitude?: string;
    magnitude?: string;
    depth?: string;
    area?: string;
    eventid?: string;
    potential?: string;
    subject?: string;
    headline?: string;
    description?: string;
    instruction?: string;
    shakemap?: string;
    felt?: string;
    timesent?: string;
  };
}

export interface BmkgLast30EventItem {
  event: string;
  date: string;
  time: string;
  coordinates: string;
  latitude: string;
  longitude: string;
  magnitude: string;
  depth: string;
  area: string;
  eventid: string;
  potential: string;
  subject: string;
  headline: string;
  description: string;
  instruction: string;
  shakemap: string;
  felt: string;
  timesent: string;
}

export interface EarthquakeEvent {
  id: string;
  timestampMs: number;
  isoDateTime: string;
  tanggalLabel: string;
  jamLabel: string;
  latitude: number;
  longitude: number;
  lintangStr: string;
  bujurStr: string;
  magnitude: number;
  depthKm: number;
  depthCategory: DepthCategory;
  wilayah: string;
  regionGroup: string;
  potensi: string;
  tsunamiStatus: TsunamiStatus;
  dirasakan: string;
  shakemapFile?: string;
  instruction?: string;
  headline?: string;
  sourceFeed: 'autogempa' | 'gempaterkini' | 'gempadirasakan' | 'last30event' | 'gempaql';
  isFelt: boolean;
  isM5Plus: boolean;
  faseCount?: number;
}

export interface BmkgDataset {
  fetchedAt: string;
  latestAutoGempa: EarthquakeEvent | null;
  capAlert: {
    identifier: string;
    sent: string;
    msgType: string;
    subject: string;
    headline: string;
    description: string;
    instruction: string;
    potential: string;
    area: string;
    magnitude: number;
    depthKm: number;
    shakemap?: string;
    felt?: string;
  } | null;
  recentM5Plus: EarthquakeEvent[];
  recentFelt: EarthquakeEvent[];
  last30Alerts: EarthquakeEvent[];
  allEvents: EarthquakeEvent[];
  feedErrors: Record<string, string | null>;
}

export interface SeismicZoneDefinition {
  id: string;
  name: string;
  provinces: string[];
  tectonicDriver: string;
  dominantFault: string;
  baselineRiskClass: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah';
  coastalTsunamiExposure: 'Tinggi' | 'Sedang' | 'Rendah';
  potentialImpact: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  center: [number, number];
}

export interface SeismicZoneComputed extends SeismicZoneDefinition {
  eventCount: number;
  shallowCount: number;
  feltCount: number;
  m5Count: number;
  maxMagnitude: number;
  avgDepthKm: number;
  latestEvent: EarthquakeEvent | null;
  dynamicHazardLevel: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah';
}

export interface AppSettings {
  theme: 'light' | 'dark';
  timezone: TimezoneOption;
  autoRefreshSeconds: 0 | 30 | 60 | 300;
  defaultBasemap: MapBasemap;
  compactTable: boolean;
  notificationsEnabled: boolean;
  minNotifyMagnitude: number;
  soundAlertEnabled: boolean;
}
