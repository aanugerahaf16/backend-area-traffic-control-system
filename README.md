<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Pertamina_logo.svg/1200px-Pertamina_logo.svg.png" alt="Pertamina Logo" width="200" />

# 🚦 Pertamina ATCS - Integrated Fullstack Monitoring

### **Refinery Unit VI Balongan Monitoring System**

  [![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
  [![Next.js](https://img.shields.io/badge/Next.js-15.x-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
  [![Filament](https://img.shields.io/badge/Filament-v4-FFAD00?style=for-the-badge&logo=filament)](https://filamentphp.com)
  [![Streaming](https://img.shields.io/badge/Streaming-NodeMediaServer-red?style=for-the-badge)](https://github.com/illuspas/Node-Media-Server)
  [![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

---

**PT Kilang Pertamina Internasional – Refinery Unit VI Balongan**
*Sistem Monitoring ATCS, Streaming CCTV Real-time, dan Analitik Performa dalam Satu Dashboard Terpadu.*

</div>

---

## 🏗️ Arsitektur Proyek (Hybrid Gateway)

Sistem ini menggunakan arsitektur **Hybrid Proxy**. Laravel bertindak sebagai gerbang tunggal (Single Entry Point) di **Port 8000**, yang melayani Admin Panel secara native dan menyajikan Frontend Next.js secara dinamis melalui teknik Reverse Proxy.

```text
📂 fullstack-atcs/
├── 🛡️ backend-new/               # Laravel 12 & Gateway (Port 8000)
│   ├── app/                      # Business Logic & Proxy Controller
│   ├── database/                 # Migrations & Analytical Schemas
│   └── routes/                   # API & Gateway Route Definitions
├── ⚛️ pertamina-frontend-build/   # UI Next.js 15 (Engine di Port 3000)
│   ├── app/                      # Modern App Router Pages
│   └── components/               # High-end Premium Components
└── 📹 streaming-server/          # Video Engine (Port 8001 & 3001)
    ├── server.js                 # RTMP to HLS Translation Logic
    └── ffmpeg/                   # Transcoding Hardware Acceleration
```

---

## 🌟 Fitur Utama

### 📊 **Analitik ATCS Cerdas**

* **Hierarchical Grouping**: Data performa dikelompokkan otomatis berdasarkan **Building & Room**.
* **Predictive Trends**: Visualisasi volume lalu lintas, kecepatan rata-rata, dan indeks kemacetan dengan grafik interaktif Recharts.
* **Manual Override**: Input data manual via Admin Panel secara otomatis memiliki prioritas di atas data simulasi.

### 🎥 **CCTV Real-time & Transcoding**

* **Unified Streaming**: Streaming CCTV fisik (RTSP) dikonversi secara real-time menjadi **HLS (m3u8)** untuk akses web yang ringan dan lancar.
* **Health Status**: Indikator otomatis Online/Offline untuk setiap titik kamera di lapangan.

### 🗺️ **Interaktif Geospasial**

* **Live Map Integration**: Integrasi peta Leaflet.js dengan marker dinamis yang menunjukkan status unit secara live.
* **Instant Intelligence**: Tooltip informasi cepat saat marker diklik tanpa perlu reload halaman.

---

## 🛠️ Stack Teknologi

* **Core Backend**: [Laravel 12](https://laravel.com) (PHP 8.2+)
- **Admin Dashboard**: [Filament v4](https://filamentphp.com) (High-speed TALL Stack)
* **Frontend Engine**: [Next.js 15](https://nextjs.org) (React 19, TypeScript)
* **Video Engine**: [Node Media Server](https://github.com/illuspas/Node-Media-Server) + [FFmpeg](https://ffmpeg.org/)
* **Styling**: Tailwind CSS (Premium Glassmorphism & Dark Mode)

---

## 📦 Panduan Instalasi

### 1. Prasyarat Sistem

* **PHP 8.2+** & **MySQL/MariaDB**
* **Node.js 20+** (LTS)
* **FFmpeg** (Wajib terpasang di System PATH)

### 2. Langkah Setup

```bash
# Clone & Backend Setup
cd backend-new
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Frontend Setup
cd ../pertamina-frontend-build
npm install
cp .env.example .env

# Streaming Engine Setup
cd ../streaming-server
npm install
```

---

## 🌐 Konfigurasi Akses & Port

Sistem dirancang untuk diakses melalui satu alamat pusat:

| Komponen | Alamat Utama | Peran |
| :--- | :--- | :--- |
| **🚀 Dashboard Utama** | **[http://127.0.0.1:8000](http://127.0.0.1:8000)** | **Entry Point & UI Hybrid** |
| **🔐 Panel Administrasi** | **[http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)** | **Kontrol Data & User** |
| **🎞️ File Streaming** | `http://localhost:8001/live/...` | HLS Segments |
| **⚙️ API Kontrol Stream** | `http://localhost:3001` | FFmpeg Controller |

---

## ⚡ Cara Menjalankan Aplikasi

Aplikasi ini mengandalkan koneksi antar layanan. Agar dashboard utama bisa muncul dengan benar di **[http://127.0.0.1:8000](http://127.0.0.1:8000)**, ikuti urutan berikut:

### **Opsi A: Menggunakan Skrip Otomatis (Direkomendasikan)**

Gunakan skrip orkestrasi di root direktori untuk menghidupkan semua layanan sekaligus:

```bash
node start-fullstack.js
```

### **Opsi B: Menjalankan Secara Manual (Langkah demi Langkah)**

Jika ingin menjalankan terminal secara terpisah, **WAJIB** mengikuti urutan ini:

1. **Jalankan Backend (Laravel) - Terminal 1**
    ```bash
    cd backend-new
    php artisan serve
    ```
    *Layanan ini harus jalan pertama sebagai pintu masuk utama di port 8000.*

2. **Jalankan Frontend (Next.js) - Terminal 2**
    ```bash
    cd pertamina-frontend-build
    npm run dev
    ```
    *Setelah backend jalan, hidupkan UI di port 3000 agar Laravel bisa mengambil kontennya.*

3. **Jalankan Streaming Server - Terminal 3**
    ```bash
    cd streaming-server
    node server.js
    ```
    *Layanan ini menyediakan stream video CCTV untuk dashboard.*

> **PENTING:** Setelah semua jalan, akses aplikasi melalui **[http://127.0.0.1:8000](http://127.0.0.1:8000)**. Jangan langsung mengakses port 3000 agar fitur integrasi Laravel-Next.js berfungsi dengan sempurna.

---

## 🔧 Alur Kerja Pengembang (Hybrid Proxy)

Proyek ini menggunakan **Laravel sebagai Gateway**. Saat Anda mengakses `127.0.0.1:8000`:

1. Jika rute adalah `/admin`, Laravel melayani langsung.
2. Jika rute adalah aset (`.js`, `.css`), Laravel melakukan **redirect** ke port 3000 untuk kecepatan maksimal.
3. Selain itu, Laravel melakukan **Proxying** konten HTML dari port 3000, sehingga URL tetap terlihat rapi di port 8000.

---

## 🔒 Keamanan & Performa

* **Role-Based Access (RBAC)**: Dikelola ketat melalui Filament Shield.
* **Sub-Second Response**: Data agregat ATCS di-cache untuk performa maksimal.
* **CORS Hardening**: Konfigurasi keamanan tinggi antara UI dan API Server.

---

<div align="center">
  <p>&copy; 2026 <b>PT Kilang Pertamina Internasional – Refinery Unit VI Balongan</b></p>
  <p><i>Sophisticated Monitoring Solutions for Energy Infrastructure.</i></p>
</div>
