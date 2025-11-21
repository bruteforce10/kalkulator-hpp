# Kalkulator HPP

Alat untuk menghitung Harga Pokok Produksi per unit, menentukan harga jual ideal, serta menyediakan analisis profit & BEP (Break Even Point).

## Fitur

- ✅ Perhitungan HPP otomatis
- ✅ Rekomendasi harga (Kompetitif, Standar, Premium)
- ✅ Analisis Profit & BEP
- ✅ Simulasi penjualan
- ✅ Integrasi AI (Google Gemini)

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: TailwindCSS
- **UI Components**: ShadCN (custom implementation)
- **Charts**: Recharts
- **AI**: Google Gemini

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file di root project:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

   **Cara mendapatkan Google Gemini API Key:**
   - Kunjungi https://makersuite.google.com/app/apikey atau https://aistudio.google.com/app/apikey
   - Login dengan Google account
   - Klik "Create API Key" atau "Get API Key"
   - Copy API key yang ditampilkan
   - Paste ke file `.env` (format: `VITE_GEMINI_API_KEY=AIzaSy...`)
   - **Lihat panduan lengkap di file `CARA_AMBIL_API_KEY.md`**

   **Catatan:** 
   - Fitur AI akan tetap berfungsi meskipun tanpa API key, namun rekomendasi AI tidak akan tersedia
   - Jangan commit file `.env` ke Git (sudah ada di `.gitignore`)
   - Setelah menambahkan API key, restart development server

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Usage

1. Masukkan informasi produk
2. Tambahkan biaya variabel (bahan-bahan)
3. Masukkan biaya tetap dan target penjualan
4. Sistem akan menghitung HPP dan memberikan rekomendasi harga
5. Lihat analisis profit dan BEP

