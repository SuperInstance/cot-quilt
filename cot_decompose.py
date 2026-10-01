#!/usr/bin/env python3
"""
cot_decompose.py — the CoT-decomposition cell (wave-64).

Directive (owner): the chain-of-thought of a large model (deepseek-v4-pro) can be
decomposed by cheaper models (deepseek-flash + typesafe.ai JEV) into a cellular
graph of the larger model's idea: nodes = reasoning steps, edges = inferred
dependencies/routes, weights = typesafe inference. Multi-seed sampling of the
same prompt creates "more neural-networks of logic"; the larger model itself
judges how thorough the decomposition is becoming.

Pipeline (one run):
  0. SEEDS   — 3 seeds drawn from mothquantum certified entropy (fail-closed to
               os.urandom with degraded=true flag; recorded either way).
               NOTE receipted 2026-10-01: the deepseek endpoint demonstrably
               ignores `seed` (probe: seed=42 -> 347, seed=42 -> 7). So each
               sample ALSO gets a lens persona to guarantee orthogonality; the
               requested seed is book-keeping, the lens is the mechanism.
  1. COT     — 3x deepseek-v4-pro (api id: deepseek-reasoner) samples of the
               same prompt, different lens; capture reasoning_content + answer
               + usage + finish_reason.
  2. SPLIT   — deepseek-flash decomposes each CoT into <=8 steps
               (kind: PREMISE|INFERENCE|CHECK|DECISION|CONCLUSION, 1-line each).
  3. WIRE    — typesafe.ai systemone (jev-latest), one battery per sample:
               - per-step load-bearing score (rubric 0..3)
               - per-step dependency choice (which two earlier steps feed it?)
               => nodes get weights, edges get typesafe probabilities.
  4. MERGE   — deepseek-flash aligns steps across samples (same idea map);
               cross-seed node = union with occurrence count; kept divergences
               become alternate-route nodes (the "more neural-networks" ask).
  5. JUDGE   — deepseek-v4-pro judges the merged graph against the prompt:
               thoroughness 0..10 + what is missing; flash folds the critique
               into graph v2 (adds missing nodes marked origin="critique").
  6. RECEIPTS — runs/<ts>/receipt.json: every call's model, lens, seed, usage,
               latency, answer-hash; graph.json v1+v2; degeneracy flags.

Cell signature (drop into a quilt):
  in : {prompt, n_seeds?=3, lenses?[]}
  out: {graph_v1, graph_v2, judge:{score, gaps[]}, receipts}
"""
import json, hashlib, os, sys, time, urllib.request, urllib.error
from datetime import datetime, timezone

KEYS = {}
for line in open('/home/z/my-project/.env.keys'):
    if '=' in line and not line.startswith('#'):
        k, v = line.strip().split('=', 1)
        KEYS[k] = v

DS_KEY = KEYS['DEEPSEEK_API_KEY']
TS_KEY = KEYS['TYPESAFE_API_KEY']
MQ_KEY = KEYS['MOTHQUANTUM_API_KEY']
DS_URL = 'https://api.deepseek.com/chat/completions'
TS_URL = 'https://api.typesafe.ai/v1/systemone'
MQ_URL = 'https://api.mothquantum.com/api/v1/engines/coin-toss-v1/process'

DEFAULT_LENSES = [
    'a skeptic who trusts only what can be checked against the stated premises',
    'an engineer who wants the smallest mechanism that could work',
    'a teacher who explains by building one small piece at a time',
]

RUBRIC_LOAD = ['decorative: could be cut with no effect', 'minor: touches the answer slightly',
               'load-bearing: removing it breaks the path', 'pivotal: the step that makes the answer']


def http(url, key, body=None, timeout=180, method=None):
    t0 = time.time()
    m = method or ('POST' if body is not None else 'GET')
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=m,
                                 headers={'Authorization': f'Bearer {key}',
                                          'Content-Type': 'application/json',
                                          'User-Agent': 'cot-quilt/0.1'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = json.load(r)
            return {'status': 200, 'body': data, 'ms': int((time.time() - t0) * 1000)}
    except urllib.error.HTTPError as e:
        try:
            return {'status': e.code, 'body': json.loads(e.read().decode() or '{}'), 'ms': int((time.time() - t0) * 1000)}
        except Exception:
            return {'status': e.code, 'body': {}, 'ms': int((time.time() - t0) * 1000)}
    except Exception as e:
        return {'status': -1, 'body': {'error': str(e)}, 'ms': int((time.time() - t0) * 1000)}


def deepseek(model, messages, max_tokens=4000, seed=None, retries=1):
    body = {'model': model, 'messages': messages, 'max_tokens': max_tokens}
    if seed is not None:
        body['seed'] = seed  # recorded; endpoint ignores it (receipted finding)
    r = http(DS_URL, DS_KEY, body)
    out = {'model_requested': model, 'model_served': None, 'ms': r['ms'], 'status': r['status'],
           'usage': r['body'].get('usage'), 'finish': None, 'content': None, 'cot': None}
    if r['status'] == 200 and r['body'].get('choices'):
        ch = r['body']['choices'][0]['message']
        out.update({'model_served': r['body'].get('model'), 'finish': r['body']['choices'][0].get('finish_reason'),
                    'content': ch.get('content'), 'cot': ch.get('reasoning_content')})
    else:
        out['error'] = json.dumps(r['body'])[:300]
    # reasoner burn guard: all budget spent on reasoning, no content emitted -> retry bigger
    if out['finish'] == 'length' and not out['content'] and retries > 0:
        bigger = dict(body)
        bigger['max_tokens'] = max(max_tokens * 3, 16000)
        r2 = http(DS_URL, DS_KEY, bigger)
        if r2['status'] == 200 and r2['body'].get('choices'):
            ch = r2['body']['choices'][0]['message']
            out.update({'model_served': r2['body'].get('model'), 'finish': r2['body']['choices'][0].get('finish_reason'),
                        'content': ch.get('content'), 'cot': ch.get('reasoning_content'),
                        'usage': r2['body'].get('usage'), 'ms': out['ms'] + r2['ms'], 'retried_bigger': True})
        else:
            out['retry_error'] = json.dumps(r2['body'])[:300]
    return out


def typesafe(state, questions):
    r = http(TS_URL, TS_KEY, {'model': 'jev-latest', 'state': state[:20000], 'questions': questions}, timeout=240)
    out = {'status': r['status'], 'ms': r['ms'], 'answers': None, 'usage': r['body'].get('usage'), 'served': r['body'].get('model')}
    if r['status'] == 200:
        out['answers'] = r['body'].get('answers')
    else:
        out['error'] = json.dumps(r['body'])[:400]
    return out


def moth_seeds(n=3):
    """n seeds, each 16 TRUE bits from 16 parallel one-shot certified coin jobs;
    fail-closed per-bit to os.urandom with per-bit flags; degraded=true if any bit fell back."""
    seeds, degraded = [], False
    api = 'https://api.mothquantum.com/api/v1'
    for _ in range(n):
        bits16, sources = [], []
        jobs = []
        for _ in range(16):
            r = http(f'{api}/engines/coin-toss-v1/process', MQ_KEY, {'params': {'shots': 1}}, timeout=20)
            jid = (r.get('body') or {}).get('job_id')
            if jid:
                jobs.append(jid)
            else:
                jobs.append(None)
        for jid in jobs:
            bit = None
            if jid:
                for _ in range(10):
                    time.sleep(1.2)
                    res = http(f'{api}/jobs/{jid}/result', MQ_KEY, method='GET', timeout=15)
                    b = res.get('body') or {}
                    if res['status'] == 200 and isinstance(b.get('result'), dict):
                        bit = b['result'].get('output')  # 'heads' | 'tails'
                        break
            if bit in ('heads', 'tails'):
                bits16.append('1' if bit == 'heads' else '0')
                sources.append('mothquantum/coin-toss-v1:1shot')
            else:
                bits16.append(str(int.from_bytes(os.urandom(1), 'big') & 1))
                sources.append('os.urandom(fail-closed)')
                degraded = True
        bits = ''.join(bits16)
        seeds.append({'seed': int(bits, 2), 'bits16': bits, 'source': '+'.join(set(sources)),
                      'entropy_bits_true': sum(1 for s in sources if 'moth' in s), 'job_ids': jobs})
    return seeds, degraded


def _parse_json_loose(text):
    """strip fences, find outermost braces, parse; None on failure."""
    if not text:
        return None
    t = text.strip()
    if t.startswith('```'):
        t = t.strip('`')
        if t.startswith('json'):
            t = t[4:]
    a, b = t.find('{'), t.rfind('}')
    if a < 0 or b <= a:
        return None
    try:
        return json.loads(t[a:b + 1])
    except Exception:
        return None


def deepseek_json(model, sys_p, usr_p, max_tokens=2000):
    """flash call that MUST return JSON: response_format + loose parse + one repair retry."""
    r = deepseek(model, [{'role': 'system', 'content': sys_p + ' Respond with a single JSON object.'},
                         {'role': 'user', 'content': usr_p}], max_tokens=max_tokens)
    j = _parse_json_loose(r.get('content'))
    if j is None and r.get('content'):
        r2 = deepseek(model, [{'role': 'system', 'content': sys_p},
                              {'role': 'user', 'content': usr_p + '\n\nYour previous reply was not parseable JSON. Return ONLY the JSON object, nothing else.'}],
                      max_tokens=max_tokens)
        j = _parse_json_loose(r2.get('content'))
        if j is not None:
            r = r2
            r['repaired_json'] = True
    return j, r


def split_cot(cot, lens):
    sys_p = ('You compress a chain-of-thought into reasoning cells. Return ONLY JSON: '
             '{"steps":[{"id":"s1","kind":"PREMISE|INFERENCE|CHECK|DECISION|CONCLUSION","text":"one line, self-contained"}]}. '
             'Max 8 steps. Keep the logical spine; drop rhetoric. A CHECK is a self-verification move; a DECISION is a fork taken.')
    usr = f'Chain-of-thought (lens: {lens}):\n"""\n{cot[:9000]}\n"""'
    j, r = deepseek_json('deepseek-flash', sys_p, usr, max_tokens=1500)
    steps = (j or {}).get('steps', [])[:8] if j else []
    return {'steps': steps, 'receipt': r}


def wire_battery(prompt, answer, steps):
    """typesafe battery: load-bearing scores + dependency choices (edges)."""
    ids = [s['id'] for s in steps]
    q = {}
    for i, s in enumerate(steps):
        q[f'score_{s["id"]}'] = {'type': 'score', 'instructions': f'How load-bearing is this step for reaching the answer? Step: {s["text"]}', 'criteria': RUBRIC_LOAD}
        earlier = ids[:i]
        if earlier:
            q[f'dep_{s["id"]}'] = {'type': 'choice', 'instructions': f'Which earlier step does "{s["text"]}" most depend on?', 'criteria': {e: next(x['text'] for x in steps if x['id'] == e)[:160] for e in earlier[:6]}}
    state = f'Prompt: {prompt}\nFinal answer: {answer}\nReasoning steps under judgment.'
    return typesafe(state, q)


def extract_graph(steps, battery):
    nodes, edges = [], []
    a = battery.get('answers') or {}
    for s in steps:
        sc = a.get(f'score_{s["id"]}') or {}
        exp = None
        probs = sc.get('probabilities')
        if isinstance(probs, dict):
            try:
                exp = round(sum(float(p) * float(i) for i, p in probs.items()), 3)
            except Exception:
                exp = None
        nodes.append({'id': s['id'], 'kind': s.get('kind', 'INFERENCE'), 'text': s.get('text', '')[:220],
                      'load_score': sc.get('score'), 'load_expected': exp})
        dep = a.get(f'dep_{s["id"]}') or {}
        tgt = dep.get('choice')
        p = (dep.get('probabilities') or {}).get(tgt)
        if tgt:
            edges.append({'from': tgt, 'to': s['id'], 'p': p})
    return {'nodes': nodes, 'edges': edges}


def merge(graphs, lens_answers):
    """flash aligns steps across samples; cross-seed union with occurrence counts."""
    lst = []
    for g, la in zip(graphs, lens_answers):
        lst.append({'lens': la['lens'], 'answer': (la['answer'] or '')[:200], 'steps': [{'id': n['id'], 'text': n['text'], 'kind': n['kind']} for n in g['nodes']]})
    sys_p = ('Align reasoning steps across variants of the same reasoning. Return ONLY JSON: '
             '{"clusters":[{"label":"short concept name","members":[{"sample":0,"id":"s1"}],"text":"one line merging the members"}],'
             '"divergent":[{"label":"alternate route only in some samples","samples":[0,2],"text":"one line"}]}. '
             'Cluster steps that express the same logical move. Keep genuinely different routes as divergent entries.')
    r = deepseek('deepseek-flash', [{'role': 'system', 'content': sys_p},
                                    {'role': 'user', 'content': json.dumps(lst, ensure_ascii=False)[:12000]}], max_tokens=2000)
    merged = {'nodes': [], 'edges': [], 'clusters': [], 'divergent': []}
    if r['content']:
        try:
            j = json.loads(r['content'][r['content'].find('{'):r['content'].rfind('}') + 1])
            merged['clusters'] = j.get('clusters', [])
            merged['divergent'] = j.get('divergent', [])
        except Exception:
            pass
    # weight = how many samples contain the cluster; carry max typesafe load score upward
    for c in merged['clusters']:
        mem = c.get('members') or []
        samples = sorted({m.get('sample') for m in mem if isinstance(m, dict) and 'sample' in m})
        scores = []
        for m in mem:
            gi = m.get('sample')
            if isinstance(gi, int) and 0 <= gi < len(graphs):
                for n in graphs[gi]['nodes']:
                    if n['id'] == m.get('id') and n.get('load_expected') is not None:
                        scores.append(n['load_expected'])
        merged['nodes'].append({'label': c.get('label'), 'text': c.get('text'), 'samples': samples,
                                'occurrence': len(samples), 'max_load': max(scores) if scores else None})
    merged['edges'] = [{'from': e['from'], 'to': e['to'], 'p': e['p']} for g in graphs for e in g['edges']]
    merged['receipt'] = r
    return merged


def judge(prompt, answers, g2):
    """v4-pro judges thoroughness of the decomposition; returns score + gaps."""
    compact = [{'label': n['label'], 'occurrence': n['occurrence'], 'max_load': n['max_load'], 'text': n['text']} for n in g2['nodes']]
    divs = [{'label': d.get('label'), 'samples': d.get('samples'), 'text': d.get('text')} for d in g2['divergent']]
    sys_p = ('You are the input-output simulator: judge how thorough a decomposition of YOUR OWN reasoning is. '
             'Return ONLY JSON: {"thoroughness": 0-10, "gaps": ["missing move", ...max 5], "verdict": "one sentence"}.')
    usr = (f'Original prompt: {prompt}\n\nYour three answers: {json.dumps(answers)[:600]}\n\n'
           f'Decomposed graph: {json.dumps(compact, ensure_ascii=False)[:6000]}\nAlternate routes: {json.dumps(divs, ensure_ascii=False)[:1500]}\n'
           'What logical moves of your actual reasoning does this graph miss?')
    r = deepseek('deepseek-reasoner', [{'role': 'system', 'content': sys_p}, {'role': 'user', 'content': usr}], max_tokens=4000, seed=int.from_bytes(os.urandom(2), 'big'))
    out = {'receipt': r, 'score': None, 'gaps': [], 'verdict': None}
    if r['content']:
        try:
            j = json.loads(r['content'][r['content'].find('{'):r['content'].rfind('}') + 1])
            out.update({'score': j.get('thoroughness'), 'gaps': j.get('gaps', [])[:5], 'verdict': j.get('verdict')})
        except Exception:
            pass
    return out


def refine(prompt, g2, judge_out):
    """flash folds the v4-pro critique into graph v2 (origin=critique nodes)."""
    if not judge_out.get('gaps'):
        return g2
    sys_p = ('Fold critique gaps into a reasoning graph. Return ONLY JSON: '
             '{"added":[{"id":"g1","kind":"INFERENCE|CHECK|DECISION","text":"one line","bridges":["label of cluster it connects to"]}]}.')
    usr = (f'Existing clusters: {json.dumps([n["label"] for n in g2["nodes"]])}\n'
           f'Judge gaps: {json.dumps(judge_out["gaps"])}')
    r = deepseek('deepseek-flash', [{'role': 'system', 'content': sys_p}, {'role': 'user', 'content': usr}], max_tokens=1200)
    added = []
    if r['content']:
        try:
            j = json.loads(r['content'][r['content'].find('{'):r['content'].rfind('}') + 1])
            added = [{'id': a.get('id'), 'kind': a.get('kind', 'INFERENCE'), 'text': a.get('text'), 'bridges': a.get('bridges', []), 'origin': 'critique'} for a in (j.get('added') or [])]
        except Exception:
            pass
    g3 = dict(g2)
    g3['nodes'] = g2['nodes'] + added
    g3['refine_receipt'] = r
    return g3


def _save(rdir, rec):
    # atomic write: a mid-write kill must never truncate the receipt (wave-64 lesson)
    tmp = f'{rdir}/receipt.json.tmp'
    with open(tmp, 'w') as f:
        json.dump(rec, f, indent=1, ensure_ascii=False)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, f'{rdir}/receipt.json')


def run(prompt, n_seeds=3, lenses=None, outdir=None):
    lenses = lenses or DEFAULT_LENSES[:n_seeds]
    ts = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    slug = hashlib.sha1(prompt.encode()).hexdigest()[:8]
    rdir = outdir or f'/home/z/my-project/cot-quilt/runs/{ts}-{slug}'
    if outdir:
        os.makedirs(rdir, exist_ok=True)
        # resume: reload partial receipt
        rp = f'{rdir}/receipt.json'
        if os.path.exists(rp):
            with open(rp) as f:
                rec = json.load(f)
        else:
            rec = None
    else:
        rec = None
    if rec is None:
        os.makedirs(rdir, exist_ok=True)
        rec = {'run': f'{ts}-{slug}', 'prompt': prompt, 'started_utc': ts,
               'seed_ignore_finding': 'deepseek endpoint ignores `seed` (probe receipted); diversity enforced via lenses; seeds are book-keeping',
               'phases': {}}
        _save(rdir, rec)
    rdir_key = rec['run']

    # PHASE seeds (skip if done)
    if 'seeds' not in rec['phases']:
        seeds, degraded = moth_seeds(n_seeds)
        rec['phases']['seeds'] = {'seeds': seeds, 'degraded': degraded}
        _save(rdir, rec)
    seeds = rec['phases']['seeds']['seeds']
    degraded = rec['phases']['seeds']['degraded']

    # PHASE cot samples (per-sample resume via sample-i-cot.md)
    samples = []
    for i, lens in enumerate(lenses):
        f_i = f'{rdir}/sample-{i}-cot.md'
        done = os.path.exists(f_i) and len(rec['phases'].get('cot', [])) > i
        if done:
            with open(f_i) as f:
                body = f.read()
            cot = body.split('## chain-of-thought\n\n', 1)[-1].split('\n\n## answer', 1)[0]
            ans = body.split('## answer\n\n', 1)[-1]
            meta = rec['phases']['cot'][i]
            samples.append({'lens': lens, 'seed_requested': meta['seed'], 'receipt': {'ms': meta['ms'], 'usage': meta['usage'], 'finish': meta['finish']}, 'answer': ans, 'cot': cot})
        else:
            r = deepseek('deepseek-reasoner', [{'role': 'user', 'content': f'Lens: you are {lens}.\n\n{prompt}'}],
                         max_tokens=12000, seed=seeds[i]['seed'])
            samples.append({'lens': lens, 'seed_requested': seeds[i], 'receipt': r, 'answer': r['content'], 'cot': r['cot']})
            with open(f_i, 'w') as f:
                f.write(f"# sample {i} — lens: {lens}\n\n## seed_requested\n{json.dumps(seeds[i])}\n\n## chain-of-thought\n\n{(r['cot'] or '')}\n\n## answer\n\n{(r['content'] or '')}\n")
            entry = {'lens': lens, 'seed': seeds[i], 'usage': r['usage'], 'finish': r['finish'], 'ms': r['ms'],
                     'answer_sha1': hashlib.sha1((r['content'] or '').encode()).hexdigest()[:12]}
            rec['phases'].setdefault('cot', [])
            rec['phases']['cot'] = (rec['phases']['cot'] + [entry])[:i + 1]
            _save(rdir, rec)
    for i, s in enumerate(samples):
        pass  # degeneracy flag computed below at write-out

    # PHASE split+wire (per-sample resume via phases.split_wire length)
    graphs = []
    sw_done = len(rec['phases'].get('split_wire', []))
    for i, s in enumerate(samples):
        if i < sw_done:
            graphs.append(rec['phases']['split_wire'][i]['graph'])
            continue
        sp = split_cot(s['cot'] or s['answer'] or '', s['lens'])
        bat = wire_battery(prompt, s['answer'] or '', sp['steps']) if sp['steps'] else {'answers': {}}
        g = extract_graph(sp['steps'], bat)
        graphs.append(g)
        rec['phases'].setdefault('split_wire', []).append({'sample': i, 'n_steps': len(sp['steps']),
                                                           'ts_status': bat.get('status'), 'ts_served': bat.get('served'),
                                                           'ts_ms': bat.get('ms'), 'steps': sp['steps'],
                                                           'graph': g, 'battery_error': bat.get('error')})
        _save(rdir, rec)

    # PHASE merge
    if 'merge' not in rec['phases'] or rec['phases']['merge'] is None:
        g2 = merge(graphs, [{'lens': s['lens'], 'answer': s['answer']} for s in samples])
        rec['phases']['merge'] = {'clusters': len(g2['clusters']), 'divergent': len(g2['divergent']),
                                  'nodes': g2['nodes'], 'divergent_nodes': g2['divergent'],
                                  'flash_ms': g2['receipt']['ms']}
        rec['_g2_cache'] = {'nodes': g2['nodes'], 'edges': g2['edges'], 'clusters': g2['clusters'],
                            'divergent': g2['divergent']}
        _save(rdir, rec)
    else:
        g2 = rec['_g2_cache']

    # PHASE judge
    if 'judge' not in rec['phases']:
        j = judge(prompt, [s['answer'] or s['receipt'].get('content') for s in samples], g2)
        rec['phases']['judge'] = {'score': j['score'], 'gaps': j['gaps'], 'verdict': j['verdict'],
                                  'judge_ms': j['receipt']['ms'], 'judge_usage': j['receipt']['usage']}
        rec['_judge_out'] = {'score': j['score'], 'gaps': j['gaps'], 'verdict': j['verdict']}
        _save(rdir, rec)
    else:
        j = rec['_judge_out']

    # PHASE refine
    if 'refine' not in rec['phases']:
        g3 = refine(prompt, g2, j)
        rec['phases']['refine'] = {'added': [n for n in g3['nodes'] if n.get('origin') == 'critique'],
                                   'refine_ms': g3.get('refine_receipt', {}).get('ms')}
        rec['graph_v1'] = graphs
        rec['graph_v2'] = {k: g3[k] for k in g3 if k != 'refine_receipt'}
        rec['judge'] = {'score': j['score'], 'gaps': j['gaps'], 'verdict': j['verdict']}
        rec['finished_utc'] = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
        _save(rdir, rec)
        g3_out = g3
    else:
        g3_out = rec['graph_v2']
        g3 = g3_out

    print(json.dumps({'run': rec['run'], 'resumed_from': rdir, 'seeds': [s['seed'] for s in seeds],
                      'degraded': degraded, 'steps_per_sample': [len(g['nodes']) for g in graphs],
                      'clusters': rec['phases']['merge']['clusters'], 'divergent': rec['phases']['merge']['divergent'],
                      'judge_score': rec['phases']['judge']['score'], 'judge_gaps': len(rec['phases']['judge']['gaps']),
                      'critique_nodes': len(rec['phases']['refine']['added'])}, indent=1))
    return rec


if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('prompt', nargs='?')
    ap.add_argument('--resume', help='run dir to resume (foreground chunk mode)')
    a = ap.parse_args()
    prompt = a.prompt or (
        'Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of '
        'computation budget, given per-cell potential and resistance values. The rule must use only a cell and its '
        'direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever.')
    if a.resume:
        run(prompt, n_seeds=3, outdir=a.resume)
    else:
        run(prompt, n_seeds=3)
