const words = (s = '') =>
  String(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);

// Score 0-100: category 35, location 15, budget up to 35, keywords up to 25 (capped at 100)
function scoreMatch(request, company) {
  let score = 0;

  if (request.category === company.category) score += 35;

  const rl = (request.location || '').toLowerCase();
  const cl = (company.location || '').toLowerCase();
  if (!rl || rl === 'any' || rl === cl) score += 15;

  const budget = Number(request.budget);
  const price = Number(company.price);
  if (budget && price) {
    if (price <= budget + 15000) score += 25;
    if (price <= budget) score += 10;
  }

  const reqWords = new Set(words(`${request.title} ${request.description}`));
  const coWords = new Set(words(`${company.tags || ''} ${company.description || ''} ${company.name} ${company.category}`));
  let overlap = 0;
  reqWords.forEach(w => { if (coWords.has(w)) overlap++; });
  score += Math.min(25, overlap * 6);

  return Math.min(100, Math.max(0, Math.round(score)));
}

const MIN_SCORE = 60;

module.exports = { scoreMatch, MIN_SCORE, words };
