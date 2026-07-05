export const RESEARCH = {
  title: 'What Mid-Market Companies Fight Most (Worldwide)',
  subtitle: 'Synthesis: 50–500 employee firms · 2024–2026 research',
  disclaimer: 'Aggregates Gartner, Zylo, BetterCloud, Agicap, NCMM, Deloitte, JPMorgan mid-market surveys — not a custom 1000-firm poll.',
};

export const BATTLES = [
  {
    id: 'saas-sprawl',
    fight: 'SaaS sprawl & shadow subscriptions',
    pain: 94,
    cost: '$3,000–$5,000/employee/year in software; 30% unused or duplicated',
    stats: [
      { src: 'Zylo / BetterCloud', n: '200+', note: 'apps per mid-large org; IT knows ~45%' },
      { src: 'Flexera', n: '30%', note: 'SaaS spend wasted on unused licenses' },
      { src: 'Ortto', n: '$15k–$50k', note: 'Annual hidden cost per employee from tool overlap' },
    ],
    overlooked: 'Finance sees one line item "Software." Nobody owns the 47 overlapping project tools.',
    keepline: 'Commitment registry with owners, renewal dates, and overlap scanner.',
  },
  {
    id: 'renewals',
    fight: 'Renewal traps & auto-charge blindness',
    pain: 91,
    cost: '8–15% of SaaS budget lost to unwanted auto-renewals',
    stats: [
      { src: 'Zylo', n: '53%', note: 'Orgs surprised by renewal charges annually' },
      { src: 'Block64', n: '—', note: 'Sprawl worsening year-over-year post-2024' },
    ],
    overlooked: 'Renewal emails go to departed employees. Contracts auto-renew at list price.',
    keepline: 'Renewal radar — 90/60/30-day alerts with negotiation briefs.',
  },
  {
    id: 'cash',
    fight: 'Cash visibility & forecast chaos',
    pain: 88,
    cost: '12+ hrs/week leadership spends reconciling spreadsheets',
    stats: [
      { src: 'Agicap mid-market', n: '62%', note: 'Struggle with reliable cash forecasting' },
      { src: 'PEAC Solutions', n: 'Top 5', note: 'Financial mistakes stem from visibility gaps' },
    ],
    overlooked: 'Committed burn ≠ bank balance. Teams commit spend months before cash leaves.',
    keepline: 'Monthly committed burn dashboard — SaaS + HR + API + infra in one view.',
  },
  {
    id: 'hr-burn',
    fight: 'HR & people cost creep',
    pain: 90,
    cost: '60–70% of opex; contractors often invisible to finance',
    stats: [
      { src: 'Rippling / Workday', n: '2026', note: 'HR leaders cite cost control as top-3 priority' },
      { src: 'Portfolio Group', n: '—', note: 'Mid-market lacks workforce planning tooling' },
    ],
    overlooked: 'Headcount spreadsheet ≠ loaded cost. Benefits, contractors, bonuses excluded.',
    keepline: 'Headcount ledger with FTE vs contractor loaded monthly burn.',
  },
  {
    id: 'api-cloud',
    fight: 'API & cloud bill surprises',
    pain: 86,
    cost: 'Usage-based overruns average 23% above budget',
    stats: [
      { src: 'Forbes 2026 trends', n: '—', note: 'AI/API usage costs unpredictable for mid-market' },
      { src: 'Due.com overlooked costs', n: '—', note: 'Integration & API fees rarely centralized' },
    ],
    overlooked: 'Engineering spins up keys. Finance sees one AWS line. No per-service owner.',
    keepline: 'API & cloud cost log with alert thresholds and owners.',
  },
  {
    id: 'pricing',
    fight: 'Pricing discipline & discount erosion',
    pain: 84,
    cost: '5–12% margin leak from unlogged discount exceptions',
    stats: [
      { src: 'SaaS Capital', n: '—', note: 'Capital efficiency now #1 board metric mid-market SaaS' },
      { src: 'Baker Tilly 2026', n: '—', note: 'Pricing pressure top challenge for middle market' },
    ],
    overlooked: 'Sales gives 30% off. Nobody logs it. CAC payback breaks silently.',
    keepline: 'Pricing exception log with ARR impact and approval trail.',
  },
  {
    id: 'procurement',
    fight: 'No procurement function',
    pain: 82,
    cost: 'Enterprise playbooks without enterprise headcount',
    stats: [
      { src: 'NCMM MMI 2025', n: '—', note: 'Mid-market growth optimism but margin pressure' },
      { src: 'CBiz Q4 2025', n: '—', note: 'Mid-market leaders cite cost management priority' },
    ],
    overlooked: 'You need vendor negotiation but have no vendor manager. Founders negotiate Slack renewals at 2am.',
    keepline: 'AI negotiation lab with live vendor benchmark search.',
  },
];

export const WHITESPACE = {
  enterpriseHas: ['Procurement', 'FP&A team', 'GRC', 'Coupa/Zylo', 'Workday'],
  midMarketLacks: ['Commitment ownership', 'Renewal calendar', 'Overlap detection', 'Loaded headcount view', 'API cost attribution', 'Discount governance', 'CFO burn brief'],
  thesis: 'Mid-market fights the same wars as enterprise — with 1/10th the ops team and 3× the spreadsheet chaos.',
};