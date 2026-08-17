# Sibayak Keramik

Website katalog + sistem internal (stok, pembukuan, faktur otomatis) untuk
Sibayak Keramik — keramik & ubin bahan bangunan.

## Status

Ini hasil **Tahap 1**: setup project. Halaman katalog sudah bisa dijalankan
dan menampilkan data contoh. Belum tersambung ke database asli — itu Tahap 2 & 3.

## Cara menjalankan di komputer kamu

1. Pastikan sudah install [Node.js](https://nodejs.org) (versi 18 ke atas).
2. Buka folder ini di terminal, lalu jalankan:
   ```bash
   npm install
   npm run dev
   ```
3. Buka `http://localhost:3000` di browser.

Kamu akan melihat halaman katalog dengan 3 produk contoh (data dummy),
lengkap dengan tombol "Pesan via WhatsApp".

## Sebelum dipakai sungguhan

- **Nomor WhatsApp**: buka `components/ProductCard.js`, ganti nilai
  `NOMOR_WA_TOKO` dengan nomor WhatsApp toko yang asli.
- **Supabase**: file `lib/supabaseClient.js` sudah disiapkan, tapi kredensialnya
  belum diisi. Akan kita isi di Tahap 2 setelah project Supabase dibuat —
  copy `.env.local.example` jadi `.env.local` lalu isi di sana.

## Struktur folder

```
app/            → halaman-halaman website (App Router Next.js)
  page.js       → halaman katalog (beranda)
  admin/        → halaman dashboard admin (Tahap 4)
components/     → komponen React yang dipakai berulang
data/           → data contoh sebelum tersambung ke Supabase
lib/            → koneksi ke Supabase
```

## Deploy

Nanti di Tahap 8, project ini akan di-deploy gratis ke [Vercel](https://vercel.com).
"# sibayak-keramik" 
