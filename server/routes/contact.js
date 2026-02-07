import { Router } from 'express';

const router = Router();

// Simple in-memory rate limiter per IP
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // max 3 per minute

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimits.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Sanitize input — strip HTML tags, limit length
function sanitize(str, maxLen = 1000) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').replace(/&/g, '&amp;').trim().slice(0, maxLen);
}

// Validate email format strictly
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 200;
}

// POST /api/contact
router.post('/', (req, res) => {
  const { name, email, message, lang = 'en', website, _ts } = req.body;

  const messages = {
    en: { success: 'Message sent successfully!', error: 'Error sending message. Please try again.', validation: 'Please fill all fields.', rate: 'Too many requests. Please wait a moment.', bot: 'Request rejected.' },
    es: { success: '¡Mensaje enviado correctamente!', error: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.', validation: 'Por favor completa todos los campos.', rate: 'Demasiadas solicitudes. Espera un momento.', bot: 'Solicitud rechazada.' },
  };
  const t = messages[lang] || messages.en;

  // Honeypot check — bots fill hidden fields
  if (website) {
    return res.json({ success: false, message: t.bot });
  }

  // Timestamp check — form submitted too fast (< 2s = bot)
  if (_ts && Date.now() - Number(_ts) < 2000) {
    return res.json({ success: false, message: t.bot });
  }

  // Rate limit by IP
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ success: false, message: t.rate });
  }

  // Validate & sanitize inputs
  const cleanName = sanitize(name, 100);
  const cleanEmail = sanitize(email, 200);
  const cleanMessage = sanitize(message, 5000);

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return res.json({ success: false, message: t.validation });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.json({ success: false, message: t.validation });
  }

  // Check for injection patterns in email headers
  if (/[\r\n]/.test(cleanName) || /[\r\n]/.test(cleanEmail)) {
    return res.json({ success: false, message: t.bot });
  }

  // In production, integrate with a mail service (SendGrid, Resend, etc.)
  console.log(`📧 Contact form: ${cleanName} <${cleanEmail}> — ${cleanMessage.substring(0, 100)}`);
  res.json({ success: true, message: t.success });
});

export default router;
