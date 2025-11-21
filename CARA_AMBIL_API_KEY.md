# Cara Mendapatkan Google Gemini API Key

Panduan lengkap untuk mendapatkan API key Google Gemini untuk fitur rekomendasi AI di Kalkulator HPP.

## Langkah-langkah

### 1. Kunjungi Google AI Studio

Buka browser dan kunjungi:
**https://makersuite.google.com/app/apikey**

Atau alternatif:
**https://aistudio.google.com/app/apikey**

### 2. Login dengan Google Account

- Pastikan Anda login dengan akun Google yang valid
- Jika belum punya akun, buat terlebih dahulu di https://accounts.google.com

### 3. Buat API Key Baru

- Setelah login, Anda akan melihat halaman "Get API key"
- Klik tombol **"Create API Key"** atau **"Get API Key"**
- Jika diminta, pilih project Google Cloud (atau buat project baru)
- API key akan otomatis dibuat dan ditampilkan

### 4. Copy API Key

- **PENTING:** Copy API key yang ditampilkan (format: `AIza...`)
- Simpan dengan aman karena hanya ditampilkan sekali
- Jika lupa, Anda bisa membuat API key baru

### 5. Tambahkan ke Project

Buat file `.env` di root folder project (sama level dengan `package.json`):

```env
VITE_GEMINI_API_KEY=AIzaSy...paste_api_key_di_sini
```

**Contoh:**

```env
VITE_GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
```

### 6. Restart Development Server

Setelah menambahkan API key:

1. Stop server development (Ctrl+C)
2. Jalankan lagi: `npm run dev`
3. Refresh browser

## Catatan Penting

⚠️ **Keamanan:**

- Jangan commit file `.env` ke Git (sudah ada di `.gitignore`)
- Jangan share API key secara publik
- Jika API key ter-expose, segera hapus dan buat yang baru

💰 **Biaya:**

- Google Gemini API memiliki free tier yang cukup untuk penggunaan pribadi
- Cek quota di: https://aistudio.google.com/app/apikey

🔧 **Troubleshooting:**

- Jika API key tidak bekerja, pastikan:

  - Format benar (tanpa spasi)
  - File `.env` di root project
  - Server sudah di-restart setelah menambahkan API key
  - API key masih aktif (belum dihapus)

- **Error 404 "models/gemini-xxx is not found":**
  - Model Gemini sering diperbarui oleh Google
  - Aplikasi sudah diupdate dengan auto-fallback ke beberapa model:
    - gemini-2.0-flash-exp (terbaru)
    - gemini-2.5-flash
    - gemini-2.5-pro
    - gemini-1.5-flash-latest
    - gemini-1.5-pro-latest
  - Sistem akan otomatis mencoba model-model tersebut sampai berhasil
  - Pastikan Anda menggunakan versi terbaru dari kode
  - Jika masih error, coba restart server development
  - Cek console browser untuk melihat model mana yang berhasil digunakan

## Alternatif: Tanpa API Key

Aplikasi tetap bisa digunakan tanpa API key! Hanya fitur "Rekomendasi AI" yang tidak akan berfungsi. Semua fitur perhitungan HPP, BEP, dan analisis profit tetap berjalan normal.
