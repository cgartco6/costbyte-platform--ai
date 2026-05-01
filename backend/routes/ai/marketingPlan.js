const OpenAI = require('openai');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateMarketingPlan(description, outputDir) {
  const prompt = `Write a detailed marketing plan for a startup: "${description}". Target South Africa first, then global. Include: target audience, channels (TikTok, Instagram, Facebook, Telegram, Google Ads), content strategy, compliance (no unsolicited DMs), budget allocation, 30-day launch calendar. Plain text.`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });
  const planText = completion.choices[0].message.content;
  const pdfPath = path.join(outputDir, 'marketing_plan.pdf');
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pdfPath));
  doc.fontSize(16).text('Marketing Plan', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(planText);
  doc.end();
  const calendarCsvPath = path.join(outputDir, 'content_calendar.csv');
  const csvContent = `Date,Channel,Content Type,Description\nDay 1,TikTok,Video,Introduce product benefits\nDay 3,Instagram,Carousel,3 tips for startups\nDay 5,Facebook,Link post,Launch offer\nDay 7,Telegram,Message,Community update\n`;
  fs.writeFileSync(calendarCsvPath, csvContent);
  return { pdfPath, calendarCsvPath, text: planText };
}
module.exports = generateMarketingPlan;
