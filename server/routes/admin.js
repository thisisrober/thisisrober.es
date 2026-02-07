import { Router } from 'express';
import { all, get, run } from '../database/db.js';
import { requireAuth } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

// Separate multer for site assets (images + PDFs)
const publicDir = path.join(__dirname, '..', '..', 'public');
const siteAssetStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine target dir based on the `target` field
    const target = req.body.target || '';
    let dest = publicDir;
    if (target.startsWith('img/')) {
      dest = path.join(publicDir, 'img');
    }
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const target = req.body.target || '';
    // Use the target filename if specified (e.g. "img/logo.png" → "logo.png")
    const basename = target.includes('/') ? target.split('/').pop() : file.originalname;
    cb(null, basename);
  },
});
const siteAssetUpload = multer({
  storage: siteAssetStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.svg'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

const router = Router();

function generateSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-').replace(/^-|-$/g, '');
}

// =============================================
// AUTH
// =============================================

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { username, password, remember } = req.body;
  if (!username || !password) {
    return res.json({ success: false, message: 'Please fill in all fields' });
  }
  const admin = get('SELECT * FROM admins WHERE username = ?', [username]);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.json({ success: false, message: 'Invalid credentials' });
  }
  req.session.adminLoggedIn = true;
  req.session.adminId = admin.id;
  req.session.adminUsername = admin.username;
  // Extend cookie to 30 days if "remember me" is checked
  if (remember) {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
  }
  res.json({ success: true, username: admin.username });
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// GET /api/admin/me
router.get('/me', (req, res) => {
  if (req.session && req.session.adminLoggedIn) {
    return res.json({ loggedIn: true, username: req.session.adminUsername });
  }
  res.json({ loggedIn: false });
});

// =============================================
// DASHBOARD STATS
// =============================================

router.get('/dashboard', requireAuth, (req, res) => {
  const totalPosts = get('SELECT COUNT(*) AS c FROM posts').c;
  const publishedPosts = get('SELECT COUNT(*) AS c FROM posts WHERE published = 1').c;
  const totalCategories = get('SELECT COUNT(*) AS c FROM categories').c;
  const subscribers = get('SELECT COUNT(*) AS c FROM subscribers WHERE active = 1').c;
  const totalProjects = get('SELECT COUNT(*) AS c FROM projects').c;
  const totalExperience = get('SELECT COUNT(*) AS c FROM work_experience').c;
  const totalCerts = get('SELECT COUNT(*) AS c FROM certifications').c;
  const totalViews = get('SELECT COALESCE(SUM(views), 0) AS c FROM posts').c;

  const recentPosts = all(`
    SELECT p.*, c.name_es AS category_name_es, c.name_en AS category_name_en
    FROM posts p JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC LIMIT 5
  `);

  // Posts per month (all months from first post to now)
  const firstPost = get(`SELECT MIN(created_at) AS first FROM posts`);
  let postsPerMonth = [];
  if (firstPost && firstPost.first) {
    const start = new Date(firstPost.first);
    const now = new Date();
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const allMonths = [];
    for (let d = new Date(startMonth); d <= endMonth; d.setMonth(d.getMonth() + 1)) {
      allMonths.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    const dbData = all(`
      SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS count
      FROM posts GROUP BY month ORDER BY month
    `);
    const dbMap = {};
    dbData.forEach(r => { dbMap[r.month] = r.count; });
    postsPerMonth = allMonths.map(m => ({ month: m, count: dbMap[m] || 0 }));
  }

  // Top 5 most viewed posts
  const topPosts = all(`
    SELECT title_es, title_en, views, slug
    FROM posts WHERE published = 1
    ORDER BY views DESC LIMIT 5
  `);

  // Views by category
  const viewsByCategory = all(`
    SELECT c.name_es, COALESCE(SUM(p.views), 0) AS views
    FROM categories c LEFT JOIN posts p ON p.category_id = c.id
    GROUP BY c.id ORDER BY views DESC
  `);

  // 30-day trends
  const subs30d = get("SELECT COUNT(*) AS c FROM subscribers WHERE active = 1 AND subscribed_at >= date('now', '-30 days')").c;
  const posts30d = get("SELECT COUNT(*) AS c FROM posts WHERE created_at >= date('now', '-30 days')").c;
  const projects30d = get("SELECT COUNT(*) AS c FROM projects WHERE created_at >= date('now', '-30 days')").c;
  const views30d = get("SELECT COALESCE(SUM(views), 0) AS c FROM posts WHERE created_at >= date('now', '-30 days')").c;

  res.json({
    stats: { totalPosts, publishedPosts, totalCategories, subscribers, totalProjects, totalExperience, totalCerts, totalViews },
    recentPosts,
    charts: { postsPerMonth, topPosts, viewsByCategory },
    trends: { subs30d, posts30d, projects30d, views30d },
  });
});

// =============================================
// POSTS CRUD
// =============================================

router.get('/posts', requireAuth, (req, res) => {
  const posts = all(`
    SELECT p.*, c.name_es AS category_name_es, c.name_en AS category_name_en
    FROM posts p JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `);
  res.json(posts);
});

router.get('/posts/:id', requireAuth, (req, res) => {
  const post = get('SELECT * FROM posts WHERE id = ?', [parseInt(req.params.id)]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

router.post('/posts', requireAuth, upload.single('featured_image'), (req, res) => {
  const { category_id, title_es, title_en, excerpt_es, excerpt_en, content_es, content_en, published, featured } = req.body;
  const slug = generateSlug(title_es);
  const featuredImage = req.file ? req.file.filename : '';
  const pub = published === 'true' || published === '1' ? 1 : 0;
  const feat = featured === 'true' || featured === '1' ? 1 : 0;

  try {
    const result = run(`
      INSERT INTO posts (category_id, title_es, title_en, slug, excerpt_es, excerpt_en, content_es, content_en, featured_image, published, featured, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [parseInt(category_id), title_es, title_en, slug, excerpt_es, excerpt_en, content_es, content_en, featuredImage, pub, feat, pub ? new Date().toISOString() : null]);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/posts/:id', requireAuth, upload.single('featured_image'), (req, res) => {
  const id = parseInt(req.params.id);
  const { category_id, title_es, title_en, excerpt_es, excerpt_en, content_es, content_en, published, featured } = req.body;
  const pub = published === 'true' || published === '1' ? 1 : 0;
  const feat = featured === 'true' || featured === '1' ? 1 : 0;

  let query, params;
  if (req.file) {
    query = `UPDATE posts SET category_id=?, title_es=?, title_en=?, excerpt_es=?, excerpt_en=?, content_es=?, content_en=?, featured_image=?, published=?, featured=?, updated_at=datetime('now'), published_at=CASE WHEN ? = 1 AND published_at IS NULL THEN datetime('now') ELSE published_at END WHERE id=?`;
    params = [parseInt(category_id), title_es, title_en, excerpt_es, excerpt_en, content_es, content_en, req.file.filename, pub, feat, pub, id];
  } else {
    query = `UPDATE posts SET category_id=?, title_es=?, title_en=?, excerpt_es=?, excerpt_en=?, content_es=?, content_en=?, published=?, featured=?, updated_at=datetime('now'), published_at=CASE WHEN ? = 1 AND published_at IS NULL THEN datetime('now') ELSE published_at END WHERE id=?`;
    params = [parseInt(category_id), title_es, title_en, excerpt_es, excerpt_en, content_es, content_en, pub, feat, pub, id];
  }

  try {
    run(query, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/posts/:id', requireAuth, (req, res) => {
  run('DELETE FROM posts WHERE id = ?', [parseInt(req.params.id)]);
  res.json({ success: true });
});

// =============================================
// CATEGORIES CRUD
// =============================================

router.get('/categories', requireAuth, (req, res) => {
  res.json(all('SELECT * FROM categories ORDER BY name_es'));
});

router.post('/categories', requireAuth, (req, res) => {
  const { name_es, name_en, description_es = '', description_en = '' } = req.body;
  const slug = generateSlug(name_es);
  try {
    run('INSERT INTO categories (name_es, name_en, slug, description_es, description_en) VALUES (?, ?, ?, ?, ?)', [name_es, name_en, slug, description_es, description_en]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/categories/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { name_es, name_en, description_es = '', description_en = '' } = req.body;
  try {
    run('UPDATE categories SET name_es=?, name_en=?, description_es=?, description_en=?, updated_at=datetime(\'now\') WHERE id=?', [name_es, name_en, description_es, description_en, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/categories/:id', requireAuth, (req, res) => {
  run('DELETE FROM categories WHERE id = ?', [parseInt(req.params.id)]);
  res.json({ success: true });
});

// =============================================
// PROJECTS CRUD
// =============================================

router.get('/projects', requireAuth, (req, res) => {
  res.json(all('SELECT * FROM projects ORDER BY created_at DESC'));
});

router.get('/projects/:id', requireAuth, (req, res) => {
  const project = get('SELECT * FROM projects WHERE id = ?', [parseInt(req.params.id)]);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.post('/projects', requireAuth, upload.single('preview_image'), (req, res) => {
  const { name_es, name_en, description_es, description_en, github_link = '', live_link = '', technologies = '', badge = '' } = req.body;
  const previewImage = req.file ? req.file.filename : '';
  try {
    const result = run(`
      INSERT INTO projects (name_es, name_en, description_es, description_en, preview_image, github_link, live_link, technologies, badge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name_es, name_en, description_es, description_en, previewImage, github_link, live_link, technologies, badge]);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/projects/:id', requireAuth, upload.single('preview_image'), (req, res) => {
  const id = parseInt(req.params.id);
  const { name_es, name_en, description_es, description_en, github_link = '', live_link = '', technologies = '', badge = '' } = req.body;

  let query, params;
  if (req.file) {
    query = `UPDATE projects SET name_es=?, name_en=?, description_es=?, description_en=?, preview_image=?, github_link=?, live_link=?, technologies=?, badge=? WHERE id=?`;
    params = [name_es, name_en, description_es, description_en, req.file.filename, github_link, live_link, technologies, badge, id];
  } else {
    query = `UPDATE projects SET name_es=?, name_en=?, description_es=?, description_en=?, github_link=?, live_link=?, technologies=?, badge=? WHERE id=?`;
    params = [name_es, name_en, description_es, description_en, github_link, live_link, technologies, badge, id];
  }

  try {
    run(query, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/projects/:id', requireAuth, (req, res) => {
  run('DELETE FROM projects WHERE id = ?', [parseInt(req.params.id)]);
  res.json({ success: true });
});

// =============================================
// EXPERIENCE CRUD
// =============================================

router.get('/experience', requireAuth, (req, res) => {
  res.json(all('SELECT * FROM work_experience ORDER BY start_date DESC, id DESC'));
});

router.get('/experience/:id', requireAuth, (req, res) => {
  const exp = get('SELECT * FROM work_experience WHERE id = ?', [parseInt(req.params.id)]);
  if (!exp) return res.status(404).json({ error: 'Experience not found' });
  res.json(exp);
});

router.post('/experience', requireAuth, (req, res) => {
  const { position_es, position_en, company_es, company_en, description_es = '', description_en = '', start_date, end_date = null } = req.body;
  try {
    const result = run(`
      INSERT INTO work_experience (position_es, position_en, company_es, company_en, description_es, description_en, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [position_es, position_en, company_es, company_en, description_es, description_en, start_date, end_date || null]);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/experience/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { position_es, position_en, company_es, company_en, description_es = '', description_en = '', start_date, end_date = null } = req.body;
  try {
    run(`UPDATE work_experience SET position_es=?, position_en=?, company_es=?, company_en=?, description_es=?, description_en=?, start_date=?, end_date=? WHERE id=?`,
      [position_es, position_en, company_es, company_en, description_es, description_en, start_date, end_date || null, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/experience/:id', requireAuth, (req, res) => {
  run('DELETE FROM work_experience WHERE id = ?', [parseInt(req.params.id)]);
  res.json({ success: true });
});

// =============================================
// CERTIFICATIONS CRUD
// =============================================

router.get('/certifications', requireAuth, (req, res) => {
  res.json(all('SELECT * FROM certifications ORDER BY issue_date DESC, id DESC'));
});

router.get('/certifications/:id', requireAuth, (req, res) => {
  const cert = get('SELECT * FROM certifications WHERE id = ?', [parseInt(req.params.id)]);
  if (!cert) return res.status(404).json({ error: 'Certification not found' });
  res.json(cert);
});

router.post('/certifications', requireAuth, (req, res) => {
  const { title_es, title_en, provider_es, provider_en, issue_date, credential_url = '' } = req.body;
  try {
    const result = run(`
      INSERT INTO certifications (title_es, title_en, provider_es, provider_en, issue_date, credential_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title_es, title_en, provider_es, provider_en, issue_date, credential_url]);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/certifications/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { title_es, title_en, provider_es, provider_en, issue_date, credential_url = '' } = req.body;
  try {
    run(`UPDATE certifications SET title_es=?, title_en=?, provider_es=?, provider_en=?, issue_date=?, credential_url=? WHERE id=?`,
      [title_es, title_en, provider_es, provider_en, issue_date, credential_url, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/certifications/:id', requireAuth, (req, res) => {
  run('DELETE FROM certifications WHERE id = ?', [parseInt(req.params.id)]);
  res.json({ success: true });
});

// =============================================
// SUBSCRIBERS
// =============================================

router.get('/subscribers', requireAuth, (req, res) => {
  res.json(all('SELECT * FROM subscribers ORDER BY subscribed_at DESC'));
});

router.delete('/subscribers/:id', requireAuth, (req, res) => {
  run('DELETE FROM subscribers WHERE id = ?', [parseInt(req.params.id)]);
  res.json({ success: true });
});

// =============================================
// SITE SETTINGS
// =============================================

router.get('/settings', requireAuth, (req, res) => {
  const rows = all('SELECT * FROM site_settings');
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

router.put('/settings', requireAuth, (req, res) => {
  const entries = Object.entries(req.body);
  try {
    entries.forEach(([key, value]) => {
      const exists = get('SELECT key FROM site_settings WHERE key = ?', [key]);
      if (exists) {
        run('UPDATE site_settings SET value = ?, updated_at = datetime(\'now\') WHERE key = ?', [String(value), key]);
      } else {
        run('INSERT INTO site_settings (key, value) VALUES (?, ?)', [key, String(value)]);
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =============================================
// IMAGE UPLOAD (markdown editor)
// =============================================

router.post('/upload-image', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// =============================================
// SITE ASSET UPLOAD (logo, about image, CV, cover letter)
// =============================================

router.post('/upload-site-asset', requireAuth, siteAssetUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  const target = req.body.target || '';
  // Return the public path
  let publicPath;
  if (target.startsWith('img/')) {
    publicPath = `/${target}`;
  } else {
    publicPath = `/${req.file.filename}`;
  }
  res.json({ success: true, path: publicPath, filename: req.file.filename });
});

// Upload to public root (for PDFs like CV, cover letter)
const rootAssetStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, publicDir),
  filename: (req, file, cb) => {
    const target = req.body.target || file.originalname;
    cb(null, target);
  },
});
const rootAssetUpload = multer({
  storage: rootAssetStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

router.post('/upload-document', requireAuth, rootAssetUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  res.json({ success: true, path: `/${req.file.filename}`, filename: req.file.filename });
});

export default router;
