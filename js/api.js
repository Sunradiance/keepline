export async function checkHealth() {
  try {
    const r = await fetch('/api/health');
    return r.ok ? r.json() : { status: 'offline', apis: {} };
  } catch {
    return { status: 'offline', apis: {}, message: 'Run npm run dev' };
  }
}

async function post(path, body) {
  const r = await fetch(`/api${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const ai = {
  analyzeBurn: (ctx) => post('/ai/analyze-burn', ctx),
  overlapScan: (commitments) => post('/ai/overlap-scan', { commitments }),
  negotiationBrief: (vendor, benchmarks) => post('/ai/negotiation-brief', { vendor, benchmarks }),
  enhanceBrief: (brief, context) => post('/ai/enhance-brief', { brief, context }),
  extractCommitments: (text) => post('/ai/extract-commitments', { text }),
  vendorBenchmark: (vendor, category) => post('/vendor/benchmark', { vendor, category }),
};