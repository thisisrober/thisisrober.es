import { Router } from 'express';
import { all } from '../database/db.js';

const router = Router();

// GET /api/portfolio/experience
router.get('/experience', (req, res) => {
  res.json(all('SELECT * FROM work_experience ORDER BY start_date DESC, id DESC'));
});

// GET /api/portfolio/certifications
router.get('/certifications', (req, res) => {
  res.json(all('SELECT * FROM certifications ORDER BY issue_date DESC, id DESC'));
});

// GET /api/portfolio/projects
router.get('/projects', (req, res) => {
  res.json(all('SELECT * FROM projects ORDER BY created_at DESC, id DESC'));
});

export default router;
