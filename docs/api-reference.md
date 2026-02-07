# API Reference

Base URL: `/api` (proxied from Vite dev server on `:5173` to Express on `:3001`)

All requests use `credentials: 'include'` for session cookies.

---

## Portfolio Routes (`/api/portfolio`)

### GET `/portfolio/experience`
Returns all work experience entries, ordered by start_date DESC.

**Response**: `Array<WorkExperience>`

### GET `/portfolio/certifications`
Returns all certifications, ordered by issue_date DESC.

**Response**: `Array<Certification>`

### GET `/portfolio/projects`
Returns all projects, ordered by created_at DESC.

**Response**: `Array<Project>`

---

## Blog Routes (`/api/blog`)

### GET `/blog/posts`
Returns paginated posts with category info.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category_id` | number | — | Filter by category |
| `limit` | number | 10 | Posts per page |
| `offset` | number | 0 | Pagination offset |
| `published_only` | string | 'true' | Show only published posts |

**Response**: `{ posts: Array<Post>, total: number }`

### GET `/blog/posts/:slug`
Returns a single published post by slug. Increments view counter.

**Response**: `Post` (with category fields joined)

### GET `/blog/categories`
Returns all categories.

**Response**: `Array<Category>`

### GET `/blog/categories/:slug`
Returns a single category by slug.

**Response**: `Category`

### POST `/blog/subscribe`
Subscribe an email to the newsletter.

**Body**: `{ email: string, lang?: 'en'|'es' }`

**Response**: `{ success: boolean, message: string }`

### POST `/blog/unsubscribe`
Unsubscribe an email from the newsletter.

**Body**: `{ email: string, lang?: 'en'|'es' }`

**Response**: `{ success: boolean, message: string }`

### GET `/blog/settings/public`
Returns publicly accessible site settings.

**Public keys**: `contact_email`, `contact_location_es`, `contact_location_en`, `availability_status`, `availability_text_es`, `availability_text_en`, `social_links`, `hero_name`, `hero_greeting_en`, `hero_greeting_es`, `about_text_en`, `about_text_es`, `tech_items`

**Response**: `{ [key]: string }`

---

## Contact Routes (`/api/contact`)

### POST `/contact`
Submit contact form message.

**Body**: `{ name, email, message, lang?, website (honeypot), _ts (timestamp) }`

**Security**: Honeypot field, timestamp check (< 2s = bot), IP rate limiting (3/min)

**Response**: `{ success: boolean, message: string }`

---

## Admin Routes (`/api/admin`)

All routes except `/login`, `/logout`, `/me` require `requireAuth` middleware.

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/admin/login` | Login with `{ username, password, remember? }` |
| POST | `/admin/logout` | Destroy session |
| GET | `/admin/me` | Check login status → `{ loggedIn, username? }` |

The `remember` flag extends the session cookie from 24h to 30 days.

### Dashboard Stats

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | Full stats: counts, recent posts, charts data, 30-day trends |

### Posts CRUD

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/posts` | All posts with category info |
| GET | `/admin/posts/:id` | Single post by ID |
| POST | `/admin/posts` | Create post (multipart — supports `featured_image` file) |
| PUT | `/admin/posts/:id` | Update post (multipart) |
| DELETE | `/admin/posts/:id` | Delete post |

### Categories CRUD

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/categories` | All categories |
| POST | `/admin/categories` | Create category |
| PUT | `/admin/categories/:id` | Update category |
| DELETE | `/admin/categories/:id` | Delete category |

### Projects CRUD

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/projects` | All projects |
| GET | `/admin/projects/:id` | Single project |
| POST | `/admin/projects` | Create project (multipart — supports `preview_image`) |
| PUT | `/admin/projects/:id` | Update project (multipart) |
| DELETE | `/admin/projects/:id` | Delete project |

### Experience CRUD

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/experience` | All work experience |
| GET | `/admin/experience/:id` | Single entry |
| POST | `/admin/experience` | Create entry |
| PUT | `/admin/experience/:id` | Update entry |
| DELETE | `/admin/experience/:id` | Delete entry |

### Certifications CRUD

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/certifications` | All certifications |
| GET | `/admin/certifications/:id` | Single entry |
| POST | `/admin/certifications` | Create entry |
| PUT | `/admin/certifications/:id` | Update entry |
| DELETE | `/admin/certifications/:id` | Delete entry |

### Subscribers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/subscribers` | All subscribers |
| DELETE | `/admin/subscribers/:id` | Delete subscriber |

### Settings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/settings` | All site settings (key-value) |
| PUT | `/admin/settings` | Update settings (body = `{ key: value, ... }`) |

### File Uploads

| Method | Path | Description |
|--------|------|-------------|
| POST | `/admin/upload-image` | Upload blog image → `/uploads/filename` (5MB limit) |
| POST | `/admin/upload-site-asset` | Upload site asset to `public/img/` (10MB, images + PDFs) |
| POST | `/admin/upload-document` | Upload document to `public/` root (10MB, PDFs + images) |
