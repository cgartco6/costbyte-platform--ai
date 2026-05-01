const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { openDb } = require('../db/database');
const authenticate = require('../middleware/auth');
const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'costbyte_secret_change_me';

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const db = await openDb();
  const hashed = await bcrypt.hash(password, 10);
  try {
    await db.run('INSERT INTO users (email, password) VALUES (?, ?)', email, hashed);
    const user = await db.get('SELECT id FROM users WHERE email = ?', email);
    const token = jwt.sign({ userId: user.id }, SECRET);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await openDb();
  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, SECRET);
  res.json({ token });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ userId: req.userId });
});

module.exports = router;
