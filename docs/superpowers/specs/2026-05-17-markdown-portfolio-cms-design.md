# Markdown Portfolio CMS — Design Spec

**Date:** 2026-05-17
**Project:** architect-apps
**Status:** Approved

## Summary

Tambah sistem CMS berbasis Firestore ke app portfolio yang sudah ada. Admin bisa create/edit/delete dokumen markdown. Visitor hanya bisa baca. Tampilan: halaman utama numbered list, halaman detail render markdown dengan TOC sidebar.

## Stack Tambahan

- **Tailwind CSS** + `@tailwindcss/typography` — styling + prose markdown
- **react-markdown** — render markdown ke HTML
- **Firebase Firestore** — penyimpanan dokumen (ditambah ke `src/firebase.js` yang sudah ada)

## Firestore Schema

```
documents/{docId}
  title:       string       // judul dokumen
  description: string       // deskripsi singkat (tampil di list)
  content:     string       // isi markdown lengkap
  slug:        string       // URL-friendly identifier, unik
  order:       number       // urutan di halaman utama
  createdAt:   timestamp
  updatedAt:   timestamp
```

## Routes

| Route | Komponen | Akses |
|---|---|---|
| `/` | `Home` | Semua |
| `/doc/:slug` | `DocDetail` | Semua |
| `/admin` | `AdminLogin` | Semua (redirect ke dashboard jika sudah login) |
| `/admin/dashboard` | `AdminDashboard` | Admin saja |
| `/admin/doc/new` | `AdminEditDoc` | Admin saja |
| `/admin/doc/:id/edit` | `AdminEditDoc` | Admin saja |

## File Structure

```
src/
  firebase.js               // tambah: getFirestore export
  hooks/
    useAuth.js              // subscribe ke auth state, return {user, loading}
    useDocs.js              // Firestore CRUD: list, get by slug, create, update, delete
  components/
    Navbar.jsx              // header nama + link navigasi
    ProtectedRoute.jsx      // redirect ke /admin jika tidak login
    MarkdownRenderer.jsx    // render react-markdown + generate TOC dari headings
  pages/
    Home.jsx                // numbered list dokumen (dari Firestore)
    DocDetail.jsx           // render markdown + TOC sidebar kanan
    AdminLogin.jsx          // form email/password, Firebase signInWithEmailAndPassword
    AdminDashboard.jsx      // tabel dokumen + tombol new/edit/delete
    AdminEditDoc.jsx        // form: title, description, textarea markdown (shared create+edit)
  App.jsx                   // update: tambah semua routes baru
```

## Data Flow

### Visitor
1. Buka `/` → `useDocs.listDocs()` fetch semua dokumen, urut by `order`
2. Klik item → navigate ke `/doc/:slug`
3. `DocDetail` fetch dokumen by slug → render markdown + extract headings untuk TOC

### Admin
1. Buka `/admin` → form login → `signInWithEmailAndPassword`
2. Redirect ke `/admin/dashboard`
3. Dashboard: list semua dokumen, tombol Edit (→ `/admin/doc/:id/edit`) dan Delete
4. New/Edit: form title + description + textarea markdown → simpan ke Firestore

## Auth

- Firebase Auth email/password
- Akun admin dibuat manual di Firebase Console (tidak ada self-register)
- `useAuth` hook expose `user` object — `ProtectedRoute` redirect ke `/admin` jika `user === null`
- Anonymous auth visitor tetap jalan seperti sekarang (tidak berubah)

## Komponen Detail

### `useDocs.js`
```js
listDocs()           // getDocs, query orderBy('order')
getDocBySlug(slug)   // query where('slug', '==', slug)
createDoc(data)      // addDoc + set createdAt/updatedAt
updateDoc(id, data)  // updateDoc + set updatedAt
deleteDoc(id)        // deleteDoc
```

### `MarkdownRenderer.jsx`
- Terima prop `content` (string markdown)
- Render via `<ReactMarkdown>` dengan class `prose` dari Tailwind Typography
- Extract semua heading (`##`, `###`) untuk generate TOC
- TOC tampil di sidebar kanan sticky

### `AdminEditDoc.jsx`
- Dipakai untuk create DAN edit (cek ada `id` param atau tidak)
- Field: `title` (text input), `description` (text input), `content` (textarea)
- Field `slug` auto-generate dari `title` (lowercase, replace spasi dengan `-`, strip karakter non-alphanumeric). Admin bisa override manual. Validasi: slug tidak boleh duplikat — cek via `getDocBySlug` sebelum simpan, tampil error jika sudah ada.
- Field `order` input number
- Simpan → redirect ke `/admin/dashboard`

## Error Handling

- Firestore fetch gagal: tampil pesan error, bukan crash
- Login gagal: tampil pesan dari Firebase Auth error code
- Dokumen tidak ditemukan (slug invalid): tampil 404 message, link balik ke home
- Delete: konfirmasi dialog browser sebelum hapus

## Visual Theme

Dark mode. Background `#0f0f0f`, card/panel `#1a1a1a`, border `#333`, teks utama `#e5e5e5`, teks sekunder `#888`, aksen `indigo-500` (`#6366f1`).

## Tailwind Setup

Tailwind v4 dengan Vite plugin. `@tailwindcss/typography` untuk class `prose` di `MarkdownRenderer`.

```js
// vite.config.js — tambah tailwindcss plugin
import tailwindcss from '@tailwindcss/vite'
```

```css
/* src/index.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```
