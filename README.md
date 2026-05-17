# H. Yusuf — Architect Portfolio & CMS

Portfolio pribadi arsitek dengan sistem CMS berbasis Firestore. Admin bisa kelola dokumen markdown; visitor hanya bisa membaca.

---

## Stack

- **Vite + React 18** — build tool & UI framework
- **Firebase** — Auth (anonymous + email/password), Firestore (database), Hosting
- **Tailwind CSS v4** + `@tailwindcss/typography` — styling + prose markdown
- **react-markdown** — render markdown ke HTML

---

## Cara Menjalankan

```bash
npm install
npm run dev        # dev server dengan HMR → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview hasil build
firebase deploy    # deploy ke Firebase Hosting
```

---

## Fitur

### Halaman Publik (Visitor)

| Route | Keterangan |
|---|---|
| `/` | Daftar semua dokumen (judul + deskripsi singkat) |
| `/doc/:slug` | Detail dokumen — render markdown dengan TOC sidebar |

- Halaman utama: **featured card** (dokumen pertama by order) + **grid card** sisanya
- TOC sidebar otomatis dari heading `##` dan `###` dalam konten
- Responsive: single column (mobile), 2 col (tablet), 3 col (desktop)
- Dark/light mode toggle

### Panel Admin

| Route | Keterangan |
|---|---|
| `/admin` | Halaman login |
| `/admin/dashboard` | Tabel semua dokumen + aksi |
| `/admin/doc/new` | Buat dokumen baru |
| `/admin/doc/:id/edit` | Edit dokumen |

**Fitur admin:**
- Login email/password Firebase (akun dibuat manual di Firebase Console)
- Buat, edit, hapus dokumen markdown
- Upload file `.md` langsung — tidak perlu copy-paste
- Download dokumen sebagai file `.md` (tombol hanya tampil saat login admin)
- Auto-generate slug dari judul, bisa di-override manual
- Validasi slug unik sebelum simpan

---

## Cara Menggunakan (Admin)

### 1. Login

Buka `/admin`, masukkan email dan password akun admin.

### 2. Buat Dokumen Baru

1. Klik **Dokumen Baru** di dashboard
2. Isi **Judul** — slug otomatis ter-generate
3. Isi **Deskripsi Singkat** — tampil di halaman utama
4. Set **Urutan** — angka kecil tampil lebih awal
5. Tulis konten di textarea **Markdown**, ATAU klik **Upload .md** untuk upload file langsung
6. Klik **Simpan**

### 3. Edit / Hapus

- Klik **Edit** pada baris dokumen
- Klik **Hapus** untuk menghapus (ada konfirmasi)
- **Download .md** tersedia di halaman detail dokumen (hanya saat login admin)

### 4. Logout

Klik **Logout** di dashboard. Session kembali ke anonymous visitor otomatis.

---

## Firestore Schema

```
documents/{docId}
  title:       string       // judul dokumen
  description: string       // deskripsi singkat
  content:     string       // konten markdown lengkap
  slug:        string       // URL-friendly identifier, unik
  order:       number       // urutan tampil di halaman utama
  createdAt:   timestamp
  updatedAt:   timestamp
```

**Security rules:**

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /documents/{docId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.firebase.sign_in_provider != 'anonymous';
    }
  }
}
```

---

## Struktur File

```
src/
  firebase.js               // init Firebase, export auth + db
  hooks/
    useAuth.js              // subscribe auth state
    useDocs.js              // Firestore CRUD
  components/
    MarkdownRenderer.jsx    // render react-markdown + TOC sidebar
    ProtectedRoute.jsx      // redirect ke /admin jika belum login
    ThemeToggle.jsx         // dark/light mode toggle
  pages/
    Home.jsx                // halaman utama (featured + grid)
    DocDetail.jsx           // halaman detail + TOC
    AdminLogin.jsx          // form login
    AdminDashboard.jsx      // tabel dokumen
    AdminEditDoc.jsx        // form create/edit + upload .md
  App.jsx                   // semua routes
  index.css                 // Tailwind + CSS variables + animasi
```

---

## Firebase Setup

1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password + Anonymous
3. Buat akun admin manual: Authentication → Users → Add user
4. Buat **Firestore Database** (production mode, region `asia-southeast1`)
5. Pasang security rules seperti di atas
6. Update config di `src/firebase.js` dengan credentials project

---

## Deployment

```bash
npm run build
firebase deploy
```

Firebase Hosting dikonfigurasi dengan catch-all rewrite ke `index.html` untuk client-side routing.
