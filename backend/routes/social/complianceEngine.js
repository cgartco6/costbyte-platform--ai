const platformRules = {
  tiktok: { maxLength: 150, allowLinks: true, disallowedWords: ['guarantee', 'risk free'] },
  facebook: { maxLength: 2200, allowLinks: true, disallowedWords: ['clickbait', 'free money'] },
  instagram: { maxLength: 2200, allowLinks: false, disallowedWords: ['buy now', 'limited time'] },
  telegram: { maxLength: 4096, allowLinks: true, disallowedWords: [] }
};

function checkCompliance(platform, text) {
  const rules = platformRules[platform];
  if (!rules) return { ok: false, reason: 'Unknown platform' };
  if (text.length > rules.maxLength) return { ok: false, reason: `Exceeds ${rules.maxLength} chars` };
  for (const word of rules.disallowedWords) {
    if (text.toLowerCase().includes(word)) return { ok: false, reason: `Contains "${word}"` };
  }
  return { ok: true };
}

function suggestBestTime(platform) {
  return { timezone: 'UTC', hour: 14, minute: 0 };
}

module.exports = { checkCompliance, suggestBestTime };
