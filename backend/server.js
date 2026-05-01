require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { initDb } = require('./db/database');
const selfHealingAgent = require('./cron/selfHealingAgent');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const paymentRoutes = require('./routes/payment');
const trackingRoutes = require('./routes/tracking');
const adminRoutes = require('./routes/admin');
const subscriptionRoutes = require('./routes/subscriptions');
const emailRoutes = require('./routes/emailMarketing').router;
const payoutRoutes = require('./routes/payout').router;
const upgradeRoutes = require('./routes/upgrade');
const aiRoutes = require('./routes/ai');
const marketingEngine = require('./routes/marketing/engine');
const clientMarketingRoutes = require('./routes/clientMarketing/clientEngine');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/payout', payoutRoutes);
app.use('/api/upgrades', upgradeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/marketing', marketingEngine);
app.use('/api/client-marketing', clientMarketingRoutes);

// Trigger self‑healing manually
app.post('/api/cron/trigger-self-healing', async (req, res) => {
  await selfHealingAgent();
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

const PORT = process.env.PORT || 3000;
initDb().then(() => {
  app.listen(PORT, () => console.log(`CostByte running on port ${PORT}`));
  // Schedule self‑healing agent daily at 1 AM
  cron.schedule('0 1 * * *', () => {
    console.log('Running scheduled self‑healing agent...');
    selfHealingAgent().catch(err => console.error('Self‑healing error:', err));
  });
});
