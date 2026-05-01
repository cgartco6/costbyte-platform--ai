const OpenAI = require('openai');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateBusinessPlan(description, outputDir) {
  const prompt = `Write a professional business plan for a startup: "${description}". Include executive summary, problem, solution, market analysis, revenue model, and go-to-market strategy. Use plain, honest language. No hype.`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });
  const planText = completion.choices[0].message.content;
  const pdfPath = path.join(outputDir, 'business_plan.pdf');
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pdfPath));
  doc.fontSize(16).text('Business Plan', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(planText);
  doc.end();
  return { text: planText, pdfPath };
}
module.exports = generateBusinessPlan;
