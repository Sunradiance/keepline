import requests

from ..config import Config


def tavily_search(query: str, max_results: int = 6) -> list[dict]:
    if not Config.TAVILY_API_KEY:
        return []
    resp = requests.post(
        'https://api.tavily.com/search',
        json={'api_key': Config.TAVILY_API_KEY, 'query': query, 'max_results': max_results, 'include_answer': True},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    out = []
    if data.get('answer'):
        out.append({'title': 'Summary', 'snippet': data['answer'], 'url': '', 'source': 'tavily'})
    for item in data.get('results', []):
        out.append({'title': item.get('title', ''), 'snippet': item.get('content', ''), 'url': item.get('url', ''), 'source': 'tavily'})
    return out


def serper_search(query: str, max_results: int = 6) -> list[dict]:
    if not Config.SERPER_API_KEY:
        return []
    resp = requests.post(
        'https://google.serper.dev/search',
        headers={'X-API-KEY': Config.SERPER_API_KEY, 'Content-Type': 'application/json'},
        json={'q': query, 'num': max_results},
        timeout=30,
    )
    resp.raise_for_status()
    return [
        {'title': i.get('title', ''), 'snippet': i.get('snippet', ''), 'url': i.get('link', ''), 'source': 'serper'}
        for i in resp.json().get('organic', [])[:max_results]
    ]


def vendor_benchmark(vendor_name: str, category: str) -> list[dict]:
    query = f'{vendor_name} {category} pricing enterprise mid-market per user cost 2025 2026 alternatives'
    seen, merged = set(), []
    for fn in (tavily_search, serper_search):
        try:
            for r in fn(query, 5):
                key = (r.get('title'), r.get('url'))
                if key not in seen:
                    seen.add(key)
                    merged.append(r)
        except requests.RequestException:
            continue
    return merged