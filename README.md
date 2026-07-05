# Keepline — Burn & Commitment Control

**What mid-market companies fight most:** SaaS sprawl, renewal traps, HR creep, API bill surprises, and pricing leaks — with no procurement team and a spreadsheet for a CFO.

Keepline is the control tower. Clone it, plug in 3 API keys, run.

```
git clone https://github.com/YOUR_USERNAME/keepline.git
cd keepline
cp .env.example .env
npm run setup
npm run dev
→ http://localhost:8792
```

## The 3 APIs

| Key | Powers | Get it |
|-----|--------|--------|
| `LLM_API_KEY` | Burn analysis, overlap scan, negotiation briefs, CFO enhance, extract commitments from invoices | [Groq](https://console.groq.com/) |
| `TAVILY_API_KEY` | Live vendor pricing benchmarks | [Tavily](https://tavily.com/) |
| `SERPER_API_KEY` | Google search for negotiation intel | [Serper](https://serper.dev/) |

**Minimum:** `LLM_API_KEY` alone unlocks all AI features. Add Tavily + Serper for vendor benchmark search.

## What mid-market lacks (research-backed)

| Fight | Scale |
|-------|-------|
| SaaS sprawl & shadow subscriptions | $3k–$5k/employee/yr; 30% wasted |
| Renewal auto-charge blindness | 53% surprised annually |
| Cash / committed burn visibility | 62% can't forecast reliably |
| HR & people cost creep | 60–70% of opex |
| API & cloud surprises | Usage overruns unowned |
| Pricing discount erosion | Margin leak, no approval trail |
| No procurement function | Enterprise wars, startup tools |

## Features

- **Burn Command** — monthly committed burn (SaaS + HR + API)
- **Commitments** — every recurring cost with owner & renewal date
- **Renewal Radar** — 90-day countdown
- **HR & People** — loaded FTE + contractor burn
- **API & Cloud** — usage lines with alert thresholds
- **Pricing Leaks** — discount exceptions & ARR impact
- **Overlap Scanner** — AI finds duplicate tools
- **Negotiation Lab** — AI brief + web vendor benchmarks
- **CFO Brief** — exportable markdown

All data **local-first** (IndexedDB). API keys stay in `.env` on your machine.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Keepline burn control"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/keepline.git
git push -u origin main
```

Never commit `.env`.

## vs Stratum

| | **Stratum** | **Keepline** |
|---|-------------|--------------|
| Layer | Strategic assumptions | Operational committed burn |
| Fights | "What must be true to win?" | "What are we committed to pay?" |
| User | Strategy / board | CFO / ops / founders |

Use both — strategy truth + burn truth.

MIT License.