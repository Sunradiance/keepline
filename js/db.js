const DB_NAME = 'keepline';
let db = null;

export function openDb() {
  if (db) return Promise.resolve(db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      for (const s of ['commitments', 'headcount', 'apiCosts', 'pricingExceptions', 'meta']) {
        if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' });
      }
    };
  });
}

function tx(store, mode = 'readonly') {
  return db.transaction(store, mode).objectStore(store);
}

export const uid = () => crypto.randomUUID();

export async function getAll(store) {
  await openDb();
  return new Promise((res, rej) => {
    const r = tx(store).getAll();
    r.onsuccess = () => res(r.result || []);
    r.onerror = () => rej(r.error);
  });
}

export async function put(store, item) {
  await openDb();
  return new Promise((res, rej) => {
    const r = tx(store, 'readwrite').put(item);
    r.onsuccess = () => res(item);
    r.onerror = () => rej(r.error);
  });
}

export async function remove(store, id) {
  await openDb();
  return new Promise((res, rej) => {
    const r = tx(store, 'readwrite').delete(id);
    r.onsuccess = () => res();
    r.onerror = () => rej(r.error);
  });
}

export async function exportAll() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    commitments: await getAll('commitments'),
    headcount: await getAll('headcount'),
    apiCosts: await getAll('apiCosts'),
    pricingExceptions: await getAll('pricingExceptions'),
  };
}

export async function importAll(data) {
  for (const s of ['commitments', 'headcount', 'apiCosts', 'pricingExceptions']) {
    for (const item of data[s] || []) await put(s, item);
  }
}

export async function seedIfEmpty() {
  if ((await getAll('commitments')).length) return;

  const now = new Date();
  const d = (n) => new Date(now.getTime() + n * 86400000).toISOString().slice(0, 10);

  const commitments = [
    { id: uid(), name: 'Slack Business+', vendor: 'Salesforce', category: 'saas', amountMonthly: 4200, billingCycle: 'annual', renewalDate: d(45), owner: 'IT', seats: 85, status: 'active', notes: 'Auto-renews at list', createdAt: now.toISOString() },
    { id: uid(), name: 'Notion Enterprise', vendor: 'Notion', category: 'saas', amountMonthly: 890, billingCycle: 'monthly', renewalDate: d(12), owner: '', seats: 120, status: 'active', notes: 'No owner assigned', createdAt: now.toISOString() },
    { id: uid(), name: 'Linear', vendor: 'Linear', category: 'saas', amountMonthly: 640, billingCycle: 'monthly', renewalDate: d(28), owner: 'Engineering', seats: 40, status: 'active', createdAt: now.toISOString() },
    { id: uid(), name: 'Jira', vendor: 'Atlassian', category: 'saas', amountMonthly: 1100, billingCycle: 'annual', renewalDate: d(72), owner: 'Engineering', seats: 55, status: 'active', notes: 'Overlap with Linear?', createdAt: now.toISOString() },
    { id: uid(), name: 'HubSpot Sales Hub', vendor: 'HubSpot', category: 'sales', amountMonthly: 2400, billingCycle: 'annual', renewalDate: d(18), owner: 'Revenue', seats: 25, status: 'active', createdAt: now.toISOString() },
    { id: uid(), name: 'Rippling', vendor: 'Rippling', category: 'hr', amountMonthly: 1800, billingCycle: 'monthly', renewalDate: d(90), owner: 'HR', seats: 95, status: 'active', createdAt: now.toISOString() },
  ];
  for (const c of commitments) await put('commitments', c);

  const headcount = [
    { id: uid(), role: 'Engineering (FTE)', department: 'Engineering', type: 'fte', loadedMonthly: 42000, headcount: 12, status: 'active', createdAt: now.toISOString() },
    { id: uid(), role: 'GTM (FTE)', department: 'Revenue', type: 'fte', loadedMonthly: 28000, headcount: 8, status: 'active', createdAt: now.toISOString() },
    { id: uid(), role: 'Contract DevOps', department: 'Engineering', type: 'contractor', loadedMonthly: 8500, headcount: 1, status: 'active', notes: 'Not in HR system until last month', createdAt: now.toISOString() },
  ];
  for (const h of headcount) await put('headcount', h);

  const apiCosts = [
    { id: uid(), service: 'Groq API', category: 'api', estimatedMonthly: 420, usageBased: true, owner: 'Engineering', alertThreshold: 500, status: 'active', createdAt: now.toISOString() },
    { id: uid(), service: 'AWS (prod)', category: 'infrastructure', estimatedMonthly: 6800, usageBased: true, owner: 'Platform', alertThreshold: 7500, status: 'active', createdAt: now.toISOString() },
    { id: uid(), service: 'OpenAI fallback', category: 'api', estimatedMonthly: 0, usageBased: true, owner: '', alertThreshold: 300, status: 'active', notes: 'No owner — surprise bills', createdAt: now.toISOString() },
  ];
  for (const a of apiCosts) await put('apiCosts', a);

  const pricingExceptions = [
    { id: uid(), dealName: 'Acme Corp — 35% discount', discountPercent: 35, arrImpact: -42000, owner: 'Sales', approved: false, date: d(-14), notes: 'No CFO sign-off', createdAt: now.toISOString() },
    { id: uid(), dealName: 'Beta Ltd — custom SLA', discountPercent: 15, arrImpact: -12000, owner: 'Sales', approved: true, date: d(-30), createdAt: now.toISOString() },
  ];
  for (const p of pricingExceptions) await put('pricingExceptions', p);

  await put('meta', { key: 'orgName', value: 'Demo Co (95 FTE)' });
}