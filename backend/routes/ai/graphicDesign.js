const OpenAI = require('openai');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function createGraphics(description, outputDir, branding = {}) {
  const primary = branding.primary || '#4F46E5';
  const secondary = branding.secondary || '#F59E0B';
  const palette = { primary, secondary, accent: '#10B981', neutral: '#1F2937', background: '#F9FAFB' };
  fs.writeFileSync(path.join(outputDir, 'color_palette.json'), JSON.stringify(palette, null, 2));
  
  const logoStyle = branding.logoStyle || 'minimal';
  const dallePrompt = `A ${logoStyle} logo for a startup: ${description}. Flat vector, white background, no text, centered, professional.`;
  let pngPath = null;
  let svgPath = null;
  try {
    const dalleResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: dallePrompt,
      n: 1,
      size: '1024x1024',
    });
    const imageUrl = dalleResponse.data[0].url;
    const imageBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    pngPath = path.join(outputDir, 'logo.png');
    fs.writeFileSync(pngPath, Buffer.from(imageBuffer.data));
    svgPath = path.join(outputDir, 'logo.svg');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="${palette.primary}"/><text x="100" y="110" fill="white" font-size="20" text-anchor="middle">${description.substring(0, 20)}</text></svg>`;
    fs.writeFileSync(svgPath, svgContent);
  } catch(e) {
    svgPath = path.join(outputDir, 'logo.svg');
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="${palette.primary}"/><text x="100" y="110" fill="white" font-size="24" text-anchor="middle">${description.substring(0,2).toUpperCase()}</text></svg>`;
    fs.writeFileSync(svgPath, fallbackSvg);
  }
  const bannersDir = path.join(outputDir, 'banners');
  if (!fs.existsSync(bannersDir)) fs.mkdirSync(bannersDir);
  const sizes = { facebook: { w: 820, h: 312 }, twitter: { w: 1500, h: 500 }, instagram: { w: 1080, h: 1080 } };
  for (const [platform, dims] of Object.entries(sizes)) {
    const svgBuf = Buffer.from(`<svg width="${dims.w}" height="${dims.h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${palette.primary}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="${Math.min(dims.w/20, 48)}" font-family="Arial">${description.substring(0, 40)}</text></svg>`);
    await sharp(svgBuf).png().toFile(path.join(bannersDir, `${platform}_banner.png`));
  }
  return { palette, logoPng: pngPath, logoSvg: svgPath, bannersDir };
}
module.exports = createGraphics;
