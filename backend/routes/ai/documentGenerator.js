const { generatePOPIA, generateCPA } = require('../../utils/saCompliance');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generateDocuments(description, outputDir) {
  const businessName = description.split(' ').slice(0, 3).join(' ') || 'Your Venture';
  const popiaPath = await generatePOPIA(businessName, description, outputDir);
  const cpaPath = await generateCPA(businessName, outputDir);
  const termsPath = path.join(outputDir, 'terms_of_service.pdf');
  const termsDoc = new PDFDocument();
  termsDoc.pipe(fs.createWriteStream(termsPath));
  termsDoc.fontSize(16).text('Terms of Service', { align: 'center' });
  termsDoc.text(`For ${businessName}\n\nStandard terms: payment upfront, 14-day refund policy, no hidden fees.`);
  termsDoc.end();
  const privacyPath = path.join(outputDir, 'privacy_policy.pdf');
  const privacyDoc = new PDFDocument();
  privacyDoc.pipe(fs.createWriteStream(privacyPath));
  privacyDoc.fontSize(16).text('Privacy Policy', { align: 'center' });
  privacyDoc.text(`We collect only email and payment info. Data never sold. Compliant with POPIA.`);
  privacyDoc.end();
  return { popiaPath, cpaPath, termsPath, privacyPath };
}
module.exports = generateDocuments;
