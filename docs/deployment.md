# Deployment

## Prerequisites

- **Node.js** ≥ 18 (tested on v24.12.0)
- **npm** (comes with Node.js)

No native dependencies needed — sql.js uses WASM (no C compiler required).

## Development Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd new-tsr

# 2. Install dependencies
npm install

# 3. Initialize the database
npm run db:init

# 4. Start development servers
npm run dev
```

This runs Vite (`:5173`) and Express (`:3001`) concurrently. Vite proxies API requests automatically.

- Portfolio: http://localhost:5173
- Blog: http://localhost:5173/blog
- Dashboard: http://localhost:5173/dashboard

## Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

In production, Express serves the Vite build from `dist/` and handles all API routes. The catch-all `*` route serves `index.html` for client-side routing.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Express server port |
| `NODE_ENV` | — | Set to `production` to serve static files from dist/ |

### Session Secret

Currently hardcoded in `server/index.js`. For production, replace with an environment variable:

```js
secret: process.env.SESSION_SECRET || 'thisisrober-secret-key-2026'
```

## File Storage

- **Blog images**: `public/uploads/` — created at runtime, gitignored
- **Site assets**: `public/img/` — logo, profile picture, tech logos
- **Documents**: `public/` root — CVs and presentations (PDFs)
- **Database**: `server/database/thisisrober.db` — gitignored, regenerate with `npm run db:init`

## Production Considerations

1. **Session store**: Default uses in-memory sessions. For production, consider `connect-sqlite3` or `connect-redis` session store.
2. **CORS**: Currently allows `http://localhost:5173`. Update for production domain.
3. **HTTPS**: Use a reverse proxy (nginx, Caddy) or platform-provided SSL.
4. **File uploads**: Consider external storage (S3, Cloudflare R2) for scaling.
5. **Contact form**: Currently logs to console. Integrate with a mail service (SendGrid, Resend, etc.) for production email delivery.
6. **Rate limiting**: Contact form has basic IP rate limiting. Consider `express-rate-limit` for broader API protection.
7. **Backups**: The SQLite database should be backed up regularly. It's a single file at `server/database/thisisrober.db`.

## Standalone Projects

The `projects/` directory contains independently deployed sub-projects with their own build outputs. These are served as static files and should never be modified during development of the main site.
