# 🌌 Traistats - Obsdslp RPG Dashboard

Traistats adalah aplikasi pelacak kebiasaan (Habit Tracker) interaktif dengan antarmuka bergaya **RPG (Role-Playing Game)**. Aplikasi ini dirancang untuk mengubah rutinitas harian yang membosankan menjadi sebuah *quest* yang menyenangkan dengan sistem leveling, statistik *skill*, dan elemen gamifikasi.

## ✨ Fitur Utama

- **🎮 Gamifikasi Rutinitas:** Dapatkan EXP dan Manata dari setiap kebiasaan yang diselesaikan.
- **📊 Pelacak Keterampilan Interaktif:** Visualisasi statistik harian dengan *Radar Chart* dan *Line Chart* (Pasar Garis Bulan) berbasis SVG interaktif.
- **🕒 Waktu Kosmik:** Integrasi jam analog *real-time* yang estetik di dalam panel profil.
- **🌌 UI/UX Premium:** Desain antarmuka *Glassmorphism* dengan latar belakang nebula ruang angkasa (*dark mode*).
- **⚡ Sinkronisasi Real-time:** Data langsung terhubung ke database cloud (Supabase) untuk memastikan *progress* Anda selalu aman dan tersinkronisasi.

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan *stack* teknologi modern untuk performa maksimal:

- **Frontend:** [Next.js 16](https://nextjs.org/) (Turbopack), React, Vanilla CSS (Custom UI Framework)
- **Backend & Database:** [Supabase](https://supabase.com/) (REST API & PostgreSQL)
- **Deployment:** [Vercel](https://vercel.com/)
- **Icons & Graphics:** Lucide React & Custom SVG Animations

## 🚀 Panduan Memulai (Local Development)

Untuk menjalankan proyek ini secara lokal di komputer Anda:

### 1. Kloning Repositori
```bash
git clone https://github.com/zerovan102/Traistats.git
cd Traistats
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (Environment Variables)
Buat file `.env.local` di *root* direktori proyek dan tambahkan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_SUPABASE_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) melalui browser Anda untuk melihat hasilnya.

## 🗄️ Skema Database

Aplikasi ini membutuhkan dua tabel utama di Supabase:
1. `habits` - Menyimpan daftar kebiasaan, frekuensi, dan tema warna.
2. `habit_logs` - Menyimpan riwayat penyelesaian kebiasaan berdasarkan tanggal.

*(Skema lengkap tersedia di file `supabase_schema.sql`)*

## 📄 Lisensi

Proyek ini bersifat *open-source* dan dapat dimodifikasi untuk keperluan pembelajaran.

---
* [zerovan102](https://github.com/zerovan102) | Level up your life!*
