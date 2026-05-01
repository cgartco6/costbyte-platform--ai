const express = require('express');
const authenticate = require('../middleware/auth');
const { openDb } = require('../db/database');
const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  const { description, package: pkg, price, branding } = req.body;
  const db = await openDb();
  const result = await db.run(
    'INSERT INTO projects (user_id, description, package, price, branding, status) VALUES (?, ?, ?, ?, ?, ?)',
    req.userId, description, pkg, price, JSON.stringify(branding), 'pending_payment'
  );
  res.json({ projectId: result.lastID });
});

router.get('/my', authenticate, async (req, res) => {
  const db = await openDb();
  const projects = await db.all('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC', req.userId);
  res.json(projects);
});

router.get('/:id', authenticate, async (req, res) => {
  const db = await openDb();
  const project = await db.get('SELECT * FROM projects WHERE id = ? AND user_id = ?', req.params.id, req.userId);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

module.exports = router;
