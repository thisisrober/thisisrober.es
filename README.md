<div align="center">

# thisisrober.es

Personal portfolio, blog & admin dashboard — full-stack JavaScript, bilingual (ES/EN).

[![Live Site](https://img.shields.io/badge/🌐_Live-thisisrober.es-6366f1?style=for-the-badge)](https://thisisrober.es)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Follow-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/thisisrober)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/thisisrober)
[![Stars](https://img.shields.io/github/stars/thisisrober/thisisrober.es?style=for-the-badge&color=f59e0b)](https://github.com/thisisrober/thisisrober.es/stargazers)

</div>

---

## 📖 Overview

Three apps in a single monorepo sharing one Express backend and SQLite database:

| App | Route | Description |
|-----|-------|-------------|
| **Portfolio** | `/` | Dark-themed single-page personal portfolio with animated sections |
| **Blog** | `/blog` | Multi-page blog with categories, newsletter & markdown rendering |
| **Dashboard** | `/dashboard` | Admin panel for managing all content, settings & subscribers |

All user-facing content is bilingual (Spanish / English) — language is resolved via `?lang=` query param or stored in a cookie.

## 🛠️ Technologies

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18 · Vite 6 · React Router v6 · React Bootstrap · Bootstrap 5.3 · framer-motion · react-icons · marked |
| **Backend** | Express 4.21 · sql.js (SQLite via WASM) · express-session · multer · bcryptjs · cors |
| **Database** | SQLite — single file `server/database/thisisrober.db`, 8 tables, WAL mode |
| **Infra** | AWS Lightsail · Nginx · PM2 · GitHub Actions CI/CD |

## 📂 Project Structure

```
├── package.json                 Root scripts & all deps
├── vite.config.js               Vite — proxies /api & /uploads to Express
├── index.html                   Vite entry point
├── server/
│   ├── index.js                 Express server (port 3001)
│   ├── database/                Schema, seed, sql.js WASM driver
│   ├── routes/                  portfolio · blog · admin · contact · provisioning
│   ├── middleware/               Session auth guard
│   └── services/                GitHub API · repo templates
├── src/
│   ├── App.jsx                  Route definitions
│   ├── components/              portfolio · blog · dashboard · common
│   ├── pages/                   PortfolioPage · blog/* · dashboard/*
│   ├── context/                 Language · Auth · Theme
│   ├── hooks/                   useTranslation · useSocialLinks · useReveal
│   ├── i18n/                    en.js · es.js
│   ├── services/api.js          Fetch wrapper (credentials: include)
│   └── styles/                  variables · portfolio · blog · dashboard
├── public/                      Static assets & uploads
├── projects/                    Standalone deployed sub-projects (read-only)
└── docs/                        Full documentation
```

## 🔄 CI/CD & Versioning

Fully automated on push to `main` via **GitHub Actions**:

1. **Build** — `npm ci` + `vite build`
2. **Deploy** — `rsync` to AWS Lightsail + PM2 reload
3. **Version** — Semantic version bump, git tag & GitHub Release

Commit message prefixes control version bumps:

| Prefix | Bump | Example |
|--------|------|---------|
| `release:` | **Major** (X.0.0) | `release: v5 redesign` |
| `feat:` | **Minor** (x.Y.0) | `feat: add newsletter` |
| `fix:` | **Patch** (x.y.Z) | `fix: mobile nav overlap` |

> Scoped prefixes like `feat(blog):` are also supported.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design, tech stack detail, data flow |
| [API Reference](docs/api-reference.md) | All REST endpoints with request/response examples |
| [Frontend Guide](docs/frontend-guide.md) | Components, routing, i18n, theming |
| [Dashboard Guide](docs/dashboard-guide.md) | Admin panel features and usage |
| [Database Schema](docs/database-schema.md) | All 8 tables with column definitions |
| [Deployment](docs/deployment.md) | AWS setup, Nginx, PM2, CI/CD pipeline |

## 📝 License

Private — All rights reserved.

---

<div align="center">
  Made with ❤️ by <a href="https://thisisrober.es">thisisrober</a>
</div>
