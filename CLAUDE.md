# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
firebase deploy    # Deploy dist/ to Firebase Hosting
```

No test runner configured yet.

## Architecture

Vite + React 18 (JSX) portfolio app. Firebase project: `h-yusuf-architect`.

**Boot sequence:**
1. `main.jsx` — mounts `<BrowserRouter>` + `<App>`
2. `firebase.js` — initializes Firebase app, exports `auth` and `analytics`
3. `App.jsx` — calls `signInAnonymously(auth)` on mount (non-blocking), defines all routes

**Key architectural decisions:**
- Anonymous auth only — every visitor gets a silent Firebase UID on load; no login UI. Designed for future upgrade to linked accounts without changing the flow.
- Firebase config is hardcoded in `src/firebase.js` (public-safe web API key for `h-yusuf-architect` project).
- All routes are client-side; Firebase Hosting rewrites all paths to `index.html`.

**Route table:**

| Path | Component |
|------|-----------|
| `/` | `src/pages/Home.jsx` |
| `/projects` | `src/pages/Projects.jsx` |
| `/about` | `src/pages/About.jsx` |

Shared UI goes in `src/components/`. Pages are currently stubs — ready to be built out.

## Deployment

`firebase.json` configures Hosting to serve from `dist/` with a catch-all rewrite to `index.html`. Run `npm run build` before `firebase deploy`.
