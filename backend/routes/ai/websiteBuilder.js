const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function buildWebsite(description, outputDir, palette, logoPath) {
  const prompt = `Create a single-file HTML/CSS/JS website for a startup: "${description}". Use brand colors: primary=${palette.primary}, secondary=${palette.secondary}. Include responsive layout, hero, services/pricing, contact form. No fake scarcity. Return only HTML.`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });
  let html = completion.choices[0].message.content;
  if (!html.includes('<!DOCTYPE html>')) {
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${description.substring(0,30)}</title><script src="https://cdn.tailwindcss.com"></script></head><body>${html}</body></html>`;
  }
  const websiteDir = path.join(outputDir, 'website');
  if (!fs.existsSync(websiteDir)) fs.mkdirSync(websiteDir, { recursive: true });
  const htmlPath = path.join(websiteDir, 'index.html');
  fs.writeFileSync(htmlPath, html);
  if (logoPath && fs.existsSync(logoPath)) {
    const assetsDir = path.join(websiteDir, 'assets');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);
    const ext = path.extname(logoPath);
    fs.copyFileSync(logoPath, path.join(assetsDir, `logo${ext}`));
  }
  return { htmlPath, websiteDir };
}
module.exports = buildWebsite;
