const express = require('express');
const router = express.Router();
const { checkCompliance } = require('./complianceEngine');

router.post('/post', async (req, res) => {
  const { platform, text, imageUrl } = req.body;
  const compliance = checkCompliance(platform, text);
  if (!compliance.ok) return res.status(400).json({ error: compliance.reason });
  // Here you would call actual platform APIs. For now, mock.
  console.log(`Would post to ${platform}: ${text}`);
  res.json({ success: true, message: `Simulated post to ${platform}` });
});

module.exports = router;
