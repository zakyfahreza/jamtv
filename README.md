# 🕌 Jam Digital Masjid Modern — TV Display

Tampilan digital fullscreen untuk layar TV/proyektor masjid berbasis HTML, CSS, dan Vanilla JavaScript murni. Dapat di-deploy langsung ke **GitHub Pages** tanpa konfigurasi tambahan.

---

## 📁 Struktur File

```
jamtv/
├── index.html          # Halaman utama
├── style.css           # Stylesheet
├── script.js           # Logic utama
├── README.md           # Dokumentasi
├── audio/
│   ├── adzan.mp3       # File audio adzan (tambahkan sendiri)
│   └── beep.mp3        # File audio beep (tambahkan sendiri)
└── slides/
    ├── slide1.png      # Gambar slideshow (tambahkan sendiri)
    ├── slide2.png
    └── slide3.png      # dst. (slide1–slideN)
```

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| ⛶ Layar Penuh | Tombol khusus untuk masuk ke mode *full screen* |
| � Layout Fluid | Tata letak & ukuran font otomatis menyesuaikan layar (`clamp` + `min(vw, vh)`), anti-terpotong saat fullscreen di TV berbagai resolusi |
| �🕐 Jam Digital | Format HH:mm + detik, real-time |
| 📅 Tanggal | Masehi (Bahasa Indonesia) + Hijriyah, tampil satu baris dipisah `|` |
| 🕌 Jadwal Shalat | Dari API Kemenag via myquran.com (Solo/WIB), fallback static, kartu besar |
| ⏳ Countdown | Hitung mundur ke waktu shalat berikutnya |
| 🔔 Notifikasi Adzan | Overlay + audio adzan.mp3 |
| ⏱ Countdown Iqomah | Bisa diatur per waktu shalat (ditutup dengan tulisan WAKTU IQOMAH berukuran besar) |
| 🌅 Waktu Dhuha | Hitung mundur otomatis dari waktu Syuruq ke masuknya waktu Dhuha |
| 📢 Khutbah Jum'at | Notifikasi otomatis selama Khutbah pada hari Jum'at (durasi dapat diatur) |
| � Jadwal Kajian Rutin | Papan jadwal kajian bergilir (format: Jadwal \| Judul \| Ustadz), dapat diedit takmir |
| 📣 Pengumuman Berjalan | Marquee vertikal (bergulir ke atas per baris), teks panjang otomatis menyesuaikan agar tetap 1 baris |
| �🖼️ Slideshow | Auto-loop gambar dari folder /slides |
| 🔄 Auto Refresh Harian | Memuat ulang halaman otomatis pada jam tertentu (default 00:00) tanpa perlu refresh manual |
| ⚙️ Pengaturan | Modal UI, identitas, durasi dinamis, tersimpan di localStorage |

---

## 🆕 Pembaruan Terbaru

- **Layout fluid untuk TV** — seluruh ukuran (jam, jadwal, teks) memakai `clamp()` + `min(vw, vh)` dan layout flex setinggi layar, sehingga tidak ada lagi konten terpotong saat masuk *fullscreen* di TV dengan resolusi/skala berbeda.
- **Tanggal satu baris** — Masehi & Hijriyah kini sebaris, dipisah `|`, dengan font lebih besar.
- **Papan Jadwal Kajian Rutin** — menggantikan kotak "Nasihat & Info". Menampilkan kajian bergilir dengan format `Jadwal | Judul | Ustadz`.
- **Pengumuman berjalan vertikal** — bar pengumuman di bawah bergulir ke atas per baris; baris panjang (mis. ayat) otomatis dikecilkan agar tetap satu baris.
- **Teks "WAKTU IQOMAH" diperbesar** saat hitung mundur iqomah selesai.
- **Jadwal shalat lebih besar** — judul "Jadwal Shalat — Kota Solo" dihilangkan, kartu & angka waktu diperbesar.
- **Auto Refresh Harian** — halaman dimuat ulang otomatis pada jam yang dapat diatur (default 00:00), memudahkan penerapan pembaruan tanpa refresh manual di TV.

---

## 🚀 Cara Deploy ke GitHub Pages

1. Upload semua file ke repository GitHub
2. Masuk ke **Settings → Pages**
3. Pilih source: **main branch / root folder**
4. Akses di: `https://[username].github.io/[repo-name]/`

---

## 🔊 Menambahkan Audio

Letakkan file audio di folder `/audio/`:
- **`adzan.mp3`** — Rekaman adzan (bisa download dari internet)
- **`beep.mp3`** — Suara beep pendek sebagai fallback

> ⚠️ Browser modern memblokir autoplay audio. Pengguna harus melakukan klik pertama (misalnya klik tombol ⚙️) agar audio bisa diputar.

---

## 🖼️ Menambahkan Slide

Tambahkan gambar ke folder `/slides/` dengan nama:
- `slide1.png` (atau .jpg)
- `slide2.png`
- `slide3.png`
- `slide4.png`
- `slide5.png`

> Ukuran rekomendasi: **1280×720** atau **1920×1080** (rasio 16:9)



## ⚙️ Pengaturan (Settings Modal)

Buka dengan klik tombol **⚙️** di pojok kiri atas:

- **Identitas Masjid** — Ganti nama masjid pada header utama
- **Jadwal Kajian Rutin** — Daftar kajian (format: `Jadwal | Judul | Ustadz`, satu baris satu kajian) yang tampil bergantian + interval pergantian
- **Pengumuman Berjalan** — Teks pengumuman marquee (satu baris = satu pengumuman) + interval pergantian
- **Durasi Iqomah** — Atur per waktu shalat (dalam menit)
- **Durasi Tambahan** — Atur rentang waktu Syuruq ke Dhuha dan durasi peringatan Khutbah Jum'at
- **Toggle Suara & Iqomah** — Aktif/nonaktifkan audio dan fungsi countdown iqomah
- **Test Buttons** — Tombol simulasi untuk *Test Adzan*, *Test Iqomah*, *Test Jumat*, dan *Test Dhuha*
- **Slideshow** — Jumlah slide & interval tiap slide (detik)
- **Auto Refresh Harian** — Aktif/nonaktif + atur jam halaman dimuat ulang otomatis (default 00:00)

Semua pengaturan disimpan otomatis ke `localStorage`.

---

## 🌐 API yang Digunakan

| API | Tujuan |
|---|---|
| [api.myquran.com](https://api.myquran.com/) | Jadwal shalat otomatis (Data Kemenag RI) |

---

## 🖥️ Optimasi untuk TV/Mini PC

- Tidak ada framework berat (React/Vue/Angular)
- Tidak ada build process
- Total ukuran kode < 50 KB (tanpa gambar/audio)
- Fallback offline untuk jadwal shalat dan keuangan
- Performa ringan, cocok untuk Raspberry Pi / mini PC

---

## 📐 Layout (16:9)

```
┌───────────────────────────────────────────────────────┐
│ ⚙️ ⛶  Masjid Al Ikhlas    │  Senin, 13 Juli | 28 Muharram │ ← Top Bar
├────────────────┬──────────────────────────────────────┤
│  ┌──────────┐  │                                       │
│  │  Jam     │  │            SLIDESHOW                  │
│  │  Besar   │  │          (Poster Dakwah)              │
│  └──────────┘  │                                       │
│  ┌──────────┐  │                                       │
│  │ Countdown│  │                                       │
│  └──────────┘  │                                       │
│  ┌──────────┐  │                                       │
│  │  Jadwal  │  │                                       │
│  │  Kajian  │  │                                       │
│  └──────────┘  │                                       │
├───────────────────────────────────────────────────────┤
│  Subuh │ Terbit │ Dzuhur │ Ashar │ Maghrib │ Isya      │ ← Jadwal Shalat
├───────────────────────────────────────────────────────┤
│ 📣 PENGUMUMAN   teks berjalan vertikal (scroll ke atas) │ ← Marquee
└───────────────────────────────────────────────────────┘
```

---

*Dibuat untuk Masjid Al Ikhlas Adi Sucipto — Solo*
