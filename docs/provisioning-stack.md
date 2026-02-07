# Provisioning Stack

## What is it

The **Provisioning Stack** is a DevOps module integrated into the administration dashboard of thisisrober.es. It allows to manage GitHub repositories, create new projects from predefined templates, deploy them as static sub-projects accessible from the domain, and automatically link them to the portfolio — all without leaving the admin panel.

Accessible from: **Dashboard → DevOps → Provisioning Stack** (`/dashboard/provisioning`)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Frontend (React)                                                │
│  src/pages/dashboard/ProvisioningPage.jsx                        │
│  src/components/dashboard/RepoAttachModal.jsx                    │
├──────────────────────────────────────────────────────────────────┤
│  API Routes (Express)                                            │
│  server/routes/provisioning.js  →  /api/admin/provisioning/*     │
├──────────────────────────────────────────────────────────────────┤
│  Services                                                        │
│  server/services/github.js      →  GitHub REST & GraphQL API     │
│  server/services/templates.js   →  Template generator            │
├──────────────────────────────────────────────────────────────────┤
│  Storage                                                         │
│  site_settings.github_token     →  PAT token stored in DB        │
│  projects/                      →  Cloned repos (deployments)    │
│  public/uploads/                →  Preview images                │
└──────────────────────────────────────────────────────────────────┘
```

All endpoints are protected with `requireAuth` (admin session). The GitHub token is stored encrypted in the `site_settings` table with the key `github_token`.

---

## Initial Setup

### 1. GitHub Token (PAT)

When entering the Provisioning Stack for the first time, a banner is displayed requesting a **Personal Access Token** from GitHub.

**Required token permissions:**
- `repo` — Full access to repositories (create, edit, delete, clone private repos)
- `delete_repo` — Permission to delete repositories
- `read:user` — Read user profile
- `user:email` — Access email

**Flow:**
1. Frontend calls `GET /auth-status` to check if a valid token already exists in the database.
2. If not, the input field is displayed.
3. When saved, `POST /save-token` validates the token against the GitHub API.
4. If valid, it is stored in `site_settings` and the GitHub profile is displayed.

The token can be updated at any time by repeating the process.

---

## Features

### 1. GitHub Profile and Contribution Heatmap

Once the token is configured, the page displays a card with:

- **Avatar, name and login** of the GitHub user
- **Statistics**: public repos, followers, following
- **Contribution heatmap** (last year) — obtained via GitHub GraphQL API (`contributionCalendar`)

The heatmap shows 52 weeks of activity with an indigo color palette ranging from transparent (0 contributions) to `#818cf8` (maximum), replicating the style of the GitHub profile.

---

### 2. Repository List

**Tab: Repositories**

Shows all repositories of the authenticated user with the following features:

#### Information displayed per repo:
- Name, description, primary language
- Visibility (public/private/archived)
- Stars, forks, topics
- Creation date
- Portfolio link status

#### Available filters:
| Filter | Options |
|--------|---------|
| **Search** | By name or description |
| **Language** | All, or filter by specific language (JavaScript, Python, etc.) |
| **Visibility** | All, Public, Private, Archived |
| **Portfolio** | All, In portfolio, Not in portfolio |

#### Automatic grouping:
When the portfolio filter is set to "All", repos are visually grouped into two sections:
1. **In portfolio** — Repos already linked, with green badge `✅ In portfolio`
2. **Not in portfolio** — Unlinked repos

#### Header statistics:
- Total repos displayed vs total
- Total accumulated stars
- Repos linked to portfolio

> **Note:** Repos containing "thisisrober" in the name are automatically hidden from the list.

---

### 3. Repository Detail Modal

Clicking on any repo opens a modal with three tabs:

#### 3.1. General Tab

Allows direct editing in GitHub through the API:

| Field | Description |
|-------|-------------|
| **Name** | Rename the repository |
| **Description** | Edit the description |
| **Visibility** | Change between public and private |

Available actions:
- **Save changes** — Updates the repo on GitHub via `PATCH /repos/:owner/:repo`
- **Deploy to portfolio** — Opens the linking modal (if not already linked)
- **Delete repository** — Opens destructive deletion confirmation

#### 3.2. Collaborators Tab

Complete management of repository collaborators:

- **Add collaborator**: GitHub username + permission level
  - `Read` (pull) — Read-only
  - `Write` (push) — Read and write
  - `Admin` — Full control
- **List collaborators**: avatar, username and current role
- **Remove collaborator**: with confirmation

#### 3.3. Portfolio Tab (only if linked)

Edit project data in the portfolio directly from the modal:

| Field | Description |
|-------|-------------|
| Name (ES/EN) | Bilingual project name |
| Description (ES/EN) | Bilingual description |
| GitHub Link | Locked (not editable) |
| Live Link | Preview URL (e.g.: `/projects/repo-name`) |
| Technologies | Comma-separated list |
| Preview image | Image upload for portfolio card |

---

### 4. Repository Deletion

Deletion is a destructive operation that requires confirmation. When deleting a repo:

1. The **repository is deleted** on GitHub (`DELETE /repos/:owner/:repo`)
2. The **local deployment is deleted** if it exists (folder in `projects/`)
3. The **portfolio entry is deleted** if it was linked (table `projects`)

To confirm, the user must type the exact repository name in a text field.

---

### 5. Create Repository from Template

**Tab: New repository**

Allows creating a new repository on GitHub with pre-generated files from templates.

#### Step 1: Select template

| Template | Icon | Description |
|----------|------|-------------|
| **Basic** | 📄 | MIT License, structured README, `.gitignore` |
| **Data Analysis** | 📊 | Jupyter notebook, `requirements.txt`, `data/raw` and `data/processed` structure |
| **Node.js Fullstack** | 🟢 | React + Express with complete structure, docs and `copilot-instructions.md` |
| **Node.js API** | ⚡ | Express API backend with routes, middleware and tests |
| **React + Vite** | ⚛️ | SPA with React 18, Vite 6 and React Router |
| **Static Site** | 🌐 | HTML/CSS/JS static site ready to deploy |
| **Python Project** | 🐍 | Python structure with modules, tests and setup |

#### Step 2: Configure details

| Field | Required | Description |
|-------|----------|-------------|
| Name | ✅ | Repository name on GitHub |
| Description | ❌ | Brief project description |
| Private | ❌ | Checkbox to create as private repository |

#### Creation process:

1. Repo is created on GitHub with `auto_init: true`
2. Template files are generated
3. Files are pushed to the repo one by one via GitHub content API
4. Confirmation is displayed with link to the created repo

#### Generated files per template:

**All templates include:**
- `README.md` with personalized badges (Preview, LinkedIn, GitHub, Stars)
- `LICENSE` (MIT)
- Appropriate `.gitignore` for the stack

**Specific files:**

| Template | Additional files |
|----------|------------------|
| Data Analysis | `requirements.txt`, `notebooks/analysis.ipynb`, `src/utils.py`, `data/` and `output/` structure |
| Node.js Fullstack | `package.json`, `server/index.js`, `src/main.jsx`, `src/App.jsx`, `vite.config.js`, `index.html`, `src/services/api.js`, `src/styles/main.css`, `.github/copilot-instructions.md`, `docs/README.md` |
| Node.js API | `package.json`, `server/index.js`, `server/routes/api.js`, `.github/copilot-instructions.md`, `docs/README.md` |
| React + Vite | `package.json`, `index.html`, `vite.config.js`, `src/main.jsx`, `src/App.jsx`, `src/styles/main.css`, `.github/copilot-instructions.md` |
| Static Site | `index.html`, `css/style.css`, `js/main.js`, `assets/.gitkeep` |
| Python Project | `requirements.txt`, `setup.py`, Python module (`__init__.py` + `main.py`), `tests/test_main.py`, `docs/.gitkeep` |

---

### 6. Deploy to Portfolio

The deployment flow allows linking a GitHub repository as a project in the portfolio.

#### From repo list:
1. Click on a repo → Detail modal → **Deploy to portfolio**
2. The linking modal opens

#### Linking modal:

| Field | Description |
|-------|-------------|
| Name ES / EN | Bilingual name for the portfolio |
| Description ES / EN | Bilingual description |
| Technologies | Comma-separated list |
| Badge | Optional tag (e.g.: "New", "Featured") |
| Preview image | Image for the project card |

#### Deployment process:

1. The repository is **cloned** (shallow clone, `--depth 1`) to `projects/{repo-name}`
2. If a clone already exists, `git pull` is performed instead
3. An entry is created (or updated) in the `projects` table of the database
4. The preview link is automatically set to `/projects/{repo-name}`
5. The project becomes accessible at `https://thisisrober.es/projects/{repo-name}`

#### Token for private repos:
If the repo is private, the stored token is used to create the clone URL with authentication: `https://{token}@github.com/{owner}/{repo}.git`

---

### 7. Deployment Management

#### Check status:
`GET /deploy-status/:repo` returns:
```json
{
  "deployed": true,
  "path": "/projects/repo-name",
  "attached": true,
  "projectId": 5
}
```

#### Remove deployment:
`DELETE /deploy/:repo` deletes the repo folder in `projects/` without touching the portfolio entry or the repo on GitHub.

---

## API Reference

All endpoints are under `/api/admin/provisioning/` and require authentication.

### Authentication and Token

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth-status` | Check if valid token exists in database |
| `POST` | `/save-token` | Save and validate a new PAT |
| `POST` | `/validate-token` | Validate a token without saving it |

### GitHub Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/github-profile` | Authenticated user profile |
| `GET` | `/github-events` | Recent events (up to 300) |
| `GET` | `/github-contributions` | Contribution calendar (GraphQL, full year) |

### Repositories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/repos` | List all user repos |
| `GET` | `/repos/:owner/:repo` | Repo details + languages |
| `POST` | `/repos` | Create repo from template |
| `PATCH` | `/repos/:owner/:repo` | Update name/description/visibility |
| `DELETE` | `/repos/:owner/:repo` | Delete repo + deploy + portfolio |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/templates` | List all available templates |

### Collaborators

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/repos/:owner/:repo/collaborators` | List collaborators |
| `PUT` | `/repos/:owner/:repo/collaborators/:username` | Add/update collaborator |
| `DELETE` | `/repos/:owner/:repo/collaborators/:username` | Remove collaborator |

### Deployment

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/deploy/:owner/:repo` | Clone/update repo to `projects/` |
| `GET` | `/deploy-status/:repo` | Deployment status and linking |
| `DELETE` | `/deploy/:repo` | Delete local clone |

### Portfolio

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/attach` | Link repo to portfolio (with optional deploy) |
| `GET` | `/portfolio-project/:repo` | Get portfolio project by repo name |
| `PUT` | `/portfolio-project/:id` | Update portfolio project data |

---

## System Files

| File | Purpose |
|------|---------|
| `server/routes/provisioning.js` | All Express routes for the module |
| `server/services/github.js` | GitHub API client (REST + GraphQL) |
| `server/services/templates.js` | Definition and generation of 7 templates |
| `src/pages/dashboard/ProvisioningPage.jsx` | Main dashboard page (tabs, modals, cards) |
| `src/components/dashboard/RepoAttachModal.jsx` | Modal for portfolio linking |
| `src/components/dashboard/DashboardLayout.jsx` | Dashboard layout (contains sidebar link) |

---

## Complete Workflows

### Workflow: New project from zero to portfolio

```
1. Dashboard → Provisioning Stack → New repository
2. Select template (e.g.: React + Vite)
3. Fill name and description → Create
4. Repositories tab → Search for the new repo
5. Click on repo → Deploy to portfolio
6. Fill bilingual names, technologies, image → Deploy
7. Project appears in thisisrober.es/projects/{name}
   and in the portfolio projects section
```

### Workflow: Link existing repo to portfolio

```
1. Dashboard → Provisioning Stack → Repositories
2. Search for the repo you want to link
3. Click on repo → Deploy to portfolio
4. Fill bilingual data → Deploy
5. It gets cloned and becomes accessible as a sub-project
```

### Workflow: Update a deployed project

```
1. Dashboard → Provisioning Stack → Repositories
2. Click on a repo that is already in portfolio
3. Portfolio tab → Edit name, description, image
4. Save changes
```

### Workflow: Completely delete a project

```
1. Click on repo → General tab → Delete repository
2. Type the name to confirm
3. Deleted: repo on GitHub + local clone + portfolio entry
```

---

## Internal Services

### GitHub Service (`server/services/github.js`)

Complete GitHub API client that works with native `fetch` (Node 18+). The token is read from `site_settings` or can be passed as override via header (`X-GitHub-Token`).

**Exported functions:**

| Function | Description |
|----------|-------------|
| `getToken()` | Get stored token from database |
| `validateToken(token)` | Validate token against `/user` |
| `getUser(token?)` | Authenticated user profile |
| `listRepos(token?)` | All repos (paginated, up to 100/page) |
| `getRepo(owner, repo, token?)` | Repo details |
| `getRepoLanguages(owner, repo, token?)` | Repo languages |
| `createRepo({ name, description, isPrivate, autoInit, token })` | Create repository |
| `updateRepo(owner, repo, updates, token?)` | Update metadata |
| `deleteRepo(owner, repo, token?)` | Delete repository |
| `createOrUpdateFile(owner, repo, path, content, message, sha?, token?)` | Create/edit file |
| `getFileContent(owner, repo, path, token?)` | Read file content |
| `getReadme(owner, repo, token?)` | Get decoded README |
| `getUserEvents(username, token?)` | Recent events (up to 300) |
| `getContributionCalendar(username, token?)` | Heatmap via GraphQL |
| `listCollaborators(owner, repo, token?)` | Collaborators list |
| `addCollaborator(owner, repo, username, permission, token?)` | Add collaborator |
| `removeCollaborator(owner, repo, username, token?)` | Remove collaborator |

### Templates Service (`server/services/templates.js`)

Template registry with generator functions. Each template returns an array of `{ path, content }` sent to GitHub API.

The `generateTemplate(templateId, repoName, description)` function is the entry point.

All templates share:
- `readmeHeader()` — Badge block with links to preview, LinkedIn, GitHub and stars
- `mitLicense()` — MIT license with thisisrober copyright

---

## Frontend Components

| Component | Location | Description |
|-----------|----------|-------------|
| `ProvisioningPage` | `src/pages/dashboard/` | Main page with tabs and token management |
| `GitHubProfileCard` | Inside `ProvisioningPage` | Profile card + heatmap |
| `ContributionHeatmap` | Inside `ProvisioningPage` | Contribution calendar visualization |
| `ReposTab` | Inside `ProvisioningPage` | Filterable repo list with cards |
| `NewRepoTab` | Inside `ProvisioningPage` | Creation form from template |
| `RepoDetailModal` | Inside `ProvisioningPage` | Modal with 3 tabs (General/Collaborators/Portfolio) |
| `AttachModal` | Inside `ProvisioningPage` | Quick portfolio deployment modal |
| `ConfirmDeleteModal` | Inside `ProvisioningPage` | Deletion confirmation modal |
| `RepoAttachModal` | `src/components/dashboard/` | Alternative portfolio linking modal |
| `CustomSelect` | Inside `ProvisioningPage` | Custom dropdown for filters |

