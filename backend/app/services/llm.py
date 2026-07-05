import json
import re

from openai import OpenAI

from ..config import Config


def _client() -> OpenAI:
    if not Config.LLM_API_KEY:
        raise RuntimeError('LLM_API_KEY not configured')
    return OpenAI(api_key=Config.LLM_API_KEY, base_url=Config.LLM_BASE_URL)


def _chat(system: str, user: str, temperature: float = 0.35) -> str:
    resp = _client().chat.completions.create(
        model=Config.LLM_MODEL_NAME,
        temperature=temperature,
        messages=[{'role': 'system', 'content': system}, {'role': 'user', 'content': user}],
    )
    return resp.choices[0].message.content or ''


def _parse_json(text: str):
    text = text.strip()
    m = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
    if m:
        text = m.group(1).strip()
    return json.loads(text)


def analyze_burn(context: dict) -> dict:
    system = (
        'You are a mid-market CFO advisor. Analyze committed burn and waste. '
        'Return JSON: summary, monthlyBurnRisk, topWaste (array of {title, detail, savingsEstimate}), '
        'renewalAlerts (array), recommendedActions (array of strings), healthScore (0-100).'
    )
    return _parse_json(_chat(system, json.dumps(context, ensure_ascii=False)))


def detect_overlap(commitments: list) -> list:
    system = (
        'Find overlapping/redundant SaaS and tools in this spend list. '
        'Return JSON array: {category, tools (array), overlapReason, estimatedWasteMonthly, action}.'
    )
    return _parse_json(_chat(system, json.dumps(commitments, ensure_ascii=False)))


def negotiation_brief(vendor: dict, benchmarks: list) -> dict:
    system = (
        'Create a vendor negotiation brief for a mid-market company. '
        'Return JSON: executiveSummary, leveragePoints (array), targetReductionPercent, '
        'talkingPoints (array), walkAwayLine, alternatives (array).'
    )
    payload = {'vendor': vendor, 'benchmarks': benchmarks}
    return _parse_json(_chat(system, json.dumps(payload, ensure_ascii=False)))


def enhance_cfo_brief(brief: str, context: dict) -> str:
    system = 'Enhance this CFO burn brief with sharper numbers, risks, and 14-day actions. Keep markdown.'
    return _chat(system, f"Brief:\n{brief}\n\nContext:\n{json.dumps(context, ensure_ascii=False)}")


def extract_commitments(text: str) -> list:
    system = (
        'Extract recurring cost commitments from text. Return JSON array: '
        '{name, vendor, category (saas|api|infrastructure|hr|legal|marketing|sales|other), '
        'amountMonthly, billingCycle (monthly|annual), renewalDate (YYYY-MM-DD or null), owner, seats}.'
    )
    data = _parse_json(_chat(system, text, temperature=0.25))
    return data if isinstance(data, list) else data.get('commitments', [])


def interpret_vendor_search(vendor: dict, results: list) -> dict:
    system = (
        'Summarize vendor pricing benchmarks from search results for negotiation. '
        'Return JSON: marketRateRange, competitorAlternatives (array), negotiationTips (array), confidence (low|medium|high).'
    )
    return _parse_json(_chat(system, json.dumps({'vendor': vendor, 'results': results}, ensure_ascii=False)))