export interface TectonicFeatureProperties {
  id: string;
  name: string;
  type: 'subduction' | 'fault' | 'plate_boundary';
  plates: string;
  rate: string;
  description: string;
}

export interface TectonicGeoJson {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: TectonicFeatureProperties;
    geometry: {
      type: 'LineString';
      coordinates: Array<[number, number]>;
    };
  }>;
}

export const TECTONIC_PLATES_GEOJSON: TectonicGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'sunda-megathrust',
        name: 'Zona Subduksi Sunda (Megathrust)',
        type: 'subduction',
        plates: 'Lempeng Indo-Australia — Lempeng Eurasia',
        rate: '50–65 mm/tahun',
        description:
          'Batas pertemuan utama tempat Lempeng Indo-Australia menunjam ke bawah Lempeng Eurasia di sepanjang barat Sumatera hingga selatan Jawa dan Bali.',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [92.8, 7.2],
          [93.6, 5.1],
          [94.7, 2.8],
          [96.2, 0.5],
          [97.9, -2.1],
          [99.6, -4.5],
          [101.8, -6.5],
          [104.3, -7.8],
          [106.8, -8.5],
          [109.5, -9.2],
          [112.4, -9.8],
          [115.2, -10.3],
          [118.4, -10.7],
          [121.3, -10.9],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'banda-arc',
        name: 'Zona Subduksi Busur Banda & Palung Timor',
        type: 'subduction',
        plates: 'Lempeng Indo-Australia — Lempeng Laut Banda',
        rate: '40–70 mm/tahun',
        description:
          'Busur subduksi melengkung tajam di kawasan Timor, Tanimbar, hingga Seram yang menghasilkan gempa dalam hingga sangat dalam (>300 km).',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [121.3, -10.9],
          [124.2, -10.5],
          [126.9, -9.7],
          [129.6, -8.7],
          [131.8, -7.3],
          [132.4, -5.2],
          [131.2, -3.7],
          [128.5, -2.9],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'sumatra-fault',
        name: 'Sesar Besar Sumatera (Zona Semangko)',
        type: 'fault',
        plates: 'Intra-Lempeng Eurasia',
        rate: '15–25 mm/tahun',
        description:
          'Sesar geser mendatar aktif sepanjang pegunungan Bukit Barisan dari Aceh hingga Selat Sunda yang memicu gempa darat dangkal.',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [95.3, 5.5],
          [96.7, 4.3],
          [98.1, 2.7],
          [99.3, 1.1],
          [100.4, -0.5],
          [101.6, -2.1],
          [102.7, -3.5],
          [103.9, -4.9],
          [105.0, -5.9],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'flores-backarc',
        name: 'Sesar Naik Busur Belakang Flores',
        type: 'fault',
        plates: 'Busur Sunda-Banda — Laut Flores',
        rate: '10–20 mm/tahun',
        description:
          'Zona sesar naik di utara Bali, Lombok, Sumbawa, dan Flores yang sering menghasilkan gempa dangkal berpotensi merusak.',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [115.2, -7.9],
          [116.8, -8.0],
          [118.4, -8.1],
          [120.2, -8.0],
          [122.1, -7.9],
          [123.7, -7.7],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'palu-koro-matano',
        name: 'Sistem Sesar Palu–Koro & Matano',
        type: 'fault',
        plates: 'Mikrolempeng Sula — Makassar',
        rate: '30–40 mm/tahun',
        description:
          'Sesar geser dengan laju pergeseran sangat aktif membelah Sulawesi Tengah hingga Teluk Bone dan Laut Banda.',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [119.3, 0.9],
          [119.8, -0.7],
          [120.1, -1.8],
          [121.0, -2.4],
          [122.3, -2.8],
          [123.6, -3.3],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'north-sulawesi-trench',
        name: 'Zona Subduksi Sulawesi Utara',
        type: 'subduction',
        plates: 'Lempeng Laut Sulawesi — Lengan Utara Sulawesi',
        rate: '35–50 mm/tahun',
        description:
          'Tumbukan kerak Laut Sulawesi yang menunjam ke arah selatan di bawah Gorontalo dan Minahasa.',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [119.4, 1.3],
          [121.2, 1.6],
          [123.0, 1.7],
          [124.7, 1.9],
          [125.9, 2.3],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'maluku-collision',
        name: 'Zona Tumbukan Laut Maluku & Halmahera',
        type: 'plate_boundary',
        plates: 'Lempeng Laut Maluku — Lempeng Laut Filipina',
        rate: '60–85 mm/tahun',
        description:
          'Kawasan tumbukan busur ganda paling aktif di Indonesia timur antara Sulawesi Utara, Sangihe, dan Halmahera.',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [126.4, 4.9],
          [126.2, 3.1],
          [126.1, 1.3],
          [126.3, -0.4],
          [126.8, -1.8],
          [127.6, -2.6],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'philippine-halmahera',
        name: 'Palung Filipina & Subduksi Halmahera Utara',
        type: 'subduction',
        plates: 'Lempeng Laut Filipina — Lempeng Pasifik',
        rate: '75–95 mm/tahun',
        description:
          'Batas Lempeng Laut Filipina di timur laut Morotai dan Halmahera yang kerap memicu gempa menengah hingga dalam.',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [127.4, 5.5],
          [128.4, 3.7],
          [129.1, 2.0],
          [129.6, 0.3],
          [130.5, -0.8],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'sorong-mamberamo',
        name: 'Zona Sesar Sorong–Yapen & Sabuk Mamberamo',
        type: 'fault',
        plates: 'Lempeng Pasifik (Caroline) — Lempeng Australia',
        rate: '50–80 mm/tahun',
        description:
          'Sesar geser raksasa yang memanjang dari Kepala Burung Papua (Sorong–Manokwari) hingga pantai utara Papua dan Jayapura.',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [129.2, -1.3],
          [131.3, -0.9],
          [133.8, -0.8],
          [135.8, -1.6],
          [138.2, -2.1],
          [140.9, -2.7],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'java-active-faults',
        name: 'Jalur Sesar Aktif Pulau Jawa (Cimandiri–Lembang–Opak–Kendeng)',
        type: 'fault',
        plates: 'Intra-Lempeng Eurasia',
        rate: '2–8 mm/tahun',
        description:
          'Rangkaian sesar kerak dangkal daratan Jawa yang berdekatan dengan wilayah padat penduduk.',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.5, -7.0],
          [107.6, -6.82],
          [108.6, -6.9],
          [110.4, -7.85],
          [111.8, -7.5],
          [113.4, -7.45],
        ],
      },
    },
  ],
};
