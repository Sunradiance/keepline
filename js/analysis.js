export function monthlyAmount(c) {
  if (!c.amountMonthly) return 0;
  const amt = Number(c.amountMonthly) || 0;
  if (c.billingCycle === 'annual') return amt / 12;
  if (c.billingCycle === 'quarterly') return amt / 3;
  return amt;
}

export function daysUntil(iso) {
  if (!iso) return 999;
  return (new Date(iso).getTime() - Date.now()) / 86400000;
}

export function burnSummary(commitments, headcount, apiCosts) {
  const active = commitments.filter((c) => c.status !== 'cancelled');
  const byCat = {};
  let commitBurn = 0;
  for (const c of active) {
    const m = monthlyAmount(c);
    commitBurn += m;
    byCat[c.category] = (byCat[c.category] || 0) + m;
  }
  const hrBurn = headcount.filter((h) => h.status !== 'ended').reduce((s, h) => s + (Number(h.loadedMonthly) || 0), 0);
  const apiBurn = apiCosts.filter((a) => a.status !== 'cancelled').reduce((s, a) => s + (Number(a.estimatedMonthly) || 0), 0);
  const total = commitBurn + hrBurn + apiBurn;
  return { total, commitBurn, hrBurn, apiBurn, byCat, activeCount: active.length };
}

export function renewalRadar(commitments, days = 90) {
  return commitments
    .filter((c) => c.status !== 'cancelled' && c.renewalDate)
    .map((c) => ({ commitment: c, daysLeft: daysUntil(c.renewalDate), monthly: monthlyAmount(c) }))
    .filter((r) => r.daysLeft <= days && r.daysLeft >= -30)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function pricingLeak(exceptions) {
  return exceptions.reduce((s, e) => s + (Number(e.arrImpact) || 0), 0);
}

export function healthScore(summary, renewals, exceptions) {
  let score = 100;
  const unowned = summary.activeCount; // placeholder
  score -= renewals.filter((r) => r.daysLeft <= 30 && !r.commitment.owner).length * 8;
  score -= renewals.filter((r) => r.daysLeft <= 14).length * 5;
  score -= Math.min(20, pricingLeak(exceptions) / 1000);
  if (summary.total > 0 && summary.hrBurn / summary.total > 0.75) score -= 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}