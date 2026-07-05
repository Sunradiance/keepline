import { burnSummary, renewalRadar, pricingLeak } from './analysis.js';
import { RESEARCH, BATTLES } from './research.js';

export function buildCfoBrief(state) {
  const { commitments, headcount, apiCosts, pricingExceptions, orgName } = state;
  const summary = burnSummary(commitments, headcount, apiCosts);
  const renewals = renewalRadar(commitments);
  const leak = pricingLeak(pricingExceptions);
  const now = new Date().toISOString().slice(0, 10);
  const lines = [];

  lines.push(`# Keepline CFO Brief — ${orgName}`);
  lines.push(`Generated: ${now} · Monthly committed burn: **$${Math.round(summary.total).toLocaleString()}**`);
  lines.push('');
  lines.push('> Mid-market companies don\'t lack revenue — they lack visibility into **committed burn**: SaaS, HR, APIs, and unlogged pricing leaks.');
  lines.push('');
  lines.push('## Burn breakdown');
  lines.push(`| Line | Monthly |`);
  lines.push(`|------|---------|`);
  lines.push(`| SaaS & subscriptions | $${Math.round(summary.commitBurn).toLocaleString()} |`);
  lines.push(`| People (loaded) | $${Math.round(summary.hrBurn).toLocaleString()} |`);
  lines.push(`| API & cloud | $${Math.round(summary.apiBurn).toLocaleString()} |`);
  lines.push(`| **Total committed** | **$${Math.round(summary.total).toLocaleString()}** |`);
  lines.push(`| Annualized | $${Math.round(summary.total * 12).toLocaleString()} |`);
  lines.push('');

  if (Object.keys(summary.byCat).length) {
    lines.push('## By category');
    for (const [cat, amt] of Object.entries(summary.byCat).sort((a, b) => b[1] - a[1])) {
      lines.push(`- ${cat}: $${Math.round(amt).toLocaleString()}/mo`);
    }
    lines.push('');
  }

  const urgent = renewals.filter((r) => r.daysLeft <= 30);
  if (urgent.length) {
    lines.push('## Renewals — next 30 days');
    for (const r of urgent) {
      lines.push(`- **${r.commitment.name}** — ${Math.round(r.daysLeft)}d — $${Math.round(r.monthly).toLocaleString()}/mo — owner: ${r.commitment.owner || '⚠ NONE'}`);
    }
    lines.push('');
  }

  const unowned = commitments.filter((c) => c.status !== 'cancelled' && !c.owner);
  if (unowned.length) {
    lines.push('## Unowned commitments (renewal risk)');
    for (const c of unowned) {
      lines.push(`- ${c.name} ($${Math.round(monthlyAmount(c)).toLocaleString()}/mo)`);
    }
    lines.push('');
  }

  const unapproved = pricingExceptions.filter((e) => !e.approved);
  if (unapproved.length || leak) {
    lines.push('## Pricing leakage');
    lines.push(`Total unapproved ARR impact: $${Math.round(leak).toLocaleString()}`);
    for (const e of unapproved) {
      lines.push(`- ${e.dealName}: ${e.discountPercent}% — $${Math.round(e.arrImpact).toLocaleString()} ARR`);
    }
    lines.push('');
  }

  lines.push('## Research context');
  for (const b of BATTLES.slice(0, 3)) {
    lines.push(`- **${b.fight}** — ${b.cost}`);
  }
  lines.push('');
  lines.push('## Actions (next 14 days)');
  lines.push('1. Assign owners to every commitment renewing in 60 days.');
  lines.push('2. Run overlap scan — kill duplicate tools.');
  lines.push('3. Approve or reverse unlogged pricing exceptions.');
  lines.push('4. Set alert thresholds on usage-based API/cloud lines.');
  lines.push('5. Negotiate top 3 renewals using benchmark briefs.');
  lines.push('');
  lines.push('---');
  lines.push('_Keepline — keep the line on committed burn._');
  return lines.join('\n');
}

function monthlyAmount(c) {
  const amt = Number(c.amountMonthly) || 0;
  if (c.billingCycle === 'annual') return amt / 12;
  if (c.billingCycle === 'quarterly') return amt / 3;
  return amt;
}