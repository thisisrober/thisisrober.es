import { Router } from 'express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { all, get } from '../database/db.js';

const router = Router();

const __dirname = dirname(fileURLToPath(import.meta.url));
const AI_CONTEXT = readFileSync(join(__dirname, '..', 'ai-context.md'), 'utf-8');

const HF_API_URL = 'https://router.huggingface.co/novita/v3/openai/chat/completions';
const HF_MODEL = 'deepseek/deepseek-r1-0528';

// Simple in-memory rate limiter: max 10 requests per IP per minute
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimits.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Clean rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimits) {
    if (now - val.start > RATE_LIMIT_WINDOW) rateLimits.delete(key);
  }
}, 5 * 60_000);

function buildSystemPrompt(lang) {
  // Fetch dynamic data from database
  let experience = [];
  let certifications = [];
  let projects = [];
  let settings = {};

  try {
    experience = all('SELECT * FROM work_experience ORDER BY start_date DESC');
    certifications = all('SELECT * FROM certifications ORDER BY issue_date DESC');
    projects = all('SELECT * FROM projects ORDER BY created_at DESC');
    const settingsRows = all('SELECT key, value FROM site_settings');
    settingsRows.forEach(row => { settings[row.key] = row.value; });
  } catch { /* fallback to static info */ }

  const langSuffix = lang === 'es' ? '_es' : '_en';
  const otherLangSuffix = lang === 'es' ? '_en' : '_es';

  const expText = experience.map(e => {
    const pos = e[`position${langSuffix}`] || e[`position${otherLangSuffix}`] || '';
    const comp = e[`company${langSuffix}`] || e[`company${otherLangSuffix}`] || '';
    const desc = e[`description${langSuffix}`] || e[`description${otherLangSuffix}`] || '';
    return `${pos} at ${comp} (${e.start_date || ''} - ${e.end_date || 'Present'}): ${desc}`;
  }).join('\n');

  const certText = certifications.map(c => {
    const title = c[`title${langSuffix}`] || c[`title${otherLangSuffix}`] || '';
    const prov = c[`provider${langSuffix}`] || c[`provider${otherLangSuffix}`] || '';
    return `${title} by ${prov} (${c.issue_date || ''})`;
  }).join('\n');

  const projText = projects.map(p => {
    const name = p[`name${langSuffix}`] || p[`name${otherLangSuffix}`] || '';
    const desc = p[`description${langSuffix}`] || p[`description${otherLangSuffix}`] || '';
    return `${name}: ${desc} [Tech: ${p.technologies || ''}]`;
  }).join('\n');

  const aboutText = settings[`about_text${langSuffix}`] || settings[`about_text${otherLangSuffix}`] || '';
  const heroName = settings.hero_name || 'Robert Lita';

  const langInstruction = lang === 'es'
    ? 'IMPORTANT: always respond in Spanish since the user is browsing in Spanish.'
    : 'IMPORTANT: always respond in English since the user is browsing in English.';

  return `${AI_CONTEXT}

${langInstruction}

Here is the information you know about ${heroName}:

About:
${aboutText || 'Full-stack developer at BASF, with previous experience in systems and networks. Develops web applications focused on efficient and scalable technical solutions. Interested in full-stack development with a data-driven approach. Training in data analytics.'}

Work experience:
${expText || 'Full-stack developer at BASF. Previous experience in systems administration and networks.'}

Certifications:
${certText || 'Various certifications in cloud computing, cybersecurity, and development.'}

Projects:
${projText || 'Several web development projects including this portfolio site.'}`;
}

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    return res.status(503).json({ error: 'AI service not configured' });
  }

  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const { message, lang, history } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (message.length > 500) {
    return res.status(400).json({ error: 'Message too long (max 500 characters)' });
  }

  const userLang = lang === 'es' ? 'es' : 'en';
  const systemPrompt = buildSystemPrompt(userLang);

  // Build messages array with limited history
  const messages = [{ role: 'system', content: systemPrompt }];

  // Include up to last 6 messages from history
  if (Array.isArray(history)) {
    const recent = history.slice(-6);
    for (const msg of recent) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: String(msg.content).slice(0, 500),
        });
      }
    }
  }

  messages.push({ role: 'user', content: message.trim() });

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages,
        max_tokens: 300,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`HF API error ${response.status}: ${errText}`);
      return res.status(502).json({ error: 'AI service temporarily unavailable' });
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content || '';

    // Strip <think>...</think> blocks from deepseek reasoning
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    if (!reply) {
      return res.status(502).json({ error: 'Empty response from AI' });
    }

    res.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err.message);
    res.status(500).json({ error: 'Internal error processing AI request' });
  }
});

export default router;
