# Dashboard Guide

The admin dashboard is accessible at `/dashboard` and provides full content management for the portfolio and blog.

**All dashboard UI is in Spanish.**

## Authentication

- Login at `/dashboard/login` with username + password.
- **"Mantener sesión iniciada"** (stay signed in) extends the session from 24h → 30 days.
- Browser password autofill supported (`autocomplete` attributes on form fields).
- Session stored server-side via `express-session` with `httpOnly` + `sameSite: lax` cookies.
- `DashboardLayout` wraps all dashboard pages — redirects to login if not authenticated.

## Pages

### Overview (`/dashboard`)
Main stats dashboard with:
- Stat cards: posts, categories, subscribers, projects, experience, certifications, views
- 30-day trend badges (new subscribers, posts, projects, views)
- Charts: posts per month (bar), top posts by views (bar), views by category (doughnut)
- Recent posts table

### Posts (`/dashboard/posts`)
- List all posts with title, category, status, views, date
- Create new: `/dashboard/posts/new`
- Edit: `/dashboard/posts/edit/:id`
- Markdown editor (SimpleMDE) with restricted toolbar: bold, italic, heading, quote, lists, link, image, table, undo, redo
- Featured image upload ("Imagen destacada")
- Bilingual fields: title, excerpt, content in ES + EN

### Categories (`/dashboard/categories`)
- CRUD for blog categories
- Bilingual name + description
- Auto-generated slug from Spanish name

### Subscribers (`/dashboard/subscribers`)
- View all newsletter subscribers
- CSV export functionality
- Delete individual subscribers

### Projects (`/dashboard/projects`)
- CRUD for portfolio projects
- Bilingual name + description
- Preview image, GitHub/live links, technologies list, badge

### Experience (`/dashboard/experience`)
- CRUD for work history
- Bilingual position + company + description
- Start/end dates

### Certifications (`/dashboard/certifications`)
- CRUD for certifications
- Bilingual title + provider
- Issue date, credential URL

### Settings (`/dashboard/settings`)
Centralized configuration for the entire site:

**General**:
- Contact email, location (ES/EN)
- Availability status (`available`/`busy`/`not_available`) and text (ES/EN)

**Social Links**:
- Dynamic list: platform name + URL
- Supports: github, linkedin, twitter, instagram, youtube, tiktok, discord, twitch, website, email
- Default links pre-populated if empty

**Hero (Portada)**:
- Name displayed on portfolio homepage
- Greeting text in EN/ES

**About Me (Sobre mí)**:
- About section text in EN/ES (supports multiple paragraphs)

**Technologies (Tecnologías del portfolio)**:
- JSON array of `{ name, icon }` objects
- Rendered in portfolio TechStack section
- Falls back to default tech items if empty

**Documents**:
- Upload/replace CV (ES/EN) and presentation (ES/EN) PDFs

### Prompts (`/dashboard/prompts`)
- Utility page for managing AI prompts/templates

## Layout

`DashboardLayout.jsx` provides:
- **Header**: Logo/title, status indicator dropdown (available/busy/not available synced to settings), logout button
- **Sidebar**: Navigation links to all dashboard sections
- **Content area**: Scrollable main region

The status dot color in the portfolio Contact section automatically syncs with the dashboard availability setting.
