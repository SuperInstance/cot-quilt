#!/usr/bin/env python3
"""v0.2: play-test battery + routes/conditional-environments emitter.

Owner directive: cheap cells judge; typesafe emits ROUTES and conditional
environments for future prompts with a similar ask. The v4-pro judge acts as
input-output simulator for thoroughness (already receipted); here the CHEAP
cells beta/play-test the graph: would it help YOU implement? which cell is
missing? Then jev-latest distills the graph into routing rules.
"""
import json, glob, sys, urllib.request, urllib.error, time
sys.path.insert(0, '/home/z/my-project/cot-quilt')
from cot_decompose import typesafe, KEYS

DEEPINFRA_KEY = KEYS['DEEPINFRA_API_KEY']

def deepinfra(model, prompt_text, max_tokens=900):
    t0 = time.time()
    req = urllib.request.Request(
        'https://api.deepinfra.com/v1/openai/chat/completions',
        data=json.dumps({'model': model, 'messages': [{'role': 'user', 'content': prompt_text}],
                         'max_tokens': max_tokens, 'temperature': 0.9}).encode(),
        method='POST',
        headers={'Authorization': f'Bearer {DEEPINFRA_KEY}', 'Content-Type': 'application/json',
                 'User-Agent': 'cot-quilt/0.2'})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            d = json.load(r)
        ch = d['choices'][0]['message']
        return {'content': ch.get('content'), 'finish': d['choices'][0].get('finish_reason'),
                'usage': d.get('usage'), 'ms': int((time.time() - t0) * 1000), 'model_served': d.get('model')}
    except urllib.error.HTTPError as e:
        return {'content': None, 'finish': None, 'error': f'HTTP {e.code}: {e.read().decode()[:150]}', 'ms': int((time.time() - t0) * 1000)}
    except Exception as e:
        return {'content': None, 'finish': None, 'error': str(e)[:150], 'ms': int((time.time() - t0) * 1000)}

rec = json.load(open(sorted(glob.glob('/home/z/my-project/cot-quilt/runs/*/receipt.json'))[-1]))
prompt = rec['prompt']
g2 = rec['_g2_cache']
judge = rec['judge']
compact = [{'label': n['label'], 'occurrence': n['occurrence'], 'max_load': n['max_load'], 'text': n['text']} for n in g2['nodes']]
divs = [{'label': d.get('label'), 'samples': d.get('samples')} for d in g2['divergent']]

PLAYERS = [
    ('ByteDance/Seed-2.0-mini', 'the court jester: mock whatever is flabby in this graph, then say the one thing it gets right'),
    ('ibm-granite/granite-4.2-3b', 'a narrow pragmatic racehorse: would this graph let you write the algorithm today? name the first blocker'),
    ('meta-models/Muse-Glimmer-30B', 'an intuitive coder: which single added cell would make this graph implementable?'),
]
verdicts = []
for model, role in PLAYERS:
    r = deepinfra(model, (
        f'You are {role}.\nOriginal prompt: {prompt}\n\nDecomposed reasoning graph:\n'
        f'{json.dumps(compact, ensure_ascii=False)[:3500]}\nDivergent routes: {json.dumps(divs)[:800]}\n'
        f'The big model self-judged thoroughness {judge["score"]}/10 with gaps: {json.dumps(judge["gaps"])[:600]}\n'
        'Answer in <=90 words. Be concrete and unimpressed.'))
    verdicts.append({'model': model, 'role': role, 'content': (r.get('content') or '')[:800],
                     'usage': r.get('usage'), 'finish': r.get('finish'), 'ms': r.get('ms'),
                     'error': r.get('error')})
    print(f'--- {model} ({role[:30]}...) finish={r.get("finish")} err={r.get("error")}')
    print((r.get('content') or '')[:350].strip())

# typesafe: routes + conditional environments from the graph
routes_q = {
    'route': {'type': 'choice',
              'instructions': 'A future prompt asks for "a local rule that allocates turns fairly among competing units with only neighbor information". Which cluster should the reasoning START from?',
              'criteria': {n['label']: n['text'][:120] for n in g2['nodes'][:6]}},
    'entry_check': {'type': 'noul', 'p': 0.5,
                    'instructions': 'Would a prompt about ANY local/neighborhood allocation rule reuse this graph as its starting route (not just computation budget)?'},
    'skip_route': {'type': 'choice',
                   'instructions': 'For a prompt that ONLY asks about starvation-freedom (no design), which cluster is the entry?',
                   'criteria': {n['label']: n['text'][:120] for n in g2['nodes'][:6]}},
    'completeness': {'type': 'score',
                     'instructions': 'How reusable is this graph as a conditional environment for future similar prompts?',
                     'criteria': ['single-prompt artifact', 'partially reusable', 'reusable with the critique cells', 'a general routing table']},
}
ts = typesafe(f'Graph distilled from a large model\'s multi-seed reasoning. Original prompt: {prompt}', routes_q)
print('\n=== typesafe ROUTES ===')
print(json.dumps(ts.get('answers'), indent=1)[:700])

out = {'playtest': verdicts, 'routes': ts, 'run': rec['run']}
with open('/home/z/my-project/cot-quilt/runs/playtest-' + rec['run'] + '.json', 'w') as f:
    json.dump(out, f, indent=1, ensure_ascii=False)
print('\nsaved playtest receipt.')
