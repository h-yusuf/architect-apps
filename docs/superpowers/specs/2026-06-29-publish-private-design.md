# Publish / Private Feature Design

**Date:** 2026-06-29  
**Project:** architect-apps (h-yusuf-architect Firebase)  
**Status:** Approved

---

## Overview

Setiap dokumen punya status **Private** (default) atau **Public**. Dokumen private hanya tampil untuk admin yang sudah login. Dokumen public tampil di frontend publik tanpa perlu login.

---

## Data Model

### Firestore — collection `documents`

Tambah field baru:

```
published: boolean  // false = Private, true = Public
```

- Default untuk dokumen baru: `published: false`
- Dokumen existing saat ini: perlu di-set manual via admin dashboard (toggle satu per satu)

Field lain tidak berubah: `title`, `description`, `slug`, `order`, `content`, `createdAt`, `updatedAt`.

---

## Firestore Query Functions (`src/hooks/useDocs.js`)

### Fungsi baru

```js
listPublishedDocs()
// query: where('published', '==', true), orderBy('order')
// dipakai oleh visitor (anonymous)
```

### Fungsi existing tidak berubah

```js
listDocs()
// query: orderBy('order') — ambil semua, termasuk private
// dipakai admin dashboard + Home saat admin login
```

```js
getDocBySlug(slug)
// tetap sama — DocDetail yang menentukan akses berdasarkan auth state
```

---

## Routing & Auth Logic

Deteksi admin: user Firebase auth bukan anonymous (`!auth.currentUser.isAnonymous`).  
Hook `useAuth` sudah ada di `src/hooks/useAuth.js` — dipakai ulang.

### `Home.jsx`

```
if (admin login)  → listDocs()         → tampilkan semua + badge "Private" pada yang unpublished
if (visitor)      → listPublishedDocs() → tampilkan hanya public
```

### `DocDetail.jsx` (`/doc/:slug`)

```
fetch doc by slug
if (doc null)             → navigate('/404')
if (!doc.published && visitor) → navigate('/404')
if (admin login)          → tampil selalu (termasuk private)
```

### `App.jsx`

Tambah route:
```jsx
<Route path="*" element={<NotFound />} />
```

---

## Komponen & Halaman

### `src/pages/NotFound.jsx` — Halaman baru

- Styled sesuai estetika existing (Cormorant Garamond + Syne, dark theme)
- Teks: "404 — Halaman tidak ditemukan"
- Tombol kembali ke beranda (`/`)
- Tidak perlu Navbar

### `Home.jsx` — Badge "Private"

Card dokumen private di frontend (hanya terlihat admin login) tambah badge kecil **"Private"** di pojok card. Visitor tidak melihat badge ini karena private docs tidak tampil sama sekali.

### `AdminDashboard.jsx` — Toggle Publish

Tiap row tabel tambah:
- Badge status: **"Public"** (hijau/gold) atau **"Private"** (abu-abu)
- Tombol toggle: klik → `updateDoc(id, { published: !doc.published })` → reload list

### `AdminEditDoc.jsx` — Toggle di Form

Tambah toggle/checkbox **"Publish (Public)"** di form edit & create.  
- Default: `false` (Private)  
- Tersimpan saat form submit bersama field lain

---

## Behavior Matrix

| Siapa | Home | `/doc/:slug` private | `/doc/:slug` public |
|-------|------|----------------------|---------------------|
| Visitor (anonymous) | Hanya public docs | Redirect → `/404` | Tampil normal |
| Admin login | Semua docs + badge Private | Tampil normal | Tampil normal |

---

## File yang Dimodifikasi / Dibuat

| File | Perubahan |
|------|-----------|
| `src/hooks/useDocs.js` | Tambah `listPublishedDocs()` |
| `src/pages/Home.jsx` | Cek auth, pilih query, badge Private |
| `src/pages/DocDetail.jsx` | Cek `published` + auth, redirect `/404` |
| `src/pages/AdminDashboard.jsx` | Badge status + tombol toggle publish |
| `src/pages/AdminEditDoc.jsx` | Tambah field `published` di form |
| `src/App.jsx` | Tambah route `*` → `<NotFound />` |
| `src/pages/NotFound.jsx` | **File baru** — halaman 404 |

---

## Out of Scope

- Firestore Security Rules (tidak diubah — akses kontrol di layer aplikasi)
- Migration script otomatis untuk dokumen existing (manual via dashboard)
- Notifikasi email saat publish
