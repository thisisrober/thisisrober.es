import { Router } from 'express';
import { all, get, run } from '../database/db.js';

const router = Router();

// GET /api/blog/posts?category_id=&limit=&offset=&published_only=
router.get('/posts', (req, res) => {
  const { category_id, limit = 10, offset = 0, published_only = 'true' } = req.query;

  let where = published_only === 'true' ? 'WHERE p.published = 1' : '';
  if (category_id) {
    where += (where ? ' AND' : 'WHERE') + ` p.category_id = ${parseInt(category_id)}`;
  }

  const posts = all(`
    SELECT p.*, c.name_es AS category_name_es, c.name_en AS category_name_en, c.slug AS category_slug
    FROM posts p JOIN categories c ON p.category_id = c.id
    ${where}
    ORDER BY p.published_at DESC, p.created_at DESC
    LIMIT ? OFFSET ?
  `, [parseInt(limit), parseInt(offset)]);

  const countRow = get(`SELECT COUNT(*) AS total FROM posts p ${where}`);

  res.json({ posts, total: countRow ? countRow.total : 0 });
});

// GET /api/blog/posts/:slug
router.get('/posts/:slug', (req, res) => {
  const post = get(`
    SELECT p.*, c.name_es AS category_name_es, c.name_en AS category_name_en, c.slug AS category_slug
    FROM posts p JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ? AND p.published = 1
  `, [req.params.slug]);

  if (!post) return res.status(404).json({ error: 'Post not found' });

  run('UPDATE posts SET views = views + 1 WHERE id = ?', [post.id]);
  post.views += 1;

  res.json(post);
});

// GET /api/blog/categories
router.get('/categories', (req, res) => {
  res.json(all('SELECT * FROM categories ORDER BY name_es'));
});

// GET /api/blog/categories/:slug
router.get('/categories/:slug', (req, res) => {
  const category = get('SELECT * FROM categories WHERE slug = ?', [req.params.slug]);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json(category);
});

// POST /api/blog/subscribe
router.post('/subscribe', (req, res) => {
  const { email, lang = 'en' } = req.body;

  const messages = {
    en: { invalid: 'Invalid email address', success: 'Successfully subscribed!', exists: 'This email is already subscribed', error: 'Error saving subscription' },
    es: { invalid: 'Dirección de email inválida', success: '¡Suscripción exitosa!', exists: 'Este email ya está suscrito', error: 'Error al guardar la suscripción' },
  };
  const t = messages[lang] || messages.en;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.json({ success: false, message: t.invalid });
  }

  const existing = get('SELECT id FROM subscribers WHERE email = ?', [email]);
  if (existing) {
    return res.json({ success: false, message: t.exists });
  }

  try {
    run('INSERT INTO subscribers (name, email, source) VALUES (?, ?, ?)', [email, email, 'blog']);
    res.json({ success: true, message: t.success });
  } catch {
    res.json({ success: false, message: t.error });
  }
});

// POST /api/blog/unsubscribe
router.post('/unsubscribe', (req, res) => {
  const { email, lang = 'en' } = req.body;

  const messages = {
    en: { invalid: 'Invalid email address', success: 'You have been unsubscribed successfully', notFound: 'This email is not subscribed', error: 'Error processing request' },
    es: { invalid: 'Dirección de email inválida', success: 'Te has dado de baja correctamente', notFound: 'Este email no está suscrito', error: 'Error al procesar la solicitud' },
  };
  const t = messages[lang] || messages.en;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.json({ success: false, message: t.invalid });
  }

  const existing = get('SELECT id FROM subscribers WHERE email = ?', [email]);
  if (!existing) {
    return res.json({ success: false, message: t.notFound });
  }

  try {
    run('DELETE FROM subscribers WHERE email = ?', [email]);
    res.json({ success: true, message: t.success });
  } catch {
    res.json({ success: false, message: t.error });
  }
});

// GET /api/blog/settings/public — public settings for Contact component
router.get('/settings/public', (req, res) => {
  const rows = all('SELECT * FROM site_settings');
  const allSettings = {};
  rows.forEach(r => { allSettings[r.key] = r.value; });
  const publicKeys = ['contact_email', 'contact_location_es', 'contact_location_en', 'availability_status', 'availability_text_es', 'availability_text_en', 'social_links', 'hero_name', 'hero_greeting_en', 'hero_greeting_es', 'about_text_en', 'about_text_es', 'tech_items'];
  const result = {};
  publicKeys.forEach(k => { if (allSettings[k] !== undefined) result[k] = allSettings[k]; });
  res.json(result);
});

export default router;
