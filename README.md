# thisisrober.es

Personal portfolio + blog + admin dashboard. Full-stack JavaScript: React (Vite) frontend, Express + SQLite (sql.js WASM) backend. Bilingual (ES/EN).

## Tech Stack

- **Frontend**: React 18, Vite 6, React Router v6, Bootstrap 5, framer-motion
- **Backend**: Express 4, sql.js (SQLite via WASM), express-session, multer, bcryptjs
- **Database**: SQLite via sql.js — single file with WASM driver

## Quick Start

```bash
npm install
npm run db:init    # First time only — creates & seeds SQLite database
npm run dev        # Starts Vite (5173) + Express (3001) concurrently
```

- Frontend: http://localhost:5173
- API: http://localhost:3001
- Dashboard: http://localhost:5173/dashboard

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite + Express in parallel |
| `npm run build` | Vite production build → `dist/` |
| `npm run db:init` | Create/seed SQLite database |
| `npm start` | Express production server |

## Deployment

Deployed automatically via GitHub Actions on push to `main`. See [docs/deployment.md](docs/deployment.md) for details.

## Versioning

Commit message prefixes control version bumps:
- `release: ...` → major (X.0.0)
- `feat: ...` → minor (x.Y.0)
- `fix: ...` → patch (x.y.Z)

## Documentation

See [docs/](docs/) for architecture, API reference, frontend guide, dashboard guide, and database schema.

## License

Private — All rights reserved.
