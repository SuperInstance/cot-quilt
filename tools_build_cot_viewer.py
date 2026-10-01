#!/usr/bin/env python3
"""Render the latest cot-quilt run into a static SVG graph viewer page (Pages-ready)."""
import json, glob, os

runs = sorted(glob.glob('/home/z/my-project/cot-quilt/runs/*/receipt.json'))
rec = json.load(open(runs[-1]))
run_id = rec['run']

clusters = rec['phases']['merge']['nodes']
divergent = rec['phases']['merge']['divergent_nodes']
critique = rec['phases']['refine']['added']
judge = rec['judge']
seeds = [s['seed'] for s in rec['phases']['seeds']['seeds']]

import math
n = len(clusters)
R = 170
pos = {}
for i, c in enumerate(clusters):
    ang = 2 * math.pi * i / max(n, 1) - math.pi / 2
    pos[c['label']] = (320 + R * math.cos(ang), 300 + R * math.sin(ang))

def esc(s):
    return (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

svg = []
# cluster-cluster edges: critique bridges
edges = []
for a in critique:
    for b in (a.get('bridges') or []):
        if b in pos:
            edges.append((a['id'], b))
for aid, bl in edges:
    x, y = None, None
    cx, cy = pos[bl]
    svg.append(f'<line x1="{cx}" y1="{cy}" x2="{cx+40}" y2="{cy+40}" stroke="#d29922" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.7"/>')

# cluster nodes: radius by occurrence, fill by max_load
def load_color(ml):
    if ml is None: return '#388bfd'
    t = min(max((ml - 1.0) / 2.0, 0), 1)  # 1..3 -> 0..1
    r = int(56 + t * 180); g = int(139 - t * 60); b = int(253 - t * 120)
    return f'rgb({r},{g},{b})'

for c in clusters:
    x, y = pos[c['label']]
    rad = 26 + 10 * (c['occurrence'] - 2)
    col = load_color(c['max_load'])
    svg.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rad}" fill="{col}" opacity="0.92" stroke="#0d1117" stroke-width="2"/>')
    svg.append(f'<text x="{x:.0f}" y="{y:.0f}" text-anchor="middle" dy="4" font-size="10.5" fill="#fff" font-family="monospace">{c["occurrence"]}x {esc(c["label"][:16])}</text>')
    svg.append(f'<title>{esc(c["label"])}: {esc(c["text"])}</title>')

# divergent routes: dashed squares outside
import itertools
for j, d in enumerate(divergent):
    ang = 2 * math.pi * j / max(len(divergent), 1) - math.pi / 2 + 0.35
    x, y = 320 + 265 * math.cos(ang), 300 + 235 * math.sin(ang)
    svg.append(f'<rect x="{x-16:.0f}" y="{y-16:.0f}" width="32" height="32" rx="6" fill="none" stroke="#7ee787" stroke-width="1.5" stroke-dasharray="5 3"/>')
    svg.append(f'<text x="{x:.0f}" y="{y+30:.0f}" text-anchor="middle" font-size="9.5" fill="#7ee787" font-family="monospace">{esc((d.get("label") or "")[:22])}</text>')
    svg.append(f'<title>divergent route (samples {d.get("samples")}): {esc(d.get("text"))}</title>')

# critique nodes: gold diamonds below
crit_y = 560
for k, a in enumerate(critique):
    x = 90 + k * 118
    svg.append(f'<path d="M {x} {crit_y-13} L {x+13} {crit_y} L {x} {crit_y+13} L {x-13} {crit_y} Z" fill="#d29922" opacity="0.95"/>')
    svg.append(f'<text x="{x}" y="{crit_y+30}" text-anchor="middle" font-size="9" fill="#d29922" font-family="monospace">{a["id"]} {a["kind"][:4]}</text>')
    svg.append(f'<title>{a["kind"]}: {esc(a["text"])}</title>')

svg_body = '\n'.join(svg)
gaps_html = ''.join(f'<li>{esc(g)}</li>' for g in judge.get('gaps', []))

html = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>cot-quilt viewer — {run_id}</title>
<style>
body {{ background:#0d1117; color:#c9d1d9; font-family:ui-monospace,Menlo,monospace; margin:0; padding:24px; }}
h1 {{ color:#f0f6fc; font-size:20px; }} .acc {{ color:#d29922; }}
.card {{ background:#161b22; border:1px solid #30363d; border-radius:10px; padding:16px; margin:14px 0; }}
.score {{ font-size:44px; color:#7ee787; font-weight:700; }}
.tag {{ display:inline-block; border:1px solid #30363d; border-radius:20px; padding:2px 10px; margin:2px; font-size:11px; }}
.seed {{ color:#79c0ff; }} .gap {{ color:#ffa198; }}
svg {{ background:#0d1117; }}
.lg span {{ margin-right:14px; font-size:11px; }}
</style></head><body>
<h1>cot-quilt <span class="acc">graph viewer</span> — run {run_id}</h1>
<div class="card">prompt: {esc(rec['prompt'])[:220]}<br>
seeds: <span class="seed">{' / '.join(map(str, seeds))}</span> <span class="tag">mothquantum 16-bit × 3</span>
<span class="tag">3 CoT samples</span><span class="tag">{len(clusters)} clusters</span><span class="tag">{len(divergent)} divergent routes</span><span class="tag">{len(critique)} critique cells</span></div>
<div class="card"><span class="score">{judge.get('score')}/10</span> <span>v4-pro self-judged thoroughness</span><br><i>{esc(judge.get('verdict') or '')}</i>
<ul class="gap">{gaps_html}</ul></div>
<svg width="640" height="620" viewBox="0 0 640 620">{svg_body}</svg>
<div class="card lg"><span style="color:#388bfd">●</span> cluster node (size=occurrence, hue=load) <span style="color:#7ee787">□</span> divergent route <span style="color:#d29922">◆</span> critique cell (origin=judge) — hover nodes for full text</div>
<div class="card">cell signature — in: {{prompt, n_seeds, lenses}} · out: {{graph_v1, graph_v2, judge, receipts}} ·
clusters → value cells · edges → links with p as dial weight · judge.gaps → question-cells · critique nodes → next generation<br>
repo: github.com/SuperInstance/cot-quilt · erised playground: erised-mirror.pages.dev</div>
</body></html>"""

os.makedirs('/home/z/my-project/cf-deploy/cot-view', exist_ok=True)
with open('/home/z/my-project/cf-deploy/cot-view/index.html', 'w') as f:
    f.write(html)
print('viewer written; run =', run_id, '| clusters', len(clusters), '| div', len(divergent), '| crit', len(critique))
