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
| 🕐 Jam Digital | Format HH:mm + detik, real-time |
| 📅 Tanggal | Masehi (Bahasa Indonesia) + Hijriyah otomatis |
| 🕌 Jadwal Shalat | Dari API Kemenag via myquran.com (Solo/WIB), fallback static |
| ⏳ Countdown | Hitung mundur ke waktu shalat berikutnya |
| 🔔 Notifikasi Adzan | Overlay + audio adzan.mp3 |
| ⏱ Countdown Iqomah | Bisa diatur per waktu shalat |
| 🖼️ Slideshow | Auto-loop gambar dari folder /slides |
| 💰 Keuangan | Integrasi Google Spreadsheet (via Opensheet) |
| ⚙️ Pengaturan | Modal UI, tersimpan di localStorage |

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
- ... dst.

> Ukuran rekomendasi: **1280×720** atau **1920×1080** (rasio 16:9)

---

## 💰 Integrasi Data Keuangan

1. Buat Google Spreadsheet dengan kolom: `Tanggal`, `Keterangan`, `Pemasukan`, `Pengeluaran`
2. Publish spreadsheet ke web (File → Share → Publish to web)
3. Gunakan [opensheet.elk.sh](https://opensheet.elk.sh) untuk konversi ke JSON:
   ```
   https://opensheet.elk.sh/[SPREADSHEET_ID]/[NAMA_SHEET]
   ```
4. Masukkan URL tersebut di **⚙️ Pengaturan → Data Keuangan**

---

## ⚙️ Pengaturan (Settings Modal)

Buka dengan klik tombol **⚙️** di pojok kiri atas:

- **Durasi Iqomah** — Atur per waktu shalat (dalam menit)
- **Toggle Suara** — Aktif/nonaktif audio adzan
- **Toggle Iqomah** — Aktif/nonaktif countdown iqomah
- **Interval Slideshow** — Ganti durasi tiap slide (detik)
- **URL Spreadsheet** — Link data keuangan

Semua pengaturan disimpan otomatis ke `localStorage`.

---

## 🌐 API yang Digunakan

| API | Tujuan |
|---|---|
| [api.myquran.com](https://api.myquran.com/) | Jadwal shalat otomatis (Data Kemenag RI) |
| [opensheet.elk.sh](https://opensheet.elk.sh) | Konversi Google Sheets → JSON |

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
┌─────────────────────────────────────────────┐
│ 🕌 Masjid Al Ikhlas  │ 💰 Keuangan  │ [Period] │ ← Top Bar
├────────────────┬────────────────────────────┤
│  ┌──────────┐  │                            │
│  │  Jam     │  │       SLIDESHOW            │
│  │  Besar   │  │       (Poster Dakwah)      │
│  └──────────┘  │                            │
│  ┌──────────┐  │                            │
│  │ Countdown│  │                            │
│  └──────────┘  │                            │
│  ┌──────────┐  │                            │
│  │ Shalat   │  │                            │
│  │ Berikut  │  │                            │
│  └──────────┘  │                            │
│  ┌──────────┐  │                            │
│  │ Hadith   │  │                            │
│  └──────────┘  │                            │
├─────────────────────────────────────────────┤
│ Imsak │ Subuh │ Terbit │ Dzuhur │ Ashar │ Maghrib │ Isya │ ← Bottom
└─────────────────────────────────────────────┘
```

---

*Dibuat untuk Masjid Al Ikhlas Adi Sucipto — Solo*
