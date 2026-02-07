# Architecture

## Overview

**thisisrober.es** is a monorepo combining three applications:

1. **Portfolio** — Single-page personal portfolio (dark theme, bilingual)
2. **Blog** — Multi-page blog with categories, posts, and newsletter
3. **Dashboard** — Admin panel for managing all content

All three share a single Express backend (port 3001) and SQLite database.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│  ┌─────────────┬──────────┬──────────────────────┐  │
│  │  Portfolio   │   Blog   │     Dashboard        │  │
│  │  (/)        │  (/blog) │   (/dashboard)       │  │
│  └─────────────┴──────────┴──────────────────────┘  │
│              React 18 + React Router v6              │
│              framer-motion (page transitions)        │
└──────────────────────┬──────────────────────────────┘
                       │ /api/*
                       │ credentials: include
┌──────────────────────▼──────────────────────────────┐
│              Express 4.21 (port 3001)               │
│  ┌───────────┬──────────┬──────────┬──────────────┐ │
│  │ portfolio │   blog   │  admin   │   contact    │ │
│  │  routes   │  routes  │  routes  │   routes     │ │
│  └───────────┴──────────┴──────────┴──────────────┘ │
│  express-session │ multer │ bcryptjs │ cors         │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              sql.js (WASM SQLite)                   │
│              server/database/thisisrober.db         │
│              8 tables, WAL mode, FK enforced        │
└─────────────────────────────────────────────────────┘
```

## Tech Stack Detail

### Frontend
- **React 18** — Functional components, hooks only (no class components)
- **Vite 6** — Dev server (port 5173), HMR, proxies `/api/*` and `/uploads/*` to Express
- **React Router v6** — Client-side routing with `<Routes>` / `<Route>`
- **React Bootstrap** — Grid system, responsive components
- **Bootstrap 5.3** — Utility classes, base styling
- **framer-motion** — `AnimatePresence` page transitions on portfolio/blog routes
- **react-icons** — FontAwesome (`Fa*`) and Feather (`Fi*`) icon sets
- **marked** — Markdown → HTML rendering for blog posts
- **react-simplemde-editor** — Dashboard post editor with restricted toolbar

### Backend
- **Express 4.21** — REST API server
- **sql.js** — SQLite compiled to WASM, runs in Node.js without native bindings
- **express-session** — Server-side sessions (httpOnly cookies, sameSite: lax)
- **bcryptjs** — Password hashing for admin accounts
- **multer** — File upload handling (blog images, site assets, documents)
- **cors** — Cross-origin support for dev environment

### Database
- **sql.js WASM driver** — No native SQLite bindings needed
- **Single file**: `server/database/thisisrober.db` (gitignored)
- **WAL mode** + foreign keys enabled
- **Auto-save**: Every write operation persists to disk via `saveDB()`
- **Helpers**: `get()`, `all()`, `run()`, `exec()` — mirror better-sqlite3 API

## Data Flow

### Portfolio Content
```
Dashboard Settings Page
  → PUT /api/admin/settings
    → site_settings table (hero_name, about_text, tech_items, etc.)

Portfolio Components (Hero, About, TechStack, Contact)
  → GET /api/blog/settings/public
    → Renders dynamic content with fallback defaults
```

### Blog Content
```
Dashboard Posts Page
  → POST/PUT /api/admin/posts (with multer for images)
    → posts table + public/uploads/

Blog Pages (BlogHome, BlogPost, BlogCategory)
  → GET /api/blog/posts, /posts/:slug, /categories
    → Renders markdown with `marked`, bilingual content via lang suffix
```

### Authentication Flow
```
LoginPage → POST /api/admin/login (with optional "remember" flag)
  → express-session cookie (24h default, 30d with remember)
  → AuthContext stores admin state

DashboardLayout checks AuthContext
  → If !admin → redirect to /dashboard/login
  → All admin routes wrapped with requireAuth middleware
```

## Request Lifecycle

1. Browser makes request to Vite dev server (`:5173`)
2. Vite proxies `/api/*` and `/uploads/*` to Express (`:3001`)
3. Express middleware chain: cors → json → session
4. Route handler calls sql.js helpers (get/all/run)
5. sql.js executes query against WASM SQLite
6. Response sent as JSON
7. React component renders data, picks bilingual field via `lang` suffix

## Monorepo Structure

Single `package.json` at root manages all dependencies. No workspaces.

```bash
npm run dev          # concurrently runs Vite + Express
npm run dev:client   # Vite only
npm run dev:server   # Express only (node --watch)
npm run build        # Vite → dist/
npm start            # Express serves dist/ in production
```
