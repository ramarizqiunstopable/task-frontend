# Pengaturan Environment Variables (.env)

Dokumentasi ini menjelaskan cara kerja dan cara mengakses environment variables (variabel lingkungan) untuk API dalam proyek ini.

## 1. Konfigurasi Awal

Proyek ini membutuhkan file `.env` di direktori utama (*root*) proyek. 
Jika file `.env` belum ada, buatlah file baru dengan nama `.env` (atau `.env.local`) sejajar dengan file `package.json`, lalu isi dengan:

```env
NEXT_PUBLIC_API_BASE_URL=https://jsonplaceholder.typicode.com
```

### Penjelasan Prefix `NEXT_PUBLIC_`
Dalam Next.js, variabel yang memiliki prefix `NEXT_PUBLIC_` dapat diakses baik di **Server Components** maupun di **Client Components** (browser). Jika tidak menggunakan prefix ini, variabel tersebut hanya bisa diakses di lingkungan Server demi keamanan. Karena URL API merupakan informasi publik (tidak mengandung key rahasia), penggunaan `NEXT_PUBLIC_` adalah praktik yang disarankan.

---

## 2. Cara Akses di Dalam Kode

Sumber kebenaran tunggal (*Single Source of Truth*) untuk pemanggilan API di proyek ini diatur di dalam file `src/lib/api.ts`. 

Di sana, variabel lingkungan diakses menggunakan `process.env`. Jika kebetulan file `.env` belum dibuat atau gagal dimuat, kita memberikan nilai *fallback* bawaan (https://jsonplaceholder.typicode.com) agar aplikasi tidak *crash*.

```typescript
// Contoh integrasi di src/lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jsonplaceholder.typicode.com';

export async function getUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  // ...
}
```

---

## 3. Menambahkan Endpoint Baru

Jika kamu memiliki *endpoints* API yang berbeda atau ingin mengarahkan API ke server lokal/staging buatanmu sendiri, kamu cukup:
1. Mengubah isi `.env`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
   ```
2. **Restart Development Server**:
   Terminal Next.js (yang menjalankan `npm run dev`) perlu dimatikan sementara (tekan `Ctrl + C`) dan dijalankan kembali agar Next.js membaca ulang file `.env` yang baru diperbarui.

---

## 4. Keamanan (Security)

- **Jangan pernah menaruh API Key rahasia dengan awalan `NEXT_PUBLIC_`**.
- Jika kamu memiliki key rahasia (contoh: `DATABASE_URL` atau `SECRET_API_KEY`), tulis tanpa prefix tersebut di `.env`. Contoh:
  ```env
  SECRET_API_KEY=my-super-secret-key-123
  ```
- Variabel tanpa prefix hanya dapat dibaca di **Server Components** atau API Routes (`src/app/api/...`), sehingga tetap tersembunyi dari browser pengguna.
- File `.env` dan `.env.local` umumnya sudah masuk ke dalam `.gitignore` sehingga tidak akan secara tidak sengaja ter-*commit* ke GitHub.
