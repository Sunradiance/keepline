import { openDb, seedIfEmpty, getAll, put, remove, uid, exportAll, importAll } from './db.js';
import { burnSummary, renewalRadar, pricingLeak, healthScore, monthlyAmount, daysUntil } from './analysis.js';
import { RESEARCH, BATTLES, WHITESPACE } from './research.js';
import { buildCfoBrief } from './export.js';
import { checkHealth, ai } from './api.js';

const CATS = ['saas', 'api', 'infrastructure', 'hr', 'legal', 'marketing', 'sales', 'other'];
const TITLES = { setup: 'Setup', command: 'Burn Command', research: 'Deep Dive', commitments: 'Commitments', renewals: 'Renewal Radar', headcount: 'HR & People', apis: 'API & Cloud', pricing: 'Pricing Leaks', overlap: 'Overlap Scanner', negotiate: 'Negotiation Lab', export: 'CFO Brief' };

let state = {
  commitments: [], headcount: [], apiCosts: [], pricingExceptions: [],
  orgName: 'Organization', view: 'setup', apiHealth: null, aiLoading: false,
  aiBurn: null, overlaps: [], negotiateResult: null,
};

const $ = (s) => document.querySelector(s);
const views = {};
document.querySelectorAll('.nav-btn').forEach((b) => { views[b.dataset.view] = $(`#view-${b.dataset.view}`); });

function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => { t.hidden = true; }, 2600); }
function esc(s) { const d = document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; }
function fmt(n) { return '$' + Math.round(n || 0).toLocaleString(); }

function ctx() {
  const summary = burnSummary(state.commitments, state.headcount, state.apiCosts);
  return { orgName: state.orgName, ...state, summary, renewals: renewalRadar(state.commitments), pricingLeak: pricingLeak(state.pricingExceptions) };
}

async function reload() {
  state.commitments = await getAll('commitments');
  state.headcount = await getAll('headcount');
  state.apiCosts = await getAll('apiCosts');
  state.pricingExceptions = await getAll('pricingExceptions');
  const meta = (await getAll('meta')).find((m) => m.key === 'orgName');
  if (meta) state.orgName = meta.value;
  const s = burnSummary(state.commitments, state.headcount, state.apiCosts);
  const pill = $('#burn-pill');
  pill.textContent = `${fmt(s.total)}/mo committed · ${state.commitments.filter((c) => c.status !== 'cancelled').length} items`;
  render();
}

function go(v) {
  state.view = v;
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
  Object.entries(views).forEach(([k, el]) => el?.classList.toggle('active', k === v));
  $('#view-title').textContent = TITLES[v] || v;
  render();
}

function render() {
  ({ setup: rSetup, command: rCommand, research: rResearch, commitments: rCommitments, renewals: rRenewals,
    headcount: rHeadcount, apis: rApis, pricing: rPricing, overlap: rOverlap, negotiate: rNegotiate, export: rExport })[state.view]?.();
}

function rSetup() {
  const a = state.apiHealth?.apis || {};
  const off = state.apiHealth?.status === 'offline';
  views.setup.innerHTML = `
    <div class="hero"><h2>Clone → .env → npm run dev</h2><p>Plug 3 APIs. Mid-market burn control tower. Keys stay local.</p></div>
    <div class="grid-3">
      <div class="stat"><div class="lbl">Backend</div><div class="val" style="font-size:1.1rem;color:${off ? 'var(--danger)' : 'var(--ok)'}">${off ? 'Offline' : 'Online'}</div></div>
      <div class="stat"><div class="lbl">LLM</div><div class="val" style="font-size:1.1rem">${a.llm ? '✓' : '—'}</div><div class="sub">${a.model || 'LLM_API_KEY'}</div></div>
      <div class="stat"><div class="lbl">Search</div><div class="val" style="font-size:1.1rem">${a.search_ready ? '✓' : '—'}</div><div class="sub">Tavily + Serper</div></div>
    </div>
    <div class="card"><div class="card-title">Quick start</div>
    <pre class="pre" style="margin-top:0.75rem">git clone https://github.com/Sunradiance/keepline.git
cd keepline && cp .env.example .env
npm run setup && npm run dev
# http://localhost:8792</pre>
    <div class="card-actions"><button class="btn btn-sm btn-ghost" data-a="refresh-health">Refresh</button></div></div>
    <div class="section-h">API keys</div>
    <div class="grid-3">
      <div class="card"><div class="card-title">LLM_API_KEY</div><div class="insight">Burn analysis, overlap scan, negotiation briefs, CFO enhance, extract commitments. <a href="https://console.groq.com/" target="_blank">Groq</a></div></div>
      <div class="card"><div class="card-title">TAVILY_API_KEY</div><div class="insight">Vendor pricing benchmarks. <a href="https://tavily.com/" target="_blank">Tavily</a></div></div>
      <div class="card"><div class="card-title">SERPER_API_KEY</div><div class="insight">Google search for negotiation intel. <a href="https://serper.dev/" target="_blank">Serper</a></div></div>
    </div>`;
}

function rCommand() {
  const s = burnSummary(state.commitments, state.headcount, state.apiCosts);
  const renewals = renewalRadar(state.commitments, 30);
  const score = healthScore(s, renewalRadar(state.commitments), state.pricingExceptions);
  const aiBlock = state.aiBurn ? `<div class="card" style="border-color:var(--accent)"><div class="card-title">AI burn analysis</div><div class="insight">${esc(state.aiBurn.summary)}</div>${(state.aiBurn.recommendedActions || []).map((x) => `<div class="insight">→ ${esc(x)}</div>`).join('')}</div>` : '';
  views.command.innerHTML = `
    <div style="display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap">
      <button class="btn btn-primary" data-a="ai-burn" ${state.aiLoading ? 'disabled' : ''}>✦ AI analyze burn</button>
      <button class="btn btn-ghost" data-a="extract-commitments">Extract from invoice/email</button>
    </div>${aiBlock}
    <div class="grid-4">
      <div class="stat"><div class="lbl">Monthly burn</div><div class="val">${fmt(s.total)}</div><div class="sub">${fmt(s.total * 12)}/yr</div></div>
      <div class="stat"><div class="lbl">Health score</div><div class="val">${score}</div><div class="sub">commitment control</div><div class="meter"><div style="width:${score}%"></div></div></div>
      <div class="stat"><div class="lbl">Renewals ≤30d</div><div class="val">${renewals.length}</div></div>
      <div class="stat"><div class="lbl">Pricing leak</div><div class="val">${fmt(pricingLeak(state.pricingExceptions))}</div><div class="sub">unapproved ARR</div></div>
    </div>
    <div class="section-h">Burn split</div>
    <div class="grid-3">
      <div class="stat"><div class="lbl">SaaS & subs</div><div class="val" style="font-size:1.3rem">${fmt(s.commitBurn)}</div></div>
      <div class="stat"><div class="lbl">People (loaded)</div><div class="val" style="font-size:1.3rem">${fmt(s.hrBurn)}</div></div>
      <div class="stat"><div class="lbl">API & cloud</div><div class="val" style="font-size:1.3rem">${fmt(s.apiBurn)}</div></div>
    </div>`;
}

function rResearch() {
  views.research.innerHTML = `
    <div class="hero"><h2>${esc(RESEARCH.title)}</h2><p>${esc(RESEARCH.subtitle)}</p><p style="margin-top:0.5rem;font-size:0.8rem;font-style:italic">${esc(RESEARCH.disclaimer)}</p></div>
    ${BATTLES.map((b) => `
    <div class="card"><div class="card-head"><div class="card-title">${esc(b.fight)}</div><span class="pain">pain ${b.pain}/100</span></div>
    <div class="insight"><strong>Cost:</strong> ${esc(b.cost)}</div>
    <div class="insight"><strong>Overlooked:</strong> ${esc(b.overlooked)}</div>
    <div class="insight" style="border-left:3px solid var(--accent)"><strong>Keepline:</strong> ${esc(b.keepline)}</div>
    <ul style="margin:0.5rem 0 0 1rem;font-size:0.8rem;color:var(--muted)">${b.stats.map((st) => `<li><strong>${esc(st.src)}</strong> ${esc(st.n)} — ${esc(st.note)}</li>`).join('')}</ul></div>`).join('')}
    <div class="card"><div class="card-title">Whitespace</div><p style="color:var(--muted);margin:0.5rem 0">${esc(WHITESPACE.thesis)}</p>
    <div class="grid-2"><div><div class="section-h">Enterprise has</div>${WHITESPACE.enterpriseHas.map((x) => `<div class="insight">✓ ${esc(x)}</div>`).join('')}</div>
    <div><div class="section-h">Mid-market lacks</div>${WHITESPACE.midMarketLacks.map((x) => `<div class="insight">◇ ${esc(x)}</div>`).join('')}</div></div></div>`;
}

function commitCard(c) {
  const m = monthlyAmount(c);
  const days = c.renewalDate ? Math.round(daysUntil(c.renewalDate)) : null;
  const urg = days !== null && days <= 30;
  return `<div class="card" data-id="${c.id}"><div class="card-head"><div class="card-title">${esc(c.name)}</div>${urg ? '<span class="badge badge-warn">renewal</span>' : '<span class="badge badge-ok">active</span>'}</div>
  <div class="card-meta"><span>${esc(c.vendor)}</span><span>${esc(c.category)}</span><span>${fmt(m)}/mo</span><span>${c.owner || '⚠ no owner'}</span>${days !== null ? `<span>${days}d to renewal</span>` : ''}</div>
  ${c.notes ? `<div class="insight">${esc(c.notes)}</div>` : ''}
  <div class="card-actions"><button class="btn btn-sm btn-ghost" data-a="edit-commit" data-id="${c.id}">Edit</button><button class="btn btn-sm btn-ghost" data-a="nego-commit" data-id="${c.id}">Negotiate</button><button class="btn btn-sm btn-danger btn-ghost" data-a="del-commit" data-id="${c.id}">Delete</button></div></div>`;
}

function rCommitments() {
  views.commitments.innerHTML = `<button class="btn btn-primary" data-a="new-commit" style="margin-bottom:1rem">+ Commitment</button>
    ${state.commitments.length ? state.commitments.map(commitCard).join('') : '<div class="empty">No commitments logged.</div>'}`;
}

function rRenewals() {
  const r = renewalRadar(state.commitments, 90);
  views.renewals.innerHTML = r.length ? `<table class="kt"><thead><tr><th>Vendor</th><th>Days</th><th>Monthly</th><th>Owner</th></tr></thead><tbody>
    ${r.map((x) => `<tr><td>${esc(x.commitment.name)}</td><td class="${x.daysLeft <= 14 ? 'badge-bad' : ''}">${Math.round(x.daysLeft)}d</td><td>${fmt(x.monthly)}</td><td>${esc(x.commitment.owner || '—')}</td></tr>`).join('')}</tbody></table>`
    : '<div class="empty">No renewals in next 90 days.</div>';
}

function rHeadcount() {
  views.headcount.innerHTML = `<button class="btn btn-primary" data-a="new-hc" style="margin-bottom:1rem">+ Headcount line</button>
    ${state.headcount.map((h) => `<div class="card"><div class="card-head"><div class="card-title">${esc(h.role)}</div><span class="badge badge-ok">${esc(h.type)}</span></div>
    <div class="card-meta"><span>${esc(h.department)}</span><span>${fmt(h.loadedMonthly)}/mo</span><span>${h.headcount} people</span></div>
    <div class="card-actions"><button class="btn btn-sm btn-danger btn-ghost" data-a="del-hc" data-id="${h.id}">Delete</button></div></div>`).join('')}`;
}

function rApis() {
  views.apis.innerHTML = `<button class="btn btn-primary" data-a="new-api" style="margin-bottom:1rem">+ API / cloud line</button>
    ${state.apiCosts.map((a) => `<div class="card"><div class="card-head"><div class="card-title">${esc(a.service)}</div>${a.usageBased ? '<span class="badge badge-warn">usage</span>' : ''}</div>
    <div class="card-meta"><span>${esc(a.category)}</span><span>${fmt(a.estimatedMonthly)}/mo est.</span><span>alert ${fmt(a.alertThreshold)}</span><span>${a.owner || '⚠ no owner'}</span></div>
    <div class="card-actions"><button class="btn btn-sm btn-danger btn-ghost" data-a="del-api" data-id="${a.id}">Delete</button></div></div>`).join('')}`;
}

function rPricing() {
  views.pricing.innerHTML = `<button class="btn btn-primary" data-a="new-price" style="margin-bottom:1rem">+ Pricing exception</button>
    ${state.pricingExceptions.map((p) => `<div class="card"><div class="card-head"><div class="card-title">${esc(p.dealName)}</div>${p.approved ? '<span class="badge badge-ok">approved</span>' : '<span class="badge badge-bad">unapproved</span>'}</div>
    <div class="card-meta"><span>${p.discountPercent}%</span><span>ARR ${fmt(p.arrImpact)}</span><span>${esc(p.owner || '')}</span></div>
    <div class="card-actions">${!p.approved ? `<button class="btn btn-sm btn-ghost" data-a="approve-price" data-id="${p.id}">Approve</button>` : ''}<button class="btn btn-sm btn-danger btn-ghost" data-a="del-price" data-id="${p.id}">Delete</button></div></div>`).join('')}`;
}

function rOverlap() {
  views.overlap.innerHTML = `
    <button class="btn btn-primary" data-a="overlap-scan" ${state.aiLoading ? 'disabled' : ''} style="margin-bottom:1rem">✦ AI overlap scan</button>
    ${(state.overlaps || []).map((o) => `<div class="card"><div class="card-title">${esc(o.category || 'Overlap')}</div><div class="insight">${esc(o.overlapReason)}</div>
    <div class="card-meta"><span>Est. waste ${fmt(o.estimatedWasteMonthly)}/mo</span></div><div class="insight">→ ${esc(o.action)}</div></div>`).join('') || '<div class="empty">Run scan to find duplicate tools and wasted seats.</div>'}`;
}

function rNegotiate() {
  const n = state.negotiateResult;
  views.negotiate.innerHTML = `
    <p class="insight" style="margin-bottom:1rem">Pick a commitment → AI benchmarks vendor pricing → generates negotiation brief.</p>
    ${n ? `<div class="card" style="border-color:var(--accent)"><div class="card-title">${esc(n.executiveSummary || 'Negotiation brief')}</div>
    ${(n.talkingPoints || []).map((t) => `<div class="insight">• ${esc(t)}</div>`).join('')}
    <div class="insight"><strong>Target reduction:</strong> ${n.targetReductionPercent || '—'}%</div>
    <div class="insight"><strong>Walk-away:</strong> ${esc(n.walkAwayLine || '')}</div></div>` : '<div class="empty">Select "Negotiate" on a commitment to start.</div>'}`;
}

function rExport() {
  const brief = buildCfoBrief(state);
  views.export._brief = brief;
  views.export.innerHTML = `
    <div style="display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap">
      <button class="btn btn-primary" data-a="ai-enhance-brief" ${state.aiLoading ? 'disabled' : ''}>✦ AI enhance</button>
      <button class="btn btn-ghost" data-a="copy-brief">Copy</button>
      <button class="btn btn-ghost" data-a="dl-brief">Download .md</button>
      <button class="btn btn-ghost" data-a="export-json">Export JSON</button>
    </div><div class="pre" id="brief-pre">${esc(brief)}</div>`;
}

function modal(title, html, onSave) {
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = html;
  const m = $('#modal'), f = $('#modal-form');
  m.showModal();
  const h = async (e) => { e.preventDefault(); if (await onSave() !== false) m.close(); f.removeEventListener('submit', h); };
  f.addEventListener('submit', h);
}

function commitForm(c = {}) {
  return `<div class="field"><label>Name *</label><input name="name" required value="${esc(c.name || '')}"></div>
  <div class="field-row"><div class="field"><label>Vendor</label><input name="vendor" value="${esc(c.vendor || '')}"></div>
  <div class="field"><label>Category</label><select name="category">${CATS.map((x) => `<option ${c.category === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div></div>
  <div class="field-row"><div class="field"><label>Amount</label><input type="number" name="amountMonthly" value="${c.amountMonthly || ''}"></div>
  <div class="field"><label>Cycle</label><select name="billingCycle"><option value="monthly" ${c.billingCycle === 'monthly' ? 'selected' : ''}>monthly</option><option value="annual" ${c.billingCycle === 'annual' ? 'selected' : ''}>annual</option></select></div></div>
  <div class="field-row"><div class="field"><label>Renewal</label><input type="date" name="renewalDate" value="${c.renewalDate || ''}"></div>
  <div class="field"><label>Owner</label><input name="owner" value="${esc(c.owner || '')}"></div></div>
  <div class="field"><label>Notes</label><textarea name="notes">${esc(c.notes || '')}</textarea></div>`;
}

document.body.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-a]');
  if (!b) return;
  const a = b.dataset.a, id = b.dataset.id;

  if (a === 'refresh-health') { state.apiHealth = await checkHealth(); rSetup(); toast('Refreshed'); }
  if (a === 'ai-burn') {
    state.aiLoading = true; render();
    try { const { result } = await ai.analyzeBurn(ctx()); state.aiBurn = result; toast('Analysis done'); }
    catch (err) { toast(err.message); go('setup'); } finally { state.aiLoading = false; go('command'); }
  }
  if (a === 'extract-commitments') {
    modal('Extract commitments', '<div class="field"><label>Paste invoice, renewal email, or vendor list</label><textarea name="text" rows="8"></textarea></div>', async () => {
      const text = new FormData($('#modal-form')).get('text');
      if (!text?.trim()) return false;
      state.aiLoading = true; toast('Extracting…');
      try {
        const { commitments: list } = await ai.extractCommitments(text);
        for (const c of list) await put('commitments', { id: uid(), ...c, status: 'active', billingCycle: c.billingCycle || 'monthly', createdAt: new Date().toISOString() });
        await reload(); toast(`Added ${list.length}`); return true;
      } catch (err) { toast(err.message); return false; } finally { state.aiLoading = false; }
    });
  }
  if (a === 'new-commit' || a === 'quick-add') modal('New commitment', commitForm(), async () => {
    const fd = new FormData($('#modal-form'));
    await put('commitments', { id: uid(), name: fd.get('name'), vendor: fd.get('vendor'), category: fd.get('category'), amountMonthly: Number(fd.get('amountMonthly')), billingCycle: fd.get('billingCycle'), renewalDate: fd.get('renewalDate') || null, owner: fd.get('owner'), notes: fd.get('notes'), status: 'active', createdAt: new Date().toISOString() });
    await reload(); toast('Saved');
  });
  if (a === 'edit-commit') {
    const c = state.commitments.find((x) => x.id === id);
    modal('Edit', commitForm(c), async () => {
      const fd = new FormData($('#modal-form'));
      Object.assign(c, { name: fd.get('name'), vendor: fd.get('vendor'), category: fd.get('category'), amountMonthly: Number(fd.get('amountMonthly')), billingCycle: fd.get('billingCycle'), renewalDate: fd.get('renewalDate') || null, owner: fd.get('owner'), notes: fd.get('notes') });
      await put('commitments', c); await reload(); toast('Updated');
    });
  }
  if (a === 'del-commit' && confirm('Delete?')) { await remove('commitments', id); await reload(); }
  if (a === 'nego-commit') {
    const c = state.commitments.find((x) => x.id === id);
    state.aiLoading = true; toast('Benchmarking…');
    try {
      const bench = await ai.vendorBenchmark(c.vendor || c.name, c.category);
      const { brief } = await ai.negotiationBrief({ name: c.name, vendor: c.vendor, monthly: monthlyAmount(c), renewalDate: c.renewalDate }, bench.raw_results || []);
      state.negotiateResult = brief;
      go('negotiate');
    } catch (err) { toast(err.message); } finally { state.aiLoading = false; }
  }
  if (a === 'overlap-scan') {
    state.aiLoading = true; render();
    try { const { overlaps } = await ai.overlapScan(state.commitments.filter((c) => c.status !== 'cancelled')); state.overlaps = overlaps; toast('Scan done'); }
    catch (err) { toast(err.message); } finally { state.aiLoading = false; go('overlap'); }
  }
  if (a === 'new-hc') modal('Headcount', `<div class="field"><label>Role</label><input name="role" required></div><div class="field-row"><div class="field"><label>Dept</label><input name="department"></div><div class="field"><label>Type</label><select name="type"><option>fte</option><option>contractor</option></select></div></div><div class="field-row"><div class="field"><label>Loaded $/mo</label><input type="number" name="loadedMonthly"></div><div class="field"><label>Count</label><input type="number" name="headcount" value="1"></div></div>`, async () => {
    const fd = new FormData($('#modal-form'));
    await put('headcount', { id: uid(), role: fd.get('role'), department: fd.get('department'), type: fd.get('type'), loadedMonthly: Number(fd.get('loadedMonthly')), headcount: Number(fd.get('headcount')), status: 'active', createdAt: new Date().toISOString() });
    await reload(); toast('Saved');
  });
  if (a === 'del-hc') { await remove('headcount', id); await reload(); }
  if (a === 'new-api') modal('API / Cloud', `<div class="field"><label>Service</label><input name="service" required></div><div class="field-row"><div class="field"><label>Est $/mo</label><input type="number" name="estimatedMonthly"></div><div class="field"><label>Alert at</label><input type="number" name="alertThreshold"></div></div><div class="field"><label>Owner</label><input name="owner"></div>`, async () => {
    const fd = new FormData($('#modal-form'));
    await put('apiCosts', { id: uid(), service: fd.get('service'), category: 'api', estimatedMonthly: Number(fd.get('estimatedMonthly')), usageBased: true, alertThreshold: Number(fd.get('alertThreshold')), owner: fd.get('owner'), status: 'active', createdAt: new Date().toISOString() });
    await reload(); toast('Saved');
  });
  if (a === 'del-api') { await remove('apiCosts', id); await reload(); }
  if (a === 'new-price') modal('Pricing exception', `<div class="field"><label>Deal</label><input name="dealName" required></div><div class="field-row"><div class="field"><label>Discount %</label><input type="number" name="discountPercent"></div><div class="field"><label>ARR impact ($)</label><input type="number" name="arrImpact"></div></div><div class="field"><label>Owner</label><input name="owner"></div>`, async () => {
    const fd = new FormData($('#modal-form'));
    await put('pricingExceptions', { id: uid(), dealName: fd.get('dealName'), discountPercent: Number(fd.get('discountPercent')), arrImpact: Number(fd.get('arrImpact')), owner: fd.get('owner'), approved: false, date: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString() });
    await reload(); toast('Logged');
  });
  if (a === 'approve-price') { const p = state.pricingExceptions.find((x) => x.id === id); p.approved = true; await put('pricingExceptions', p); await reload(); }
  if (a === 'del-price') { await remove('pricingExceptions', id); await reload(); }
  if (a === 'copy-brief') { await navigator.clipboard.writeText(views.export._brief); toast('Copied'); }
  if (a === 'dl-brief') { const blob = new Blob([views.export._brief], { type: 'text/markdown' }); const l = document.createElement('a'); l.href = URL.createObjectURL(blob); l.download = 'keepline-cfo-brief.md'; l.click(); }
  if (a === 'export-json') { const blob = new Blob([JSON.stringify(await exportAll(), null, 2)]); const l = document.createElement('a'); l.href = URL.createObjectURL(blob); l.download = 'keepline-export.json'; l.click(); }
  if (a === 'ai-enhance-brief') {
    state.aiLoading = true;
    try { const { brief } = await ai.enhanceBrief(views.export._brief, ctx()); views.export._brief = brief; document.getElementById('brief-pre').textContent = brief; toast('Enhanced'); }
    catch (err) { toast(err.message); } finally { state.aiLoading = false; }
  }
});

document.querySelectorAll('.nav-btn').forEach((b) => b.addEventListener('click', () => go(b.dataset.view)));
$('#btn-quick-add').onclick = () => document.querySelector('[data-a="new-commit"]')?.click() || modal('New commitment', commitForm(), async () => {
  const fd = new FormData($('#modal-form'));
  await put('commitments', { id: uid(), name: fd.get('name'), vendor: fd.get('vendor'), category: fd.get('category'), amountMonthly: Number(fd.get('amountMonthly')), billingCycle: fd.get('billingCycle'), renewalDate: fd.get('renewalDate') || null, owner: fd.get('owner'), notes: fd.get('notes'), status: 'active', createdAt: new Date().toISOString() });
  await reload(); toast('Saved');
});
$('#modal-close').onclick = () => $('#modal').close();
$('#modal-cancel').onclick = () => $('#modal').close();
$('#btn-import').onclick = () => $('#import-file').click();
$('#import-file').onchange = async (e) => {
  const f = e.target.files?.[0]; if (!f) return;
  try { await importAll(JSON.parse(await f.text())); await reload(); toast('Imported'); } catch { toast('Bad JSON'); }
  e.target.value = '';
};

(async () => {
  await openDb(); await seedIfEmpty();
  state.apiHealth = await checkHealth();
  await reload();
})();