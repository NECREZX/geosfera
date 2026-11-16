# Geosfera — Sistem Informasi Geografis Gempa Bumi Indonesia

Aplikasi Sistem Informasi Geografis (SIG) pemantauan aktivitas gempa bumi di Indonesia secara **real-time** menggunakan data terbuka resmi **BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)**.

## Sumber Data Resmi (Tanpa Data Dummy)

Seluruh data diambil langsung dari layanan resmi TEWS & InaTEWS BMKG melalui fungsi proxy `/api/bmkg` (kompatibel untuk Express lokal maupun Vercel Serverless Functions):

- `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`
- `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`
- `https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json`
- `https://bmkg-content-inatews.storage.googleapis.com/gempaQL.json`
- `https://bmkg-content-inatews.storage.googleapis.com/datagempa.json`
- `https://bmkg-content-inatews.storage.googleapis.com/last30event.xml`

## Fitur Utama

1. **Dashboard**: Ringkasan gempa terkini (`autogempa.json`), peta & shakemap BMKG, KPI aktivitas seismik, grafik tren harian, dan distribusi magnitudo.
2. **Peta Gempa**: Peta GIS interaktif berbasis Leaflet dengan filter magnitudo, kedalaman, dan periode, detail titik episenter, layer batas administrasi provinsi Indonesia, serta layer lempeng tektonik & sesar aktif.
3. **Riwayat Gempa**: Pencarian lokasi/MMI, filter tanggal, koridor wilayah, filter magnitudo, detail tiap kejadian, dan ekspor CSV.
4. **Analisis Gempa**: Statistik magnitudo, grafik aktivitas harian, analisis kedalaman hiposenter, distribusi berdasarkan wilayah, dan perbandingan aktivitas antarperiode (24 jam & 3 hari).
5. **Wilayah Rawan Gempa**: Peta tingkat kerawanan provinsi, klasifikasi zona, koridor berisiko, dan potensi dampak wilayah terhubung dengan data seismik real-time.
6. **Potensi Tsunami**: Pemantauan status peringatan dini tsunami InaTEWS (`datagempa.json` & `gempaterkini.json`), evaluasi parameter kedalaman/magnitudo, dan pembaruan kejadian.
7. **Mitigasi Bencana**: Panduan sebelum, saat, dan setelah gempa bumi, standar jalur/titik evakuasi, serta daftar periksa interaktif Tas Siaga Bencana.
8. **Pengaturan**: Mode terang/gelap, zona waktu (`WIB`, `WITA`, `WIT`, `UTC`), interval sinkronisasi otomatis, notifikasi browser, dan atribusi sumber data BMKG.

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Deploy ke GitHub & Vercel

1. Push seluruh repository ini ke GitHub.
2. Buka dashboard **Vercel** → **Add New Project** → pilih repository GitHub Anda.
3. Vercel akan otomatis membaca `vercel.json`:
   - Build Command: `vite build`
   - Output Directory: `dist`
   - Serverless Function: `/api/bmkg.ts` otomatis aktif pada endpoint `/api/bmkg` tanpa memerlukan API key tambahan.
4. Klik **Deploy**.
