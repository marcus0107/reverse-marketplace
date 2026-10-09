// Subscription plans (KSh). months is only used to show the saving versus paying monthly.
const PLANS = {
  monthly:   { label: 'Monthly',  amount: 7000,  days: 30,  months: 1 },
  quarterly: { label: '3 months', amount: 18000, days: 90,  months: 3 },
  yearly:    { label: 'Yearly',   amount: 70000, days: 365, months: 12 }
};

function listPlans() {
  return Object.entries(PLANS).map(([id, p]) => ({
    id, label: p.label, amount: p.amount, days: p.days,
    savePercent: Math.max(0, Math.round((1 - p.amount / (PLANS.monthly.amount * p.months)) * 100))
  }));
}

module.exports = { PLANS, listPlans };
