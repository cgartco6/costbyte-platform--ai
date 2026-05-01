const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generatePOPIA(businessName, description, outputDir) {
  const doc = new PDFDocument();
  const pdfPath = path.join(outputDir, 'POPIA_Compliance.pdf');
  doc.pipe(fs.createWriteStream(pdfPath));
  doc.fontSize(18).text('POPIA Compliance Document', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Prepared for: ${businessName}`);
  doc.text(`Based on the Protection of Personal Information Act (POPIA) of South Africa.`);
  doc.text(`Your business: "${description}". This document outlines lawful data processing.`);
  doc.text(`Key obligations: consent, purpose specification, security safeguards, data subject rights, breach notification.`);
  doc.end();
  return pdfPath;
}

async function generateCPA(businessName, outputDir) {
  const doc = new PDFDocument();
  const pdfPath = path.join(outputDir, 'CPA_Compliance.pdf');
  doc.pipe(fs.createWriteStream(pdfPath));
  doc.fontSize(18).text('Consumer Protection Act (CPA) Compliance', { align: 'center' });
  doc.text(`For: ${businessName}`);
  doc.text(`Key requirements: no misleading advertising, right to cancel within 5 business days, disclose all costs upfront.`);
  doc.end();
  return pdfPath;
}

module.exports = { generatePOPIA, generateCPA };
