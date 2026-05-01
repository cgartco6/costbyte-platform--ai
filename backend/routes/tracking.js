const express = require('express');
const authenticate = require('../middleware/auth');
const { openDb } = require('../db/database');
const router = express.Router();

router.post('/record-revenue', authenticate, async (req, res) => {
  const { projectId, amount, currency = 'ZAR' } = req.body;
  const db = await openDb();
  await db.run('INSERT INTO revenue (project_id, amount, currency, recorded_at) VALUES (?, ?, ?, datetime("now"))', projectId, amount, currency);
  res.json({ success: true });
});

router.get('/dashboard/:userId', authenticate, async (req, res) => {
  const userId = req.params.userId;
  if (parseInt(userId) !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  const db = await openDb();
  const revenueData = await db.all(`
    SELECT r.amount, r.currency, r.recorded_at, p.description
    FROM revenue r
    JOIN projects p ON r.project_id = p.id
    WHERE p.user_id = ?
    ORDER BY r.recorded_at DESC
  `, userId);
  const totalRevenue = revenueData.reduce((sum, row) => sum + row.amount, 0);
  const mrr = totalRevenue / 12;
  const targetRow = await db.get('SELECT monthly_target FROM user_targets WHERE user_id = ?', userId);
  const target = targetRow ? targetRow.monthly_target : 0;
  const progress = target > 0 ? (mrr / target) * 100 : 0;
  res.json({ totalRevenue, mrr, progress, target, transactions: revenueData });
});

router.post('/set-target', authenticate, async (req, res) => {
  const { monthlyTarget } = req.body;
  const db = await openDb();
  await db.run(`
    INSERT INTO user_targets (user_id, monthly_target, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET monthly_target = excluded.monthly_target, updated_at = excluded.updated_at
  `, req.userId, monthlyTarget);
  res.json({ success: true });
});

module.exports = router;
