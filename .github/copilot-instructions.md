# Copilot Instructions — thisisrober.es

## Project Overview

Personal portfolio + blog + admin dashboard for **thisisrober.es**. Full-stack JavaScript: React (Vite) frontend, Express + SQLite (sql.js WASM) backend. Bilingual (ES/EN). Monorepo — single `package.json` at root.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 6, React Router v6, React Bootstrap, Bootstrap 5.3, react-icons, framer-motion |
| **Backend** | Express 4.21, sql.js (SQLite via WASM), express-session, multer, bcryptjs, cors |
| **Database** | SQLite via sql.js — single file `server/database/thisisrober.db` with WASM driver |
| **Markdown** | `marked` (frontend rendering), `react-simplemde-editor` (dashboard editor) |
| **Dev tools** | concurrently (runs Vite + Express simultaneously) |

## Architecture

```
├── package.json                  Root scripts & all dependencies
├── vite.config.js                Vite config — proxies /api & /uploads to Express
├── index.html                    Vite entry point (Figtree font, dark body)
├── .gitignore                    Git exclusions
├── server/
│   ├── index.js                  Express server (port 3001)
│   ├── database/
│   │   ├── schema.sql            SQLite table definitions (8 tables)
│   │   ├── seed.js               Populates DB with initial data
│   │   └── db.js                 sql.js WASM driver — get/all/run/exec helpers
│   ├── routes/
│   │   ├── portfolio.js          GET /experience, /certifications, /projects
│   │   ├── blog.js               GET /posts, /posts/:slug, /categories, /settings/public; POST /subscribe, /unsubscribe
│   │   ├── admin.js              Full CRUD: auth, posts, categories, subscribers, projects, experience, certifications, settings, uploads
│   │   └── contact.js            POST / — contact form with honeypot + rate limiting
│   └── middleware/
│       └── auth.js               requireAuth session check
├── src/
│   ├── main.jsx                  App entry — BrowserRouter, providers, CSS imports
│   ├── App.jsx                   Route definitions (portfolio, blog, dashboard)
│   ├── context/
│   │   ├── LanguageContext.jsx    ?lang= param → cookie → default 'en'
│   │   ├── AuthContext.jsx        Admin session state + login/logout (supports "remember me")
│   │   └── ThemeContext.jsx       Dark/light theme toggle (default dark)
│   ├── services/
│   │   └── api.js                Fetch wrapper (get/post/put/delete + FormData, credentials: 'include')
│   ├── hooks/
│   │   ├── useTranslation.js     Returns { t, lang, setLang }
│   │   └── useSocialLinks.js     Fetches & caches social links from settings + platform icon mapping
│   ├── i18n/
│   │   ├── en.js                 English UI strings
│   │   └── es.js                 Spanish UI strings
│   ├── styles/
│   │   ├── variables.css         CSS vars (dark/light), base resets, shared utils, scrollbar, selection
│   │   ├── portfolio.css         Portfolio section styles (navbar, hero, about, tech, etc.)
│   │   ├── blog.css              Blog pages + lightbox styles
│   │   └── dashboard.css         Admin dashboard panel styles
│   ├── components/
│   │   ├── common/               Navbar, Footer, ScrollToTop, NewsletterForm, NewsletterModal
│   │   ├── portfolio/            Hero, About, TechStack, Experience, Projects, Contact
│   │   ├── blog/                 BlogNav, BlogHeader, PostCard, BlogSidebar, BlogFooter, ImageLightbox
│   │   └── dashboard/            DashboardLayout (header + sidebar + content wrapper)
│   └── pages/
│       ├── PortfolioPage.jsx     Assembles all portfolio sections
│       ├── blog/                 BlogHome, BlogPost, BlogCategory, UnsubscribePage
│       └── dashboard/            LoginPage, OverviewPage, PostsPage, NewPostPage, EditPostPage,
│                                 CategoriesPage, SubscribersPage, ProjectsPage, ExperiencePage,
│                                 CertificationsPage, SettingsPage, PromptsPage
├── public/
│   ├── img/                      Portfolio images
│   │   └── tech/                 Tech stack logos
│   ├── uploads/                  Blog image uploads (runtime, gitignored)
│   ├── cv-es.pdf, cv-eng.pdf    Downloadable CVs
│   └── presentacion.pdf, presentation.pdf  Downloadable presentations
├── projects/                     Standalone deployed sub-projects — DO NOT MODIFY
└── docs/                         Project documentation
```

## Database

SQLite file via **sql.js** (WASM) with **8 tables**:

| Table | Purpose |
|-------|---------|
| `admins` | Admin users (bcryptjs hashed passwords) |
| `categories` | Blog categories (name_es/name_en, slug) |
| `posts` | Blog posts (title/excerpt/content in _es/_en, markdown, views counter) |
| `subscribers` | Newsletter subscribers (name, email, active flag) |
| `work_experience` | Portfolio work history (bilingual columns, start/end dates) |
| `certifications` | Portfolio certifications (bilingual columns, issue_date, credential_url) |
| `projects` | Portfolio projects (bilingual, preview_image, github/live links, technologies, badge) |
| `site_settings` | Key-value settings (contact info, social links, hero text, about text, tech items, availability) |

All bilingual content uses **column pairs**: `field_es` / `field_en`.

**Database driver**: Uses `sql.js` (WASM-based SQLite). The `db.js` module exports `get()`, `all()`, `run()`, `exec()` helpers that mirror better-sqlite3 API. The DB auto-saves to disk after every write via `saveDB()`.

## Scripts

```bash
npm run dev          # Runs Vite + Express concurrently
npm run dev:client   # Vite dev server (port 5173)
npm run dev:server   # Express API (port 3001, --watch mode)
npm run build        # Vite production build → dist/
npm run db:init      # Creates/seeds SQLite database
npm start            # Express serves built files in production
```

## Development

- Vite dev server on `http://localhost:5173`
- Express API on `http://localhost:3001`
- Vite proxies `/api/*` and `/uploads/*` to Express automatically
- Run `npm run db:init` before first `npm run dev`
- Server uses `node --watch` for auto-restart on changes

## Bilingual (i18n) Pattern

Language determined by `?lang=es|en` query param → stored in `language` cookie (30 days). Default: `en`.

- **UI strings**: `src/i18n/en.js` and `src/i18n/es.js` — accessed via `useTranslation()` hook returning `{ t, lang, setLang }`.
- **DB content**: API returns all fields; frontend picks `post['title_' + lang]`, etc.
- When adding new UI text, add entries to **both** `en.js` and `es.js`.

## Design System

- **Theme**: Dark by default (body class `dark`). Light theme toggleable via ThemeContext.
- **Colors**: Indigo-purple gradient (`#6366f1 → #a855f7`). Accent: `--accent: #818cf8`.
- **Fonts**: Figtree (body, Google Fonts), JetBrains Mono (code/terminal).
- **Dashboard palette**: Dark bg (`#09090b`), cards (`#12121a`), accent (`#818cf8`).
- **Blog palette**: Light body for posts with dark nav/footer.
- **Scrollbar**: Custom 10px with fade transition, no arrows.
- **Selection**: Accent color background, white text (globally + dashboard-specific).
- **Page transitions**: framer-motion `AnimatePresence` on public routes (portfolio, blog).

## Key Conventions

- **Component structure**: Functional components with hooks. No class components.
- **State management**: React Context (LanguageContext, AuthContext, ThemeContext). No Redux.
- **Routing**: React Router v6 with `<Routes>` / `<Route>`. Blog at `/blog/*`, dashboard at `/dashboard/*`.
- **Styling**: Bootstrap 5 + custom CSS. CSS variables defined in `variables.css`. Never use inline styles except for dynamic values (e.g., status color).
- **Icons**: react-icons — primarily `Fa*` (FontAwesome) and `Fi*` (Feather).
- **Markdown**: Blog posts stored as Markdown in DB. Rendered client-side with `marked`. Dashboard editor uses `react-simplemde-editor` with restricted toolbar.
- **API calls**: Use `src/services/api.js` wrapper — never raw `fetch` in components.
- **Auth**: express-session server-side (httpOnly, sameSite lax). AuthContext checks `/api/admin/me` on mount. DashboardLayout redirects to login if `!admin`. Supports "remember me" (30-day cookie).
- **File uploads**: multer → `public/uploads/`, filename: `Date.now()_random.ext`.
- **SQL**: Use sql.js helpers (`get`, `all`, `run`) with parameter binding. No raw string interpolation.
- **Social links**: Stored as JSON in `site_settings.social_links`. Fetched via `useSocialLinks()` hook with caching.
- **Dynamic settings**: Hero name/greeting, about text, tech items, availability status — all editable from dashboard Settings page, fetched via `/api/blog/settings/public`.

## When Modifying

- **New portfolio section**: Add component in `src/components/portfolio/`, import in `PortfolioPage.jsx`, add i18n strings to both `en.js`/`es.js`, styles in `portfolio.css`.
- **New blog feature**: Add route in `server/routes/blog.js`, create React page/component in `src/pages/blog/`, add i18n strings, styles in `blog.css`.
- **New dashboard feature**: Add route in `server/routes/admin.js` (behind `requireAuth`), create page in `src/pages/dashboard/`, wrap with `<DashboardLayout>`, add sidebar link in `DashboardLayout.jsx`, styles in `dashboard.css`.
- **New DB table**: Add to `schema.sql`, update `seed.js` if needed, run `npm run db:init`.
- **New setting**: Add key to `site_settings`, add to `publicKeys` array in `blog.js` GET `/settings/public` if it should be publicly accessible.
- **Never hardcode language strings** — always use the i18n pattern.
- **Dashboard UI is in Spanish** — all dashboard labels, buttons, and messages are hardcoded in Spanish (not i18n).

## File Patterns

- `projects/` contains standalone deployed sub-projects — treat as independent, **never modify** their build outputs.
- `public/` is served statically by both Vite (dev) and Express (production).
- `docs/` holds project documentation.
- `server/database/thisisrober.db` is gitignored — regenerate with `npm run db:init`.
