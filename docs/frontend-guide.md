# Frontend Guide

## Entry Point

[src/main.jsx](../src/main.jsx) — Mounts React app with providers:

```
BrowserRouter → ThemeProvider → LanguageProvider → AuthProvider → App
```

CSS imports (in order): Bootstrap → variables.css → portfolio.css → blog.css → dashboard.css

## Routing (App.jsx)

| Path | Component | Transition |
|------|-----------|------------|
| `/` | PortfolioPage | AnimatedPage |
| `/blog` | BlogHome | AnimatedPage |
| `/blog/post/:slug` | BlogPost | AnimatedPage |
| `/blog/category/:slug` | BlogCategory | AnimatedPage |
| `/blog/unsubscribe` | UnsubscribePage | AnimatedPage |
| `/dashboard/login` | LoginPage | none |
| `/dashboard` | OverviewPage | none |
| `/dashboard/posts` | PostsPage | none |
| `/dashboard/posts/new` | NewPostPage | none |
| `/dashboard/posts/edit/:id` | EditPostPage | none |
| `/dashboard/categories` | CategoriesPage | none |
| `/dashboard/subscribers` | SubscribersPage | none |
| `/dashboard/projects` | ProjectsPage | none |
| `/dashboard/experience` | ExperiencePage | none |
| `/dashboard/certifications` | CertificationsPage | none |
| `/dashboard/settings` | SettingsPage | none |
| `/dashboard/prompts` | PromptsPage | none |

Public routes (portfolio + blog) use `framer-motion` `AnimatePresence` for fade transitions.

## Contexts

### ThemeContext
- Dark/light toggle. Default: dark.
- Saves to `localStorage('theme')`.
- Toggles `body.dark` / `body.light` classes.
- Hook: `useTheme()` → `{ dark, toggleTheme }`

### LanguageContext
- Language from: `?lang=` param → `language` cookie → default `'en'`.
- Sets `document.documentElement.lang` and cookie (30-day expiry).
- Hook: `useLanguage()` → `{ lang, setLang }`

### AuthContext
- Checks `/api/admin/me` on mount.
- `login(username, password, remember)` — POSTs to `/api/admin/login`.
- `logout()` — POSTs to `/api/admin/logout`.
- Hook: `useAuth()` → `{ admin, loading, login, logout }`

## Hooks

### useTranslation
```js
const { t, lang, setLang } = useTranslation();
// t = translation object (en.js or es.js)
// lang = 'en' | 'es'
```

### useSocialLinks
```js
const links = useSocialLinks();
// Returns Array<{ platform, url }> from site_settings
// Caches in module-level variable — fetches once
```

Helper: `getSocialIcon(platform)` → React icon component

## Components

### Common (`src/components/common/`)
| Component | Purpose |
|-----------|---------|
| **Navbar** | Portfolio navigation — scroll-spy, language/theme toggles, controlled mobile menu with click-outside close |
| **Footer** | Portfolio footer with social links, language switch |
| **ScrollToTop** | Scrolls to top on route change |
| **NewsletterForm** | Email subscription form with modal confirmation |
| **NewsletterModal** | Success/error modal after newsletter subscribe |

### Portfolio (`src/components/portfolio/`)
| Component | Purpose |
|-----------|---------|
| **Hero** | Hero section — name/greeting from settings with fallbacks |
| **About** | About section — text from settings with fallback to i18n strings |
| **TechStack** | Technology grid — items from settings JSON with DEFAULT_TECH fallback |
| **Experience** | Work history + certifications — animated show/hide with height transitions |
| **Projects** | Project cards with images, links, tech badges |
| **Contact** | Contact form + status dot (color synced from dashboard availability setting) |

### Blog (`src/components/blog/`)
| Component | Purpose |
|-----------|---------|
| **BlogNav** | Blog-specific navigation |
| **BlogHeader** | Animated terminal-style typing header |
| **PostCard** | Blog post card with image, excerpt, category badge |
| **BlogSidebar** | Categories list + recent posts |
| **BlogFooter** | Blog footer |
| **ImageLightbox** | Full-screen image viewer with zoom (scroll + buttons), click-outside/Escape close |

### Dashboard (`src/components/dashboard/`)
| Component | Purpose |
|-----------|---------|
| **DashboardLayout** | Sidebar + header + content wrapper. Redirects to `/dashboard/login` if not authenticated. |

## Styling

Four CSS files imported in order:

1. **variables.css** — CSS custom properties for dark/light themes, base resets, shared utility classes, scrollbar styling, text selection, dropdown overrides, responsive helpers
2. **portfolio.css** — Portfolio-specific styles (navbar, hero, about, tech grid, timeline, projects, contact, footer)
3. **blog.css** — Blog pages (header terminal animation, post cards, post body, sidebar, lightbox)
4. **dashboard.css** — Dashboard panel (dark palette, cards, tables, forms, charts, login page)

### Design Tokens
```css
--accent: #818cf8;          /* Primary accent (indigo) */
--gradient: linear-gradient(135deg, #6366f1, #a855f7);  /* Brand gradient */
--bg-primary: #0a0b10;      /* Dark background */
--bg-secondary: #12121a;    /* Card/secondary background */
--text-primary: #f4f4f5;    /* Main text */
--text-secondary: #a1a1aa;  /* Muted text */
```

### Key CSS Patterns
- **Glass cards**: `backdrop-filter: blur()` with semi-transparent backgrounds
- **Scrollbar**: 10px width, fade transition on `scrollbar-color`, no arrows
- **Selection**: Accent background + white text globally
- **Dashboard selection**: `var(--dash-accent)` background
- **Mobile menu**: Absolutely positioned dropdown (no content displacement)

## API Service

`src/services/api.js` — Thin wrapper around `fetch`:

```js
api.get('/blog/posts')           // GET with credentials
api.post('/admin/login', body)   // POST JSON
api.put('/admin/posts/1', form, true)  // PUT FormData
api.delete('/admin/posts/1')     // DELETE
```

All methods return `{ data, status }`. Always use this instead of raw `fetch`.

## Bilingual Pattern

**UI strings**: `src/i18n/en.js` / `es.js` → accessed via `useTranslation()` hook.

**DB content**: API returns all `_es` / `_en` columns. Frontend selects:
```js
post[`title_${lang}`]
```

**Dashboard UI**: Hardcoded in Spanish (not i18n).
