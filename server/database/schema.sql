CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_es TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt_es TEXT NOT NULL,
  excerpt_en TEXT NOT NULL,
  content_es TEXT NOT NULL,
  content_en TEXT NOT NULL,
  featured_image TEXT,
  author TEXT DEFAULT 'Robert Lita Jeler',
  views INTEGER DEFAULT 0,
  published INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  published_at TEXT
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TEXT DEFAULT (datetime('now')),
  active INTEGER DEFAULT 1,
  source TEXT DEFAULT 'blog'
);

CREATE TABLE IF NOT EXISTS work_experience (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  position_es TEXT NOT NULL,
  position_en TEXT NOT NULL,
  company_es TEXT NOT NULL,
  company_en TEXT NOT NULL,
  description_es TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  start_date TEXT,
  end_date TEXT
);

CREATE TABLE IF NOT EXISTS certifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  provider_es TEXT NOT NULL,
  provider_en TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  credential_url TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tier TEXT NOT NULL DEFAULT 'a',
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT NOT NULL,
  description_en TEXT NOT NULL,
  preview_image TEXT,
  github_link TEXT,
  live_link TEXT,
  technologies TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  is_new INTEGER DEFAULT 0,
  not_available INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);
