const express = require('express');
const authenticate = require('../../middleware/auth');
const generateBusinessPlan = require('./businessPlan');
const generateMarketingPlan = require('./marketingPlan');
const generateDocuments = require('./documentGenerator');
const createGraphics = require('./graphicDesign');
const buildWebsite = require('./websiteBuilder');
const { openDb } = require('../../db/database');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const router = express.Router();

router.post('/generate-full', authenticate, async (req, res) => {
  const { projectId, description, branding } = req.body;
  const outputDir = path.join(__dirname, '../../../frontend/public/downloads', `project_${projectId}`);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  try {
    const [businessPlan, marketingPlan, docs] = await Promise.all([
      generateBusinessPlan(description, outputDir),
      generateMarketingPlan(description, outputDir),
      generateDocuments(description, outputDir)
    ]);
    const graphics = await createGraphics(description, outputDir, branding);
    const website = await buildWebsite(description, outputDir, graphics.palette, graphics.logoSvg || graphics.logoPng);
    const zipPath = path.join(outputDir, 'full_package.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipStream = fs.createWriteStream(zipPath);
    archive.pipe(zipStream);
    archive.directory(outputDir, false);
    await archive.finalize();
    const db = await openDb();
    await db.run('UPDATE projects SET status = ?, generated_assets = ? WHERE id = ?', 'completed', zipPath, projectId);
    res.json({ success: true, downloadUrl: `/downloads/project_${projectId}/full_package.zip` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Generation failed' });
  }
});

module.exports = router;
