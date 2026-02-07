import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { initDB } from './database/db.js';
import portfolioRoutes from './routes/portfolio.js';
import blogRoutes from './routes/blog.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';

// Load .env file in production (lightweight, no extra dependency)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#')) {
      const val = rest.join('=').trim();
      if (val && !process.env[key.trim()]) process.env[key.trim()] = val;
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Initialize database (async — sql.js loads WASM)
await initDB();

// Middleware
if (isProd) {
  app.set('trust proxy', 1); // Trust nginx reverse proxy
} else {
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'thisisrober-dev-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // Default 24h, extended to 30d if "remember me"
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // Set to true after enabling HTTPS with certbot
  }
}));

// Serve uploaded files (both /uploads and /blog/uploads for legacy content)
app.use('/uploads', express.static(join(__dirname, '..', 'public', 'uploads')));
app.use('/blog/uploads', express.static(join(__dirname, '..', 'public', 'uploads')));

// Serve standalone sub-projects (static builds)
app.use('/projects', express.static(join(__dirname, '..', 'projects')));

// Serve public static files (images, PDFs, etc.)
app.use('/img', express.static(join(__dirname, '..', 'public', 'img')));
app.use(express.static(join(__dirname, '..', 'public'), { extensions: ['pdf'] }));

// API routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// In production, serve Vite build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
