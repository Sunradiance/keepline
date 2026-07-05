# Keepline — Burn & Commitment Control

<div align="center">

### You're bleeding money in places finance can't see.

47 SaaS tools. Half with no owner.  
Renewals that auto-charge to an inbox nobody monitors.  
Contractors on spreadsheets HR "forgot" to add.  
Sales discounts nobody logged.  
AWS line items with no name attached.

**Finance sees one row: "Software."**  
**Reality: $847k/year in subscriptions, overlaps, and traps you don't know you have.**

Mid-market companies fight enterprise wars with a spreadsheet and a prayer.

---

**Keepline is the control tower for committed burn.**

Not another expense report. Not Coupa for companies that can't afford Coupa.  
**Every recurring cost. Every renewal date. Every owner. Every leak.**

- Burn command — SaaS + HR + API in one monthly number  
- Renewal radar — 90/60/30-day alerts before auto-charge hits  
- Overlap scanner — AI finds duplicate tools bleeding you dry  
- Negotiation lab — vendor benchmarks + talking points  
- Pricing leak log — unapproved discounts with ARR impact  
- CFO brief — export what your board actually needs  

Clone it. Plug your API key. **60 seconds. Free. Local.**

```
git clone https://github.com/Sunradiance/keepline.git
cd keepline && cp .env.example .env && npm run setup && npm run dev
→ http://localhost:8792
```

</div>

---

## Sound familiar?

- ✅ CFO asks "what's our total SaaS spend?" → **3-day Slack archaeology expedition**
- ✅ Renewal email hits → **went to someone who left 8 months ago**
- ✅ Jira AND Linear AND Notion → **engineering pays for three project tools**
- ✅ "We have 40 seats on X" → **12 people actually use it**
- ✅ Sales gave 35% off → **nobody told finance; margin just... leaked**
- ✅ AWS bill up 23% → **no owner, no alert, no explanation**

If your house has this mess — **Keepline is the audit you should've had years ago.**

---

## The 3 APIs

| Key | Powers | Get it |
|-----|--------|--------|
| `LLM_API_KEY` | Burn analysis, overlap scan, negotiation briefs, CFO enhance, extract commitments from invoices | [Groq](https://console.groq.com/) |
| `TAVILY_API_KEY` | Live vendor pricing benchmarks | [Tavily](https://tavily.com/) |
| `SERPER_API_KEY` | Google search for negotiation intel | [Serper](https://serper.dev/) |

**Minimum:** `LLM_API_KEY` alone unlocks all AI features. Add Tavily + Serper for vendor benchmark search.

---

## What mid-market fights (and loses)

| Fight | Scale |
|-------|-------|
| SaaS sprawl & shadow subscriptions | $3k–$5k/employee/yr; 30% wasted |
| Renewal auto-charge blindness | 53% surprised annually |
| Cash / committed burn visibility | 62% can't forecast reliably |
| HR & people cost creep | 60–70% of opex |
| API & cloud surprises | Usage overruns unowned |
| Pricing discount erosion | Margin leak, no approval trail |
| No procurement function | Enterprise wars, startup headcount |

---

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

---

## Push to GitHub

```bash
git clone https://github.com/Sunradiance/keepline.git
```

Never commit `.env`.

---

## The stack

| App | Port | Layer |
|-----|------|-------|
| [Stratum](https://github.com/Sunradiance/stratum) | 8791 | What must be **true** to win |
| **Keepline** | 8792 | What you're **committed to pay** |
| [Whyline](https://github.com/Sunradiance/whyline) | 8793 | What was **decided and why** |

---

MIT License — stop the bleed.