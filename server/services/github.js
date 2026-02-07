/**
 * GitHub API Service
 * Uses native fetch (Node 18+) — no extra dependencies needed.
 * Token stored in site_settings table as 'github_token'.
 */
import { get } from '../database/db.js';

const GITHUB_API = 'https://api.github.com';

/** Get the stored GitHub token from site_settings */
export function getToken() {
  const row = get("SELECT value FROM site_settings WHERE key = 'github_token'");
  return row?.value || '';
}

/** Build headers for GitHub API requests */
function headers(token) {
  const h = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/** Generic GitHub API request */
async function ghFetch(path, options = {}) {
  const token = options.token || getToken();
  if (!token) throw new Error('Token de GitHub no configurado. Ve a Ajustes o introduce un PAT en el Provisioning Stack.');

  const url = path.startsWith('http') ? path : `${GITHUB_API}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...headers(token), ...(options.headers || {}) },
  });

  // Handle rate limiting
  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
    throw new Error('GitHub API rate limit exceeded. Try again later.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `GitHub API error: ${res.status}`);
  }
  return data;
}

// =============================================
// PUBLIC API
// =============================================

/** List all repos for the authenticated user (paginated, returns all) */
export async function listRepos(token) {
  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const batch = await ghFetch(`/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner`, { token });
    repos.push(...batch);
    if (batch.length < perPage) break;
    page++;
  }
  return repos;
}

/** Get a single repo's details */
export async function getRepo(owner, repo, token) {
  return ghFetch(`/repos/${owner}/${repo}`, { token });
}

/** Get repo languages */
export async function getRepoLanguages(owner, repo, token) {
  return ghFetch(`/repos/${owner}/${repo}/languages`, { token });
}

/** Get the authenticated user */
export async function getUser(token) {
  return ghFetch('/user', { token });
}

/** Create a new repository */
export async function createRepo({ name, description = '', isPrivate = false, autoInit = false, token }) {
  return ghFetch('/user/repos', {
    method: 'POST',
    token,
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      auto_init: autoInit,
    }),
  });
}

/** Create or update a file in a repo */
export async function createOrUpdateFile(owner, repo, path, content, message, sha = null, token) {
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
  };
  if (sha) body.sha = sha;

  return ghFetch(`/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  });
}

/** Get file content from a repo */
export async function getFileContent(owner, repo, path, token) {
  try {
    const data = await ghFetch(`/repos/${owner}/${repo}/contents/${path}`, { token });
    return {
      content: Buffer.from(data.content, 'base64').toString('utf-8'),
      sha: data.sha,
    };
  } catch {
    return null;
  }
}

/** Delete a repository (use with caution!) */
export async function deleteRepo(owner, repo, tokenOverride) {
  const token = tokenOverride || getToken();
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Failed to delete: ${res.status}`);
  }
  return { success: true };
}

/** Get repo README content */
export async function getReadme(owner, repo, token) {
  try {
    const data = await ghFetch(`/repos/${owner}/${repo}/readme`, { token });
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}

/** Check if token is valid */
export async function validateToken(token) {
  try {
    const res = await fetch(`${GITHUB_API}/user`, {
      headers: headers(token),
    });
    if (!res.ok) return { valid: false };
    const user = await res.json();
    return { valid: true, login: user.login, avatar: user.avatar_url, name: user.name };
  } catch {
    return { valid: false };
  }
}

/** Check if a token is configured in the database */
export function hasToken() {
  return !!getToken();
}

/** Get user events for contribution heatmap (up to 300 from API) */
export async function getUserEvents(username, token) {
  const events = [];
  for (let page = 1; page <= 10; page++) {
    try {
      const batch = await ghFetch(`/users/${username}/events?per_page=100&page=${page}`, { token });
      if (!Array.isArray(batch) || batch.length === 0) break;
      events.push(...batch);
      if (batch.length < 100) break;
    } catch {
      break;
    }
  }
  return events.map(e => ({
    type: e.type,
    repo: e.repo?.name,
    created_at: e.created_at,
  }));
}

/** Get contribution calendar via GitHub GraphQL API (full year, real counts) */
export async function getContributionCalendar(username, token) {
  const tk = token || getToken();
  if (!tk) throw new Error('Token de GitHub no configurado.');

  const query = `query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }`;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tk}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { username } }),
  });

  if (!res.ok) throw new Error(`GitHub GraphQL error: ${res.status}`);
  const data = await res.json();
  if (data.errors) throw new Error(data.errors[0].message);

  return data.data.user.contributionsCollection.contributionCalendar;
}

/** Update a repository's metadata */
export async function updateRepo(owner, repo, updates, token) {
  return ghFetch(`/repos/${owner}/${repo}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(updates),
  });
}

/** List collaborators for a repo */
export async function listCollaborators(owner, repo, token) {
  return ghFetch(`/repos/${owner}/${repo}/collaborators`, { token });
}

/** Add a collaborator to a repo */
export async function addCollaborator(owner, repo, username, permission = 'push', token) {
  return ghFetch(`/repos/${owner}/${repo}/collaborators/${username}`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ permission }),
  });
}

/** Remove a collaborator from a repo */
export async function removeCollaborator(owner, repo, username, token) {
  const t = token || getToken();
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/collaborators/${username}`, {
    method: 'DELETE',
    headers: headers(t),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Failed to remove collaborator: ${res.status}`);
  }
  return { success: true };
}
