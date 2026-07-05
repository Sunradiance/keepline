from flask import jsonify, request
from ..config import Config
from ..services import llm, search
from . import api_bp


@api_bp.route('/health', methods=['GET'])
def health():
    s = Config.status()
    return jsonify({
        'status': 'ok', 'service': 'Keepline', 'apis': s,
        'message': 'All APIs ready' if s['ready'] and s['search_ready']
        else 'LLM ready' if s['ready'] else 'Add API keys to .env',
    })


@api_bp.route('/ai/analyze-burn', methods=['POST'])
def analyze_burn():
    if not Config.LLM_API_KEY:
        return jsonify({'error': 'LLM_API_KEY not configured'}), 400
    try:
        return jsonify({'ok': True, 'result': llm.analyze_burn(request.get_json(silent=True) or {})})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/ai/overlap-scan', methods=['POST'])
def overlap_scan():
    if not Config.LLM_API_KEY:
        return jsonify({'error': 'LLM_API_KEY not configured'}), 400
    body = request.get_json(silent=True) or {}
    try:
        overlaps = llm.detect_overlap(body.get('commitments', []))
        return jsonify({'ok': True, 'overlaps': overlaps})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/ai/negotiation-brief', methods=['POST'])
def negotiation_brief():
    if not Config.LLM_API_KEY:
        return jsonify({'error': 'LLM_API_KEY not configured'}), 400
    body = request.get_json(silent=True) or {}
    vendor = body.get('vendor', {})
    benchmarks = body.get('benchmarks', [])
    if not vendor:
        return jsonify({'error': 'vendor required'}), 400
    try:
        return jsonify({'ok': True, 'brief': llm.negotiation_brief(vendor, benchmarks)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/ai/enhance-brief', methods=['POST'])
def enhance_brief():
    if not Config.LLM_API_KEY:
        return jsonify({'error': 'LLM_API_KEY not configured'}), 400
    body = request.get_json(silent=True) or {}
    try:
        return jsonify({'ok': True, 'brief': llm.enhance_cfo_brief(body.get('brief', ''), body.get('context', {}))})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/ai/extract-commitments', methods=['POST'])
def extract_commitments():
    if not Config.LLM_API_KEY:
        return jsonify({'error': 'LLM_API_KEY not configured'}), 400
    text = (request.get_json(silent=True) or {}).get('text', '').strip()
    if not text:
        return jsonify({'error': 'text required'}), 400
    try:
        return jsonify({'ok': True, 'commitments': llm.extract_commitments(text)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/vendor/benchmark', methods=['POST'])
def vendor_benchmark():
    if not Config.LLM_API_KEY:
        return jsonify({'error': 'LLM_API_KEY not configured'}), 400
    if not (Config.TAVILY_API_KEY or Config.SERPER_API_KEY):
        return jsonify({'error': 'TAVILY or SERPER required'}), 400
    body = request.get_json(silent=True) or {}
    name = body.get('vendor', body.get('name', '')).strip()
    category = body.get('category', 'saas')
    if not name:
        return jsonify({'error': 'vendor name required'}), 400
    try:
        raw = search.vendor_benchmark(name, category)
        interpreted = llm.interpret_vendor_search({'name': name, 'category': category}, raw)
        return jsonify({'ok': True, 'raw_results': raw, 'benchmark': interpreted})
    except Exception as e:
        return jsonify({'error': str(e)}), 500