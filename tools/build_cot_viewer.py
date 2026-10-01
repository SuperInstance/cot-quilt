#!/usr/bin/env python3
"""Render the latest cot-quilt run into a static SVG graph viewer page (Pages-ready).
v2 fixes from beta-test: multi-line labels inside circles, corner-anchored divergent
boxes, cluster->cluster edges derived by mapping per-sample step edges through the
merge clusters, critique row with full kind names."""
import json, glob, os, math

runs = sorted(glob.glob('/home/z/my-project/cot-quilt/runs/*/receipt.json'))
# complete runs only (a stray partial receipt from an abandoned resume must not win the sort)
rec = None
for rp in reversed(runs):
    try:
        cand = json.load(open(rp))
        if cand.get('judge') and cand.get('graph_v2'):
            rec = cand
            break
    except Exception:
        continue
if rec is None:
    raise SystemExit('no complete run found')
run_id = rec['run']

clusters = rec['phases'].get('merge', {}).get('nodes', [])
divergent = rec['phases'].get('merge', {}).get('divergent_nodes', [])
critique = rec['phases'].get('refine', {}).get('added', [])
judge = rec['judge']
seeds = [s['seed'] for s in rec['phases']['seeds']['seeds']]

# cluster membership: label -> set of (sample, step_id)
# primary: merge nodes' own members; fallback: _g2_cache raw clusters (wave-64 receipts)
members = {}
for n in clusters:
    members[n['label']] = {(m.get('sample'), m.get('id')) for m in (n.get('members') or []) if isinstance(m, dict)}
if not any(members.values()):
    raw_clusters = (rec.get('_g2_cache') or {}).get('clusters', [])
    for c in raw_clusters:
        members[c.get('label')] = {(m.get('sample'), m.get('id')) for m in (c.get('members') or []) if isinstance(m, dict)}
# also collect cluster edges from per-sample graphs
def cluster_of(sample_i, sid):
    for lab, ms in members.items():
        if (sample_i, sid) in ms:
            return lab
    return None

raw_edges = []
for gi, g in enumerate(rec.get('graph_v1', [])):
    for e in g.get('edges', []):
        a, b = cluster_of(gi, e['from']), cluster_of(gi, e['to'])
        if a and b and a != b:
            raw_edges.append((a, b, e.get('p') or 0.5))
edge_agg = {}
for a, b, p in raw_edges:
    key = (a, b)
    edge_agg.setdefault(key, []).append(p)
cluster_edges = [(a, b, sum(ps) / len(ps), len(ps)) for (a, b), ps in edge_agg.items()]

n = len(clusters)
R = 175
pos = {}
for i, c in enumerate(clusters):
    ang = 2 * math.pi * i / max(n, 1) - math.pi / 2
    pos[c['label']] = (330 + R * math.cos(ang), 310 + R * math.sin(ang))

def esc(s):
    return (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def wrap(text, width=14, maxlines=3):
    words = (text or '').split()
    lines, cur = [], ''
    for w in words:
        if len(cur) + len(w) + 1 <= width:
            cur = (cur + ' ' + w).strip()
        else:
            lines.append(cur)
            cur = w
        if len(lines) == maxlines:
            break
    if cur and len(lines) < maxlines:
        lines.append(cur)
    return lines[:maxlines]

svg = []

# cluster->cluster edges (aggregated, width by count, opacity by p)
for a, b, p, cnt in cluster_edges:
    x1, y1 = pos[a]; x2, y2 = pos[b]
    svg.append(f'<line x1="{x1:.0f}" y1="{y1:.0f}" x2="{x2:.0f}" y2="{y2:.0f}" stroke="#58a6ff" stroke-width="{0.8 + 1.4 * cnt}" opacity="{0.25 + 0.45 * p}"/>')
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    svg.append(f'<circle cx="{mx:.0f}" cy="{my:.0f}" r="9" fill="#0d1117" stroke="#58a6ff" opacity="0.9"/>')
    svg.append(f'<text x="{mx:.0f}" y="{my + 3:.0f}" text-anchor="middle" font-size="7.5" fill="#79c0ff" font-family="monospace">{p:.2f}</text>')

# critique bridge stubs (from critique rows to their bridge cluster)
for a in critique:
    for b in (a.get('bridges') or []):
        if b in pos:
            cx, cy = pos[b]
            svg.append(f'<line x1="{cx:.0f}" y1="{cy:.0f}" x2="{cx:.0f}" y2="560" stroke="#d29922" stroke-width="1" stroke-dasharray="3 4" opacity="0.5"/>')
            break

def load_color(ml):
    if ml is None: return '#388bfd'
    t = min(max((ml - 1.0) / 2.0, 0), 1)
    r = int(56 + t * 180); g = int(139 - t * 60); b = int(253 - t * 120)
    return f'rgb({r},{g},{b})'

for c in clusters:
    x, y = pos[c['label']]
    rad = 30 + 9 * (max(c['occurrence'], 2) - 2)
    col = load_color(c['max_load'])
    lines = wrap(c['label'], width=13, maxlines=3)
    dy0 = -7 * (len(lines) - 1)
    svg.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rad}" fill="{col}" opacity="0.94" stroke="#0d1117" stroke-width="2"/>')
    svg.append(f'<text x="{x:.0f}" y="{y:.0f}" text-anchor="middle" dy="{dy0 + 3}" font-size="9.5" fill="#fff" font-family="monospace">' +
               ''.join(f'<tspan x="{x:.0f}" dy="{0 if k == 0 else 11}">{esc(ln)}</tspan>' for k, ln in enumerate(lines)) +
               '</text>')
    svg.append(f'<title>{esc(c["label"])}: {esc(c["text"])} (load {c["max_load"]})</title>')

# divergent routes: corner-anchored dashed boxes (no collisions)
corners = [(600, 40), (60, 40), (600, 200), (60, 200), (600, 460), (60, 460)]
for j, d in enumerate(divergent):
    x, y = corners[j % len(corners)]
    label = (d.get('label') or '')[:20]
    dl = wrap(label, width=16, maxlines=2)
    svg.append(f'<rect x="{x-88}" y="{y-6}" width="176" height="{16 * len(dl) + 10}" rx="7" fill="none" stroke="#7ee787" stroke-width="1.4" stroke-dasharray="5 3"/>')
    svg.append(f'<text x="{x}" y="{y + 11}" text-anchor="middle" font-size="9" fill="#7ee787" font-family="monospace">' +
               ''.join(f'<tspan x="{x}" dy="{0 if k == 0 else 12}">{esc(ln)}</tspan>' for k, ln in enumerate(dl)) +
               '</text>')
    svg.append(f'<title>divergent route (samples {d.get("samples")}): {esc(d.get("text"))}</title>')

crit_y = 575
for k, a in enumerate(critique):
    x = 75 + k * 122
    kind = a['kind']
    svg.append(f'<path d="M {x} {crit_y-12} L {x+12} {crit_y} L {x} {crit_y+12} L {x-12} {crit_y} Z" fill="#d29922" opacity="0.95"/>')
    svg.append(f'<text x="{x}" y="{crit_y + 26}" text-anchor="middle" font-size="8.5" fill="#d29922" font-family="monospace">{a["id"]} {esc(kind)}</text>')
    svg.append(f'<title>{kind}: {esc(a["text"])}</title>')

svg_body = '\n'.join(svg)
gaps_html = ''.join(f'<li>{esc(g)}</li>' for g in judge.get('gaps', []))
edges_legend = f'{len(cluster_edges)} cluster edges (p=mean typesafe dependency)'

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
<span class="tag">3 CoT samples</span><span class="tag">{len(clusters)} clusters</span><span class="tag">{len(divergent)} divergent routes</span><span class="tag">{len(critique)} critique cells</span><span class="tag">{edges_legend}</span></div>
<div class="card"><span class="score">{judge.get('score')}/10</span> <span>v4-pro self-judged thoroughness</span><br><i>{esc(judge.get('verdict') or '')}</i>
<ul class="gap">{gaps_html}</ul></div>
<svg width="660" height="640" viewBox="0 0 660 640">{svg_body}</svg>
<div class="card lg"><span style="color:#388bfd">●</span> cluster (size=occurrence, hue=load) <span style="color:#58a6ff">—</span> edge (width=count, opacity=p) <span style="color:#7ee787">□</span> divergent route <span style="color:#d29922">◆</span> critique cell — hover for full text</div>
<div class="card">cell signature — in: {{prompt, n_seeds, lenses}} · out: {{graph_v1, graph_v2, judge, receipts}} ·
clusters → value cells · edges → links with p as dial weight · judge.gaps → question-cells · critique nodes → next generation<br>
repo: github.com/SuperInstance/cot-quilt · erised playground: erised-mirror.pages.dev</div>
</body></html>"""

os.makedirs('/home/z/my-project/cf-deploy/cot-view', exist_ok=True)
with open('/home/z/my-project/cf-deploy/cot-view/index.html', 'w') as f:
    f.write(html)
print('viewer v2 written; run =', run_id, '| cluster_edges', len(cluster_edges), '| clusters', len(clusters), '| div', len(divergent), '| crit', len(critique))
