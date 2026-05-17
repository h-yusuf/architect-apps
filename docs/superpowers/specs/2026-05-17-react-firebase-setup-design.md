# React + Firebase Setup Design

**Date:** 2026-05-17  
**Project:** architect-apps  
**Status:** Approved

## Summary

Vite + React (JSX) portfolio/showcase app with Firebase Auth (anonymous) and Analytics.

## Stack

- **Bundler:** Vite
- **UI:** React 18 + JSX
- **Routing:** React Router v6
- **Backend:** Firebase SDK v10
  - Auth: Anonymous sign-in (visitors auto-signed in on load)
  - Analytics: Page view tracking

## Project Structure

```
architect-apps/
├── src/
│   ├── firebase.js          # Firebase init — exports app, auth, analytics
│   ├── main.jsx             # Entry point, BrowserRouter wrapper
│   ├── App.jsx              # Route definitions
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Projects.jsx
│   │   └── About.jsx
│   └── components/          # Shared UI components
├── index.html
├── vite.config.js
└── package.json
```

## Firebase Configuration

Project: `h-yusuf-architect`  
Auth domain: `h-yusuf-architect.firebaseapp.com`

```js
const firebaseConfig = {
  apiKey: "AIzaSyBIlMX8uh6TUTVudsbvISd_LQ5DfcHypIQ",
  authDomain: "h-yusuf-architect.firebaseapp.com",
  projectId: "h-yusuf-architect",
  storageBucket: "h-yusuf-architect.firebasestorage.app",
  messagingSenderId: "93248512119",
  appId: "1:93248512119:web:b456aa0931c6eb6f882672",
  measurementId: "G-ZV5ZHG384N"
};
```

## Data Flow

1. App loads → `main.jsx` mounts `<BrowserRouter>`
2. `firebase.js` initializes app, auth, analytics
3. `App.jsx` calls `signInAnonymously(auth)` on mount — visitor gets anonymous UID
4. React Router renders page component based on URL path
5. Analytics logs page views automatically

## Auth Strategy

Anonymous auth only. No login form. Every visitor silently gets a Firebase anonymous UID on first load. This enables future upgrades (e.g., link to Google account) without changing the auth flow.

## Routing

| Path | Component |
|------|-----------|
| `/` | `Home.jsx` |
| `/projects` | `Projects.jsx` |
| `/about` | `About.jsx` |

## Error Handling

- Firebase init failure: log to console, app continues without auth
- `signInAnonymously` failure: log error, non-blocking (analytics still works)

## Dependencies

```
react, react-dom, react-router-dom, firebase
```

Dev: `vite`, `@vitejs/plugin-react`
