require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db/database');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const paymentRoutes = require('./routes/payment');
const trackingRoutes = require('./routes/tracking');
const aiRoutes = require('./routes/ai');
const socialRoutes = require('./routes/social/publishers');
const marketingRoutes = require('./routes/marketing/engine');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/marketing', marketingRoutes);

// Downloads folder
app.use('/downloads', express.static(path.join(__dirname, '../frontend/public/downloads')));

// Fallback to frontend index for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

const PORT = process.env.PORT || 3000;
initDb().then(() => {
  app.listen(PORT, () => console.log(`CostByte running on port ${PORT}`));
});
