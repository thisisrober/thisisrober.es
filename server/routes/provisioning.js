import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { all, get, run } from '../database/db.js';
import * as github from '../services/github.js';
import { TEMPLATES, generateTemplate } from '../services/templates.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectsDir = join(__dirname, '..', '..', 'projects');
const uploadsDir = join(__dirname, '..', '..', 'public', 'uploads');

// Multer for preview images
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

const router = Router();

/** Extract optional GitHub token from request header (PAT fallback) */
function getOverrideToken(req) {
  return req.headers['x-github-token'] || undefined;
}

// =============================================
// AUTH STATUS (check if DB token is configured)
// =============================================

router.get('/auth-status', requireAuth, async (req, res) => {
  // Check if DB has a valid token
  const dbToken = github.getToken();
  if (dbToken) {
    const validation = await github.validateToken(dbToken);
    if (validation.valid) {
      return res.json({ hasToken: true, login: validation.login, avatar: validation.avatar, name: validation.name });
    }
  }
  res.json({ hasToken: false });
});

// =============================================
// SAVE GITHUB TOKEN TO DB
// =============================================

router.post('/save-token', requireAuth, async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ valid: false, message: 'Token requerido' });

  try {
    const result = await github.validateToken(token);
    if (!result.valid) {
      return res.json({ valid: false, message: 'Token inválido o sin permisos suficientes' });
    }
    // Save to site_settings
    const existing = get("SELECT value FROM site_settings WHERE key = 'github_token'");
    if (existing) {
      run("UPDATE site_settings SET value = ? WHERE key = 'github_token'", [token]);
    } else {
      run("INSERT INTO site_settings (key, value) VALUES ('github_token', ?)", [token]);
    }
    res.json({ valid: true, login: result.login, avatar: result.avatar, name: result.name });
  } catch (err) {
    res.status(500).json({ valid: false, message: err.message });
  }
});

// =============================================
// GITHUB USER PROFILE
// =============================================

router.get('/github-profile', requireAuth, async (req, res) => {
  try {
    const token = getOverrideToken(req);
    const user = await github.getUser(token);
    res.json({
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      public_repos: user.public_repos,
      followers: user.followers,
      following: user.following,
      html_url: user.html_url,
      created_at: user.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// GITHUB CONTRIBUTION EVENTS (for heatmap)
// =============================================

router.get('/github-events', requireAuth, async (req, res) => {
  try {
    const token = getOverrideToken(req);
    const user = await github.getUser(token);
    // Fetch up to 10 pages of events (300 events max from GitHub API)
    const events = await github.getUserEvents(user.login, token);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// GITHUB CONTRIBUTION CALENDAR (GraphQL, full year)
// =============================================

router.get('/github-contributions', requireAuth, async (req, res) => {
  try {
    const token = getOverrideToken(req);
    const user = await github.getUser(token);
    const calendar = await github.getContributionCalendar(user.login, token);
    res.json(calendar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// GITHUB TOKEN VALIDATION
// =============================================

router.post('/validate-token', requireAuth, async (req, res) => {
  const { token } = req.body;
  if (!token) return res.json({ valid: false, message: 'Token is required' });
  try {
    const result = await github.validateToken(token);
    res.json(result);
  } catch (err) {
    res.json({ valid: false, message: err.message });
  }
});

// =============================================
// LIST GITHUB REPOS
// =============================================

router.get('/repos', requireAuth, async (req, res) => {
  try {
    const token = getOverrideToken(req);
    const repos = await github.listRepos(token);
    // Simplify response
    const simplified = repos.map(r => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      html_url: r.html_url,
      homepage: r.homepage,
      language: r.language,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      open_issues_count: r.open_issues_count,
      private: r.private,
      archived: r.archived,
      created_at: r.created_at,
      updated_at: r.updated_at,
      pushed_at: r.pushed_at,
      size: r.size,
      default_branch: r.default_branch,
      topics: r.topics || [],
      visibility: r.visibility,
    }));
    res.json(simplified);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// GET SINGLE REPO DETAILS
// =============================================

router.get('/repos/:owner/:repo', requireAuth, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = getOverrideToken(req);
    const [repoData, languages] = await Promise.all([
      github.getRepo(owner, repo, token),
      github.getRepoLanguages(owner, repo, token),
    ]);
    res.json({ ...repoData, languages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// LIST TEMPLATES
// =============================================

router.get('/templates', requireAuth, (req, res) => {
  const list = Object.values(TEMPLATES).map(({ id, name, description, icon }) => ({
    id, name, description, icon,
  }));
  res.json(list);
});

// =============================================
// CREATE REPO FROM TEMPLATE
// =============================================

router.post('/repos', requireAuth, async (req, res) => {
  const { name, description = '', templateId, isPrivate = false } = req.body;

  if (!name) return res.status(400).json({ error: 'Repository name is required' });
  if (!templateId) return res.status(400).json({ error: 'Template is required' });
  if (!TEMPLATES[templateId]) return res.status(400).json({ error: `Template "${templateId}" not found` });

  try {
    // 1. Create the repo on GitHub (with auto_init so it has a default branch)
    const token = getOverrideToken(req);
    const repo = await github.createRepo({ name, description, isPrivate, autoInit: true, token });

    // 2. Generate template files
    const files = generateTemplate(templateId, name, description);

    // 3. Push each file to the repo
    // First get the README.md SHA since auto_init created one
    const existingReadme = await github.getFileContent(repo.owner.login, name, 'README.md', token);

    for (const file of files) {
      let sha = null;
      // If this is README.md and it already exists from auto_init, pass its SHA
      if (file.path === 'README.md' && existingReadme) {
        sha = existingReadme.sha;
      }
      await github.createOrUpdateFile(
        repo.owner.login,
        name,
        file.path,
        file.content,
        `Initial commit: add ${file.path}`,
        sha,
        token
      );
    }

    res.json({
      success: true,
      repo: {
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// DEPLOY REPO TO projects/ FOLDER
// =============================================

router.post('/deploy/:owner/:repo', requireAuth, async (req, res) => {
  const { owner, repo } = req.params;

  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }

  const targetDir = join(projectsDir, repo);

  try {
    // Check if there's a token for private repos
    const token = getOverrideToken(req) || github.getToken();
    const cloneUrl = token
      ? `https://${token}@github.com/${owner}/${repo}.git`
      : `https://github.com/${owner}/${repo}.git`;

    if (fs.existsSync(targetDir)) {
      // Pull latest changes
      execSync('git pull', { cwd: targetDir, stdio: 'pipe' });
      res.json({
        success: true,
        message: `Updated ${repo} in projects/`,
        path: `/projects/${repo}`,
      });
    } else {
      // Clone the repo
      execSync(`git clone --depth 1 ${cloneUrl} "${targetDir}"`, { stdio: 'pipe' });
      res.json({
        success: true,
        message: `Cloned ${repo} to projects/`,
        path: `/projects/${repo}`,
      });
    }
  } catch (err) {
    res.status(500).json({ error: `Deploy failed: ${err.message}` });
  }
});

// =============================================
// ATTACH REPO TO PORTFOLIO (creates project entry)
// =============================================

router.post('/attach', requireAuth, upload.single('preview_image'), async (req, res) => {
  const {
    repo_name,
    repo_full_name,
    name_es,
    name_en,
    description_es,
    description_en,
    github_link,
    live_link = '',
    technologies = '',
    badge = '',
    deploy = 'false',
  } = req.body;

  if (!name_es || !name_en) {
    return res.status(400).json({ error: 'Names (ES/EN) are required' });
  }

  const previewImage = req.file ? req.file.filename : '';

  try {
    // If deploy requested, clone to projects/
    let liveUrl = live_link;
    if (deploy === 'true' && repo_full_name) {
      const [owner, repo] = repo_full_name.split('/');
      const token = getOverrideToken(req) || github.getToken();
      const cloneUrl = token
        ? `https://${token}@github.com/${owner}/${repo}.git`
        : `https://github.com/${owner}/${repo}.git`;
      const targetDir = join(projectsDir, repo);

      if (!fs.existsSync(projectsDir)) fs.mkdirSync(projectsDir, { recursive: true });

      if (fs.existsSync(targetDir)) {
        execSync('git pull', { cwd: targetDir, stdio: 'pipe' });
      } else {
        execSync(`git clone --depth 1 ${cloneUrl} "${targetDir}"`, { stdio: 'pipe' });
      }

      // Set live_link to the projects path (always override with deploy path)
      liveUrl = `/projects/${repo}`;
    }

    // Check if project with this github_link already exists
    const existing = github_link
      ? get('SELECT id FROM projects WHERE github_link = ?', [github_link])
      : null;

    if (existing) {
      // Update existing project
      let query, params;
      if (previewImage) {
        query = `UPDATE projects SET name_es=?, name_en=?, description_es=?, description_en=?, preview_image=?, live_link=?, technologies=?, badge=? WHERE id=?`;
        params = [name_es, name_en, description_es, description_en, previewImage, liveUrl, technologies, badge, existing.id];
      } else {
        query = `UPDATE projects SET name_es=?, name_en=?, description_es=?, description_en=?, live_link=?, technologies=?, badge=? WHERE id=?`;
        params = [name_es, name_en, description_es, description_en, liveUrl, technologies, badge, existing.id];
      }
      run(query, params);
      res.json({ success: true, id: existing.id, updated: true });
    } else {
      // Create new project entry
      const result = run(`
        INSERT INTO projects (name_es, name_en, description_es, description_en, preview_image, github_link, live_link, technologies, badge)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [name_es, name_en, description_es, description_en, previewImage, github_link || '', liveUrl, technologies, badge]);
      res.json({ success: true, id: result.lastInsertRowid, updated: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// UPDATE A GITHUB REPO (name, description, visibility)
// =============================================

router.patch('/repos/:owner/:repo', requireAuth, async (req, res) => {
  const { owner, repo } = req.params;
  const { name, description, private: isPrivate } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (isPrivate !== undefined) updates.private = isPrivate;

  try {
    const token = getOverrideToken(req);
    const updated = await github.updateRepo(owner, repo, updates, token);
    res.json({
      success: true,
      repo: {
        name: updated.name,
        full_name: updated.full_name,
        description: updated.description,
        private: updated.private,
        html_url: updated.html_url,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// DELETE A GITHUB REPO
// =============================================

router.delete('/repos/:owner/:repo', requireAuth, async (req, res) => {
  const { owner, repo } = req.params;
  try {
    await github.deleteRepo(owner, repo);
    // Also remove local deploy if exists
    const targetDir = join(projectsDir, repo);
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    // Also remove from portfolio if attached
    run('DELETE FROM projects WHERE github_link LIKE ?', [`%/${repo}%`]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// COLLABORATORS
// =============================================

router.get('/repos/:owner/:repo/collaborators', requireAuth, async (req, res) => {
  const { owner, repo } = req.params;
  try {
    const token = getOverrideToken(req);
    const collabs = await github.listCollaborators(owner, repo, token);
    res.json(collabs.map(c => ({
      login: c.login,
      avatar_url: c.avatar_url,
      permissions: c.permissions,
      role_name: c.role_name,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/repos/:owner/:repo/collaborators/:username', requireAuth, async (req, res) => {
  const { owner, repo, username } = req.params;
  const { permission = 'push' } = req.body;
  try {
    const token = getOverrideToken(req);
    await github.addCollaborator(owner, repo, username, permission, token);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/repos/:owner/:repo/collaborators/:username', requireAuth, async (req, res) => {
  const { owner, repo, username } = req.params;
  try {
    const token = getOverrideToken(req);
    await github.removeCollaborator(owner, repo, username, token);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// UPDATE PORTFOLIO PROJECT (from provisioning)
// =============================================

router.put('/portfolio-project/:id', requireAuth, upload.single('preview_image'), (req, res) => {
  const { id } = req.params;
  const { name_es, name_en, description_es, description_en, live_link, technologies, badge } = req.body;
  const project = get('SELECT * FROM projects WHERE id = ?', [id]);
  if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

  try {
    const previewImage = req.file ? req.file.filename : project.preview_image;
    run(
      `UPDATE projects SET name_es=?, name_en=?, description_es=?, description_en=?, preview_image=?, live_link=?, technologies=?, badge=? WHERE id=?`,
      [name_es || project.name_es, name_en || project.name_en, description_es || project.description_es, description_en || project.description_en, previewImage, live_link ?? project.live_link, technologies ?? project.technologies, badge ?? project.badge, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================
// GET PORTFOLIO PROJECT BY REPO NAME
// =============================================

router.get('/portfolio-project/:repo', requireAuth, (req, res) => {
  const { repo } = req.params;
  const project = get('SELECT * FROM projects WHERE github_link LIKE ?', [`%/${repo}%`]);
  if (!project) return res.json({ found: false });
  res.json({ found: true, project });
});

// =============================================
// CHECK DEPLOY STATUS
// =============================================

router.get('/deploy-status/:repo', requireAuth, (req, res) => {
  const { repo } = req.params;
  const targetDir = join(projectsDir, repo);
  const deployed = fs.existsSync(targetDir);

  // Check if attached to portfolio
  const project = get('SELECT id, live_link FROM projects WHERE github_link LIKE ?', [`%/${repo}%`]);

  res.json({
    deployed,
    path: deployed ? `/projects/${repo}` : null,
    attached: !!project,
    projectId: project?.id || null,
  });
});

// =============================================
// DELETE DEPLOY
// =============================================

router.delete('/deploy/:repo', requireAuth, (req, res) => {
  const { repo } = req.params;
  const targetDir = join(projectsDir, repo);

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    res.json({ success: true, message: `Removed ${repo} from projects/` });
  } else {
    res.json({ success: true, message: 'Project was not deployed' });
  }
});

export default router;
