const express = require('express');
const authenticate = require('../../middleware/auth');
const { openDb } = require('../../db/database');
const router = express.Router();

const saTargets = {
  'Gauteng': ['Johannesburg', 'Pretoria', 'Midrand', 'Sandton'],
  'Western Cape': ['Cape Town', 'Stellenbosch', 'Paarl'],
  'KwaZulu-Natal': ['Durban', 'Pietermaritzburg'],
  'Eastern Cape': ['Gqeberha', 'East London'],
  'Free State': ['Bloemfontein'],
  'Mpumalanga': ['Nelspruit'],
  'Limpopo': ['Polokwane'],
  'North West': ['Mahikeng'],
  'Northern Cape': ['Kimberley']
};

let campaignMetrics = {};

router.post('/create-campaign', authenticate, async (req, res) => {
  const { projectId, targetRegion, targetLocations, budget, startDate, endDate } = req.body;
  const db = await openDb();
  const campaignId = Date.now().toString();
  await db.run(`INSERT INTO marketing_campaigns (id, project_id, target_region, target_locations, budget, start_date, end_date, status) VALUES (?,?,?,?,?,?,?,?)`,
    campaignId, projectId, targetRegion, JSON.stringify(targetLocations), budget, startDate, endDate, 'active');
  campaignMetrics[campaignId] = { impressions: 0, clicks: 0, conversions: 0, spent: 0 };
  res.json({ campaignId });
});

router.get('/metrics/:campaignId', authenticate, async (req, res) => {
  const metrics = campaignMetrics[req.params.campaignId] || { impressions: 0, clicks: 0, conversions: 0, spent: 0 };
  res.json(metrics);
});

router.post('/serve-ad', async (req, res) => {
  const { campaignId, userLocation } = req.body;
  const db = await openDb();
  const campaign = await db.get('SELECT * FROM marketing_campaigns WHERE id = ?', campaignId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  let locations = [];
  try { locations = JSON.parse(campaign.target_locations); } catch(e) {}
  const matched = locations.some(loc => userLocation.includes(loc));
  if (!matched) return res.json({ showAd: false });
  campaignMetrics[campaignId] = campaignMetrics[campaignId] || { impressions: 0, clicks: 0, conversions: 0, spent: 0 };
  campaignMetrics[campaignId].impressions++;
  campaignMetrics[campaignId].spent += 0.01;
  res.json({ showAd: true, adContent: "Your professional startup solution – click to launch." });
});

router.post('/track-click', authenticate, async (req, res) => {
  const { campaignId } = req.body;
  if (campaignMetrics[campaignId]) campaignMetrics[campaignId].clicks++;
  res.json({ success: true });
});

module.exports = router;
