export interface MitigationStep {
  code: string;
  title: string;
  detail: string;
}

export interface EvacuationRule {
  category: string;
  title: string;
  criteria: string;
  action: string;
}

export interface EmergencyKitItem {
  id: string;
  label: string;
  category: 'Dokumen' | 'Logistik' | 'Medis' | 'Navigasi & Komunikasi';
  detail: string;
}

export const MITIGATION_BEFORE: MitigationStep[] = [
  {
    code: '01',
    title: 'Identifikasi Titik Aman & Jalur Keluar Bangunan',
    detail:
      'Kenali struktur kolom utama, meja kokoh, dan jalur tercepat menuju ruang terbuka yang jauh dari kaca, lemari tinggi, serta jaringan kabel listrik.',
  },
  {
    code: '02',
    title: 'Pengamanan Perabot & Instalasi Utilitas',
    detail:
      'Kaitkan rak buku, lemari, dan pemanas air ke dinding struktural. Pastikan posisi katup gas LPG serta panel pemutus listrik mudah diakses seluruh penghuni.',
  },
  {
    code: '03',
    title: 'Penetapan Titik Kumpul Keluarga',
    detail:
      'Sepakati titik kumpul darurat di ruang terbuka yang aman dari potensi runtuhan dan siapkan kontak darurat luar kota apabila jaringan seluler lokal padat.',
  },
  {
    code: '04',
    title: 'Kenali Zona Bahaya Tsunami Pesisir',
    detail:
      'Jika tinggal atau berada di wilayah pesisir, petakan rute menuju dataran tinggi (ketinggian minimal 10–20 meter) atau gedung evakuasi vertikal berstruktur tahan gempa.',
  },
];

export const MITIGATION_DURING: MitigationStep[] = [
  {
    code: '01',
    title: 'Terapkan Teknik Drop, Cover, and Hold On',
    detail:
      'Segera merunduk, lindungi kepala dan leher dengan kedua lengan atau berlindung di bawah meja yang kokoh, lalu berpegangan hingga guncangan berhenti.',
  },
  {
    code: '02',
    title: 'Menjauh dari Kaca, Jendela, dan Lift',
    detail:
      'Jangan menggunakan lift saat guncangan berlangsung. Hindari berdiri di dekat fasad kaca, dinding partisi, maupun benda gantung berat.',
  },
  {
    code: '03',
    title: 'Jika Berada di Luar Ruangan atau Berkendara',
    detail:
      'Menjauh dari gedung bertingkat, tiang listrik, papan reklame, dan jembatan. Jika mengemudi, tepikan kendaraan secara perlahan di area terbuka dan tetap di dalam kabin.',
  },
  {
    code: '04',
    title: 'Waspada Pesisir (Aturan 20-20-20)',
    detail:
      'Apabila guncangan di wilayah pantai berlangsung kuat atau lebih dari 20 detik, segera lakukan evakuasi mandiri ke dataran tinggi tanpa menunggu pengumuman resmi.',
  },
];

export const MITIGATION_AFTER: MitigationStep[] = [
  {
    code: '01',
    title: 'Evakuasi Tertib & Periksa Kondisi Sekitar',
    detail:
      'Keluar menuju titik kumpul melalui tangga darurat. Gunakan alas kaki untuk menghindari serpihan kaca atau puing bangunan.',
  },
  {
    code: '02',
    title: 'Waspada Gempa Susulan (Aftershocks)',
    detail:
      'Jangan langsung masuk kembali ke bangunan yang retak atau miring. Pantau pembaruan data real-time BMKG untuk melihat tren aktivitas gempa susulan.',
  },
  {
    code: '03',
    title: 'Periksa Kebocoran Gas & Arus Pendek',
    detail:
      'Jika mencium bau gas atau melihat kabel terkelupas, segera matikan regulator gas dan sakelar utama listrik. Hindari menyalakan korek api di dalam ruangan.',
  },
  {
    code: '04',
    title: 'Ikuti Informasi Resmi BMKG & BPBD',
    detail:
      'Pastikan hanya merujuk pada kanal resmi BMKG dan BPBD setempat mengenai status pencabutan peringatan tsunami atau kelayakan hunian sementara.',
  },
];

export const EVACUATION_PRINCIPLES: EvacuationRule[] = [
  {
    category: 'Titik Kumpul Terbuka',
    title: 'Lapangan & Ruang Terbuka Hijau',
    criteria: 'Radius aman minimal 1,5 kali tinggi bangunan terdekat',
    action: 'Hindari area di bawah jaringan SUTET, pohon tua berakar dangkal, serta tebing curam pascahujan.',
  },
  {
    category: 'Evakuasi Tsunami Horizontal',
    title: 'Koridor Menuju Dataran Tinggi',
    criteria: 'Elevasi >= 15–20 meter di atas permukaan laut atau jarak >= 2 km dari garis pantai landai',
    action: 'Gunakan rute rambu evakuasi resmi berwarna oranye-biru dengan berjalan cepat tanpa menggunakan kendaraan roda empat yang memicu kemacetan.',
  },
  {
    category: 'Evakuasi Vertikal (TES)',
    title: 'Shelter Tsunami & Gedung Beton Bertulang',
    criteria: 'Bangunan minimal 3–4 lantai dengan struktur kolom terbuka pada lantai dasar',
    action: 'Dikhususkan bagi pesisir landai di mana dataran tinggi tidak dapat dicapai dalam waktu kurang dari 20 menit.',
  },
  {
    category: 'Layanan Darurat Nasional',
    title: 'Kanal Koordinasi & Pelaporan',
    criteria: 'BNPB (117) · Basarnas (115) · Polisi (110) · Ambulans (118/119)',
    action: 'Gunakan pesan singkat (SMS) atau kanal data ringan bila jaringan suara mengalami kepadatan pascagempa besar.',
  },
];

export const EMERGENCY_KIT_ITEMS: EmergencyKitItem[] = [
  {
    id: 'air-minum',
    label: 'Air Minum Kemasan (Min. 3 Liter / Orang / Hari)',
    category: 'Logistik',
    detail: 'Cukupi kebutuhan hidrasi darurat minimal untuk 72 jam pertama.',
  },
  {
    id: 'makanan-tahan-lama',
    label: 'Makanan Siap Saji & Tahan Lama',
    category: 'Logistik',
    detail: 'Biskuit energi, makanan kaleng siap buka, dan kebutuhan khusus bayi/lansia.',
  },
  {
    id: 'p3k-obat',
    label: 'Kotak P3K & Obat-obatan Pribadi',
    category: 'Medis',
    detail: 'Perban, antiseptik, pereda nyeri, masker, serta obat rutin selama 5–7 hari.',
  },
  {
    id: 'senter-baterai',
    label: 'Senter LED & Baterai Cadangan',
    category: 'Navigasi & Komunikasi',
    detail: 'Penting saat pemadaman listrik malam hari atau evakuasi dari ruangan gelap.',
  },
  {
    id: 'peluit',
    label: 'Peluit Darurat & Penanda Cahaya',
    category: 'Navigasi & Komunikasi',
    detail: 'Untuk memberi sinyal lokasi kepada tim penyelamat tanpa menguras suara.',
  },
  {
    id: 'powerbank-radio',
    label: 'Powerbank Terisi Penuh & Radio Portabel',
    category: 'Navigasi & Komunikasi',
    detail: 'Menjaga akses informasi BMKG/BPBD tetap hidup apabila menara seluler terganggu.',
  },
  {
    id: 'dokumen-penting',
    label: 'Salinan Dokumen Penting Kedap Air',
    category: 'Dokumen',
    detail: 'KTP, KK, akta, polis asuransi, serta uang tunai secukupnya dalam map plastik kedap air.',
  },
  {
    id: 'pakaian-selimut',
    label: 'Pakaian Ganti, Jas Hujan & Selimut Darurat',
    category: 'Logistik',
    detail: 'Melindungi tubuh dari hujan dan hipotermia di lokasi pengungsian terbuka.',
  },
];
