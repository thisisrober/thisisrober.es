# Database Schema

SQLite database managed by **sql.js** (WASM). File: `server/database/thisisrober.db` (gitignored).

## Driver

`server/database/db.js` wraps sql.js with helpers:

| Function | Description |
|----------|-------------|
| `initDB()` | Load WASM, open/create DB, run schema.sql |
| `get(sql, params)` | Single row → object or undefined |
| `all(sql, params)` | Multiple rows → array of objects |
| `run(sql, params)` | INSERT/UPDATE/DELETE → `{ changes, lastInsertRowid }` |
| `exec(sql)` | Raw SQL execution (schema creation) |
| `saveDB()` | Persist DB to disk (auto-called after every `run()`) |
| `getDB()` | Get raw sql.js Database instance |

## Tables

### admins
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| username | TEXT | NOT NULL UNIQUE |
| password | TEXT | NOT NULL (bcryptjs hash) |
| email | TEXT | NOT NULL |
| created_at | TEXT | DEFAULT datetime('now') |

### categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name_es | TEXT | NOT NULL |
| name_en | TEXT | NOT NULL |
| slug | TEXT | NOT NULL UNIQUE |
| description_es | TEXT | DEFAULT '' |
| description_en | TEXT | DEFAULT '' |
| created_at | TEXT | DEFAULT datetime('now') |
| updated_at | TEXT | DEFAULT datetime('now') |

### posts
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| category_id | INTEGER | NOT NULL, FK → categories.id (CASCADE) |
| title_es | TEXT | NOT NULL |
| title_en | TEXT | NOT NULL |
| slug | TEXT | NOT NULL UNIQUE |
| excerpt_es | TEXT | NOT NULL |
| excerpt_en | TEXT | NOT NULL |
| content_es | TEXT | NOT NULL (markdown) |
| content_en | TEXT | NOT NULL (markdown) |
| featured_image | TEXT | filename in public/uploads/ |
| author | TEXT | DEFAULT 'Robert Lita Jeler' |
| views | INTEGER | DEFAULT 0 |
| published | INTEGER | DEFAULT 0 (boolean) |
| featured | INTEGER | DEFAULT 0 (boolean) |
| created_at | TEXT | DEFAULT datetime('now') |
| updated_at | TEXT | DEFAULT datetime('now') |
| published_at | TEXT | Set when first published |

### subscribers
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL UNIQUE |
| subscribed_at | TEXT | DEFAULT datetime('now') |
| active | INTEGER | DEFAULT 1 (boolean) |
| source | TEXT | DEFAULT 'blog' |

### work_experience
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| position_es | TEXT | NOT NULL |
| position_en | TEXT | NOT NULL |
| company_es | TEXT | NOT NULL |
| company_en | TEXT | NOT NULL |
| description_es | TEXT | DEFAULT '' |
| description_en | TEXT | DEFAULT '' |
| start_date | TEXT | |
| end_date | TEXT | NULL = current position |

### certifications
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| title_es | TEXT | NOT NULL |
| title_en | TEXT | NOT NULL |
| provider_es | TEXT | NOT NULL |
| provider_en | TEXT | NOT NULL |
| issue_date | TEXT | NOT NULL |
| credential_url | TEXT | DEFAULT '' |

### projects
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| tier | TEXT | NOT NULL DEFAULT 'a' |
| name_es | TEXT | NOT NULL |
| name_en | TEXT | NOT NULL |
| description_es | TEXT | NOT NULL |
| description_en | TEXT | NOT NULL |
| preview_image | TEXT | filename in public/uploads/ |
| github_link | TEXT | |
| live_link | TEXT | |
| technologies | TEXT | DEFAULT '' (comma-separated) |
| badge | TEXT | DEFAULT '' |
| is_new | INTEGER | DEFAULT 0 |
| not_available | INTEGER | DEFAULT 0 |
| created_at | TEXT | DEFAULT datetime('now') |

### site_settings
| Column | Type | Constraints |
|--------|------|-------------|
| key | TEXT | PRIMARY KEY |
| value | TEXT | NOT NULL DEFAULT '' |
| updated_at | TEXT | DEFAULT datetime('now') |

**Known setting keys**:
- `contact_email` — Contact form email
- `contact_location_es`, `contact_location_en` — Location text
- `availability_status` — `available` | `busy` | `not_available`
- `availability_text_es`, `availability_text_en` — Status description
- `social_links` — JSON array: `[{ platform, url }]`
- `hero_name` — Portfolio hero display name
- `hero_greeting_es`, `hero_greeting_en` — Hero greeting text
- `about_text_es`, `about_text_en` — About section text
- `tech_items` — JSON array: `[{ name, icon }]`

## Initialization

```bash
npm run db:init  # Runs server/database/seed.js
```

This creates the database file, runs schema.sql, and populates initial data.
