# sample 1 — lens: an engineer who wants the smallest mechanism that could work

## seed_requested
{"seed": 9, "bits16": "0000000000001001", "job_id": "cd7a9508-6ada-4670-9cab-49e9e985c98f", "source": "mothquantum/coin-toss-v1"}

## chain-of-thought

We need answer. Need think. User asks: "Lens: you are an engineer who wants the smallest mechanism that could work.

Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

We need craft answer. Need infer context? They want minimal local algorithm deciding which cell of cellular graph receives next unit of computation budget, given per-cell potential and resistance. Rule uses only cell and direct neighbors (no global). Explain fair and no starvation.

Need design. We need likely distributed scheduling/leader election among cells? Need decide next unit recipient locally based on potential/resistance. Need ensure fairness/no starvation. We need propose local algorithm. "smallest mechanism that could work." Maybe cellular automaton graph, each cell has potential and resistance values. Need select which cell receives next budget. Local only.

We need decide interpretation. Could be "given per-cell potential and resistance values" maybe potential indicates need/eligibility, resistance indicates cost. We need choose cell maximizing potential/resistance? Local algorithm? But if only local view, how choose global max? Could use token passing? "which cell of a cellular graph receives next unit" Maybe central? They ask local algorithm: use only cell and direct neighbors. Need fair and no starvation. Could be "each cell computes local score; if its score exceeds all neighbors, it claims budget; otherwise defers to neighbor with max score." This is like local maxima. But if budget awarded to local maxima? Multiple local maxima could receive simultaneously? "next unit" singular. Need avoid conflicts.

Maybe we can design token circulation. A token (budget unit) moves locally from cell to neighbor based on potentials/resistances. The cell holding token receives next unit? Wait "decides which cell receives next unit of computation budget" maybe each step one cell selected. Need local decision. "given per-cell potential and resistance values." Potential and resistance per cell. We can use a token that visits cells; at each step token at current cell, compares its own potential/resistance with neighbors, moves to neighbor with highest score, unless current is local max, then current receives budget and then updates potential/resistance? Hmm.

Need fairness and no starvation. Need minimal. Could be something like "random walk with bias to high potential / low resistance" using only local info. But fairness/no starvation? If deterministic and always move to best neighbor, may cycle? Or may starve.

Let's parse wording. "Lens: you are an engineer who wants the smallest mechanism that could work.

Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

This might be from some problem about "cellular graph" and "computation budget" maybe "cellular automaton" cells? Need decide "which cell receives next unit" based on potential and resistance. They want local algorithm. Fair and no starvation.

Could be asking for "minimal local algorithm" in context of "self-organizing compute allocation"? Need answer conceptually. Could design "token ring" with local handoff. Each cell has potential (urgency) and resistance (cost to serve). At each step, a token exists at one cell. The cell holding token receives budget? Or it decides next recipient? If token moves to neighbor with highest potential/resistance, then eventually? Starvation? Need prove.

Maybe use "round-robin among neighbors" with potential/resistance as modifiers. But "fair" maybe means each cell gets chance. "Cannot starve forever" if algorithm includes aging (potential increases while waiting) or local token passing around graph. Since graph connected? "cellular graph" likely connected. Need mention if disconnected, impossible to reach all; assume connected. Need local rule only direct neighbors.

What is minimal mechanism that guarantees no starvation? The simplest is a circulating token that visits cells in a deterministic local traversal (e.g., DFS/round-robin along edges). But if graph can be arbitrary, using only local info and no global view, deterministic traversal without memory may be impossible to visit all? Actually each cell can maintain small state: last neighbor served, or direction. Need visit all nodes fairly. There are local algorithms for distributed token circulation on graphs? A token can circulate via "round-robin" at each node: when token arrives, node sends it to next neighbor in a fixed cyclic order. This visits every node infinitely often on connected undirected graph? Let's check. If each node has a cyclic order of neighbors, token deterministic. Does it visit all nodes infinitely often? It is a finite state Markov chain; if graph connected, the state (current node, maybe previous neighbor?) The token movement depends on current node and incoming neighbor because node sends to next after incoming. State can be edge directed. Deterministic functional graph. Could have cycles that don't cover all nodes. Example path 1-2-3, each node order [left,right]? Token may oscillate 1-2? Let's simulate. Need define. At node, send to next neighbor after the one token came from in cyclic order. This is "rotor-router" with single rotor. On undirected graph, rotor-router walk? It may not visit all nodes? Rotor-router with one chip? Actually rotor-router on finite Eulerian graph, single chip eventually settles into Eulerian circuit covering all directed edges? I recall rotor-router: each vertex rotor cycles through neighbors; if chip arrives, advance rotor and send to new neighbor. On undirected graph, single chip may eventually traverse every directed edge in a periodic orbit? For finite graph with rotors, it is periodic. Does it visit all vertices? Not necessarily if initial rotor states? On connected undirected graph, the eventual periodic orbit may not cover entire graph? Let's test path 1-2-3. Rotor order at 1: [2]; at 2: [1,3]; at 3: [2]. Start token at 2, rotor at 2 points 1. Arrive at 2? Need simulate. If token at 2 initially, decide send to current rotor? Hmm.

If each node when token arrives sends to next neighbor in cyclic order, on path 1-2-3:
Start token at 2, state rotor at 2 maybe next=1. Send to 1. At 1 only neighbor 2 send to 2. At 2 next after 1 is 3 send to 3. At 3 send to 2. At 2 next after 3 is 1 send to 1. Then cycle 2-1-2-3-2-1... Visits all. Good.

Star graph center 0 leaves 1,2,3. If center cycles leaves, visits all. If leaf sends back. Good.

But arbitrary graph? Consider two cycles connected by a bridge. Token enters bridge, may cross back and forth? At bridge endpoints, rotor orders include bridge and internal neighbors. If at endpoint, when arrives from bridge, sends to next after bridge (internal). Eventually might go into that component, then return to bridge maybe? Since all edges eventually? I think rotor-router single chip on undirected graph is recurrent? Wait if graph has vertices of odd? Rotor-router on Eulerian graph with one chip is periodic and visits every vertex? I recall "for any finite connected graph and any initial rotor configuration, a single chip in rotor-router eventually settles into a periodic orbit that traverses every edge of the graph in both directions?" Is that true? Let's test graph with bridge: path 1-2-3, start token at 1. Rotor at 1 [2]; at 2 [1,3]; at 3 [2]. Start at 1, rotor at 1 next=2 -> send 2. At 2 next=1 -> send 1. At 1 next=2 -> send 2. At 2 next after 1 is 3 -> send 3. At 3 send 2. At 2 next after 3 is 1 -> send 1. At 1 send 2. At 2 next after 1 is 3 -> send 3... cycle: 1-2-1-2-3-2-1... visits all. Good.

Graph: two triangles connected by bridge. Could token get stuck oscillating bridge? Let's simulate? Endpoint A has bridge to B and two internal neighbors. Rotor order maybe [internal1, bridge, internal2] etc. If token arrives from bridge, sends to internal1. It may circle inside triangle and eventually return to A from internal2. At A next after internal2 is internal1? Wait order cyclic. Need track. It will eventually take bridge after two internal arrivals? Since rotor advances each visit. Internal triangle may return token to A via different internal edge. At A, each arrival advances rotor. It will eventually send bridge. So not stuck. Seems visits all.

But if we need decide "which cell receives next unit", we can have a token that circulates. The cell currently holding token receives the budget, then token moves to next neighbor according to a local round-robin rule. Potential/resistance can bias which neighbor is next (e.g., choose neighbor with highest potential/resistance among those not served recently), but fairness/no starvation then need careful. The simplest minimal mechanism that guarantees fairness/no starvation is a plain round-robin token around graph. But question explicitly says "given per-cell potential and resistance values" maybe we must use them. Maybe minimal algorithm uses potential/resistance to choose next recipient but must be fair/no starvation. Could incorporate them as priority but with aging. Need design.

Let's identify likely expected answer. They ask "Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

This sounds from a problem about "cellular automaton for resource allocation" maybe they want an algorithm like:
- Each cell has potential p_i (e.g., work available) and resistance r_i (e.g., cost).
- A cell becomes candidate if p_i/r_i >= p_j/r_j for all neighbors j.
- It then claims the budget and reduces its potential or increases resistance.
- Because after receiving budget, its potential drops or resistance rises, so it won't monopolize.
- Since ties broken deterministically, local maxima? But only local view cannot know global max. However any cell that is local maximum relative to neighbors could claim. Multiple local maxima could claim simultaneously, not "next unit" singular. Maybe if token? Hmm.

Maybe "cellular graph" maybe each cell is a processor and budget is a token. Need decide which cell gets next token. Local rule: each cell compares its "score" with neighbors. If it has highest score among itself and neighbors, it takes token. But if multiple local maxima, maybe they all take? Not allowed one unit. Could use randomized local algorithm: each cell with highest local score competes; but multiple.

Alternative: "smallest mechanism that could work" could be "each cell sends its claim to neighbor with higher potential; if none, it is winner." This is like hill-climbing to local maximum. But global maximum? If each cell only knows direct neighbors, a cell can route request toward increasing potential until local max. The local max receives budget. But multiple requests? The "next unit" could be decided by a token starting at some cell and moving uphill until a local maximum. That uses local info. Fairness? If potential/resistance are dynamic, local maxima change. But cannot guarantee no starvation unless potential increases for waiting cells. Could use "potential grows with waiting time" so any starved cell eventually becomes higher than neighbors, becomes local max, gets budget. This is a classic aging solution. Resistance maybe inverse priority. Algorithm:
- Each cell has potential P_i and resistance R_i. Define score S_i = P_i / R_i (or P_i - R_i).
- A budget token is either held by a cell? To allocate next unit: starting from arbitrary cell (or previous recipient), it moves to the neighbor with highest score if that neighbor's score exceeds current; otherwise current cell is local maximum and receives the unit.
- After receiving, set P_i=0 or decrease, R_i increase, and waiting cells increase P (or decrease R) over time.
But does this guarantee no starvation? If a cell waits, its potential increases. Eventually it may exceed neighbors, but could still be in a valley? Starting token from previous recipient may not traverse to it if it's not on path of steepest ascent? Wait algorithm moves from current to highest-score neighbor if higher. This only finds local maxima. If starved cell becomes local max relative to neighbors, a token starting somewhere may not reach it unless it's in basin. If token starts from previous recipient, could be elsewhere. It won't necessarily visit all local maxima. Need a local traversal that visits all cells. Could combine token circulation with priority: token visits cells in round-robin; at each visit, cell receives budget if its potential/resistance is high enough? Hmm.

If we need "decides which cell receives next unit" globally, but local only, maybe use a token that walks around graph. The token itself is the global "next unit" being allocated. It moves to a neighbor according to local potentials/resistances. The cell that finally stops (local maximum) receives it. Fairness/no starvation? If potential increases for cells not served, then every cell eventually becomes a local maximum; but token must reach it. If token movement is not guaranteed to visit all cells, starvation possible. Use a simple fair traversal (e.g., round-robin) to ensure all cells are considered. At each cell, if its potential/resistance score is above a threshold, it takes budget; otherwise token passes. But threshold? Need local.

Maybe design minimal that guarantees no starvation: a token circulates round-robin to every cell. At each visit, the cell receives budget iff its potential exceeds resistance? Or if its local score is highest among neighbors? Wait if token simply gives budget to current cell every time, then fair round-robin. Potential/resistance ignored. But question says "given per-cell potential and resistance values" likely expects use them. Could use them to alter order but maintain fairness by ensuring every cell in cycle gets eventually. For example, each cell maintains a local queue of pending units? The token visits cells; when at a cell, if its potential/resistance score is above a threshold or if it has waited too long, it receives budget and updates its state. Otherwise it forwards token to neighbor with highest need. But to prevent starvation, each cell has an aging counter; if it hasn't received for T steps, it demands token. But T local? Need global bound? Could use token's visit count? Cell can count time since last service locally (it knows if token visited? It only sees direct neighbors; but if token not visiting, it doesn't know global time unless each cell has local clock). Cellular graph cells can have local state and update on token arrival? They might not have global clock. But "given per-cell potential and resistance values" maybe potential increases by itself over time. If potential is urgency, waiting increases potential. That is local.

Minimal local algorithm with fairness: Token circulates deterministically around connected graph via local round-robin. When token visits a cell, that cell is eligible for budget. To account for potential/resistance, we can let the cell "skip" its turn if its score is low compared to neighbors? But then not fair. Or let token move to neighbor with highest score but every edge is eventually traversed due to round-robin tie-breaking. E.g., at each step, token at cell i chooses next neighbor j among neighbors not chosen recently? Actually to guarantee all cells visited, use local round-robin independent of potentials. Potential/resistance can decide whether current cell receives budget or passes it? Hmm.

Maybe there is a known algorithm: "greedy local algorithm for fair allocation in cellular graph": Each cell computes a priority p_i/r_i. A cell gets budget if its priority is greater than all neighbors' priorities; otherwise it forwards the budget token to the neighbor with highest priority. After receiving, its potential is reduced. This is like "self-stabilizing maximal independent set" or "local maxima". Fairness? Because potentials are monotonic: if a cell is not served, its potential increases until it becomes a local maximum; then it will receive. But again reachability.

Let's search memory. There is a concept "cellular automaton for graph coloring?" Not.

Maybe the problem is from an "AI engineer" interview? They ask "Lens: you are an engineer who wants the smallest mechanism that could work." It asks design minimal local algorithm decides which cell of cellular graph receives next unit of computation budget, given per-cell potential and resistance values. Rule must use only cell and direct neighbors (no global view). Explain fair and cannot starve forever.

This sounds like they want "a token ring with local priority based on potential/resistance." The "smallest mechanism" might be: Each cell has a token? No.

Let's consider possible formalization. We have a connected graph. There is a single "computation budget" unit to allocate repeatedly. Each cell has potential p_i (maybe amount of work it can do) and resistance r_i (maybe cost). We need choose one cell each round. Local algorithm: each cell knows p and r of itself and neighbors. It can send messages to neighbors? We need decide recipient. A simple local rule: each cell calculates "pressure" = p_i / r_i. If its pressure is at least that of all neighbors, it sends a request to all neighbors? Or it becomes a candidate. Then among candidates? Need one. Could use random competition: each local maximum sends a token to neighbor with higher pressure? Actually if no higher neighbor, it's a local maximum. If multiple, they may all think they should get. To pick one, maybe each local maximum waits for neighbor responses? But no global.

Maybe the "next unit" could be decided by a token that starts at some cell and moves to the neighbor with maximum potential/resistance until no neighbor has higher. That cell receives. This is local and singular. Fairness can be achieved by after receiving, its potential decreases or resistance increases, so it won't be local max for long; and if a cell starves, its potential grows, eventually it becomes local max. But as noted, token may not reach it. However if token starts at previous recipient and moves uphill, it may get stuck in a different local max. But if potentials change monotonically, the starved cell's potential grows without bound until it exceeds all others; then it becomes global maximum, and any uphill path from anywhere eventually reaches it? Wait if its potential exceeds all others, then along any path from token, there is a neighbor with higher potential? Not necessarily if token is in a local basin? If starved cell has highest potential globally, then from any cell, following increasing potential cannot get stuck before reaching it? Actually if starved cell is global maximum, then any local maximum other than it impossible because its potential lower than starved cell but higher than neighbors. But path from token to starved cell: at each step, choose neighbor with highest potential. This is steepest ascent. Does it always reach global maximum? Not necessarily in arbitrary graph, steepest ascent can get stuck at local maximum. But if starved cell is global maximum, there can still be local maxima? A local maximum is a node whose potential is >= all neighbors. It can be less than global maximum elsewhere. Yes, local maxima are possible. Steepest ascent from token may stop at a local max that is not global max. The starved cell may not be reached. So potential growing unbounded doesn't guarantee if token not in its basin. But if starved cell's potential grows until it exceeds all cells, then it is global max. But local maxima still exist? If a node has all neighbors lower than itself, it is local max even if global max elsewhere. So token can get stuck at local max. However if potential of starved cell increases unbounded, eventually it may dominate, but token may never enter its basin. To guarantee, need token traverse all cells, not just steepest ascent.

Could use token moves to neighbor with highest potential among all neighbors but with tie-breaking that cycles. If starved cell's potential grows unbounded, then eventually it will attract token from its neighbor. But token may not reach that neighbor if stuck elsewhere. If every local round-robin still moves along edges, eventually it may visit all nodes. So combine.

Maybe simplest fair algorithm: token performs a deterministic depth-first traversal of the graph using local memory: each cell remembers which neighbor sent token last and forwards it to the next neighbor in a fixed cyclic order. This guarantees every cell visited infinitely often on connected graph. When token visits a cell, that cell receives the next unit. This uses no potential/resistance. To incorporate potential/resistance, we can let the token visit cells, but the cell only receives if its "priority" is above a local threshold? Hmm.

Maybe we can design: Token circulates round-robin. At each cell, if its potential/resistance score is at least as high as that of all neighbors, it receives the budget; otherwise it passes the token to the next neighbor in round-robin. But if a cell has low score, it may never receive even when token visits. But if potential increases while waiting, eventually it will be local maximum and receive. Since token visits all cells infinitely often, once its score becomes local max (or just above some neighbor? Actually condition local max among neighbors), when token visits it, it receives. This guarantees no starvation: increase potential when not receiving. But if cell is not local max because neighbor also increasing? If all waiting cells increase, a cell might never be local max? Suppose two adjacent cells both not served; both potentials increase equally. Tie? Need tie-breaking or resistance. If condition requires strictly greater than all neighbors, tie can prevent. Use "at least as high as all neighbors" and tie-break by unique ID? But local max with ties can be multiple. If token at cell, it can receive if its score is >= neighbors; ties allow many. But if adjacent both tie, both would receive when visited, which is okay for fairness? But might be unfair if high-frequency? Token round-robin ensures each visited. If both receive each visit, still fair. But if we want use potential/resistance to prioritize, ties okay. However if a cell has a neighbor with higher score that also never served? The lower cell waits, potential increases. Eventually it may exceed neighbor, unless neighbor also increases. If both not served, both increase. Relative order may stay. But token visits both; if condition is "highest among neighbors", the higher one receives, then its potential resets/decreases, allowing the lower to become highest. So no starvation. Good.

But if token visits a cell and it doesn't receive because neighbor has higher score, it just passes. The neighbor might receive when token reaches it. Since token visits all, higher neighbor will get chance. If higher neighbor receives, its score decreases, so the first can later receive. This is like local max with aging. Fair? Need prove.

Alternatively, simpler: At each token visit to cell i, it receives if p_i/r_i >= p_j/r_j for all neighbors j. If it receives, reset p_i (or increase r_i). If not, it increases its potential (or decreases resistance) to express waiting. Token then moves to next neighbor in fixed cyclic order. This uses only local info. Fairness: token visits every cell infinitely often (round-robin on connected graph). Each cell's potential increases while it is not receiving. A cell can be blocked only by a neighbor with higher score. But that neighbor, when it receives, drops its score. If multiple neighbors block, each will eventually receive and drop. So eventually the cell's score becomes maximal among its neighbors; at its next token visit it receives. Thus no infinite starvation. Need be careful: if blocked by neighbor that also is blocked and increases? But if neighbor receives eventually, drops. If neighbor never receives, then it also increases; but token visits neighbor; if its score is maximal among its neighbors, it receives. If it is blocked by another, chain. Could there be an infinite chain of blocking where no one receives? Since finite graph, there's at least one local maximum among current scores (or tie). Token visits it eventually, so it receives. Then its score drops. So progress. This is similar to local greedy with aging. But if token only visits one cell at a time and condition local max, eventually some local max receives. But the cell with global max might not be local max? Global max is local max. So at least one. Token visits all, so will visit some local max eventually? Wait token visits all cells infinitely often. If there is a local max, token will eventually visit it. It will receive. So progress. But what if the local max is not the starved cell; it receives and drops, another local max appears. Eventually starved cell may become local max if its potential increases. But could there always be another neighbor that receives more often and keeps score high? If neighbor receives, its score drops, so not forever. Good.

This seems a solid local algorithm: token circulation + local priority test + aging. Minimal mechanism: a single token and a local round-robin pointer per cell. Potential/resistance used as score; waiting increases potential (or decreases resistance). The cell that receives budget is the one currently holding token if it is a local maximum in score (>= all neighbors); otherwise token moves on. But wait if current cell not local max, it passes token. The token moves to next neighbor in round-robin. This means the token might pass through non-recipients. The recipient is a local max when token visits. Fairness: round-robin ensures every cell gets token visits. Aging ensures eventually local max.

But is this the "smallest mechanism that could work"? Maybe even smaller: token always goes to neighbor with highest score; if none higher, current receives. Aging ensures no starvation? But reachability issue. The round-robin pointer adds minimal local memory. The user asks "rule must use only a cell and its direct neighbors (no global view)." A token and local round-robin uses only direct neighbors. Potential/resistance included.

Need decide final answer. We should present algorithm clearly. Maybe mention assumptions: connected undirected graph, one token/budget at a time, cells can maintain local state (token presence, last-neighbor pointer, age/potential). Resistance: use score = potential / resistance (or potential - resistance). Higher potential means more need; higher resistance means less attractive. If resistance is cost, use potential/resistance. If resistance is tolerance? Could be inverse.

Need explain fairness. "Fair" could mean each eligible cell receives a positive fraction of budget over time, or no cell is permanently ignored. Our algorithm is fair in no-starvation sense. It may favor high potential/low resistance cells, but aging ensures every cell eventually wins. We can define fairness as: over any sufficiently long interval, every cell receives at least one unit. If we want bounded fairness, need global bounds maybe not possible without global view. But no starvation forever is possible.

Need ensure local rule. Detailed algorithm:
1. Each cell i stores potential P_i, resistance R_i, and a pointer last_i to a neighbor (or phase). Define priority S_i = P_i / R_i (R_i>0). Optionally S_i = P_i - R_i.
2. There is a single budget token. It resides at some cell. When token is at cell i:
   - Compare S_i with S_j for all direct neighbors j.
   - If S_i >= max_{j in N(i)} S_j (with deterministic tie-break, e.g., lower ID or token direction), then i receives the next unit. Update:
        P_i = max(0, P_i - 1) or P_i = 0;
        R_i = R_i + 1 or leave? (resistance increases to reduce future priority)
     Then move token to next neighbor according to local round-robin pointer.
   - Else, i does not receive. Increase its age: P_i = P_i + 1 (or R_i = max(0, R_i - 1)). Move token to next neighbor in round-robin.
But wait if i doesn't receive, it increases potential even though it just had token visit. Is that "waiting" or "not receiving"? Yes. But if it receives, reset. The token moves to next neighbor. This is local. However, if cell i is not local max, it increases potential. But if it is local max, it receives and resets. What about cells not visited by token? They should also age. The rule says use only cell and direct neighbors; can a cell update when not visited? In cellular automata, all cells update synchronously each step. But token visits one per step. We can let all cells increase P_i by 1 each time step if they don't receive. But they don't know if they receive? They do if token at them and condition. But they can have local clock. The rule uses only local info. That's fine. To keep minimal, each cell increments its age every round; if it receives, reset to zero. But if they don't have global synchronization, can just increment when token passes? A starved cell might not see token if token passes elsewhere? Actually token eventually visits all. But if it doesn't visit for long, potential should increase. If cells only update on token visit, then a cell not visited doesn't age. But token visits all infinitely, so it will age on each visit. But if it is skipped (token not at it), it doesn't increase. That might still be enough if token visits all. However, between visits, other cells receive; the skipped cell's relative priority decreases? It doesn't age while not visited. But token visits all, so every cell gets visits. If it fails at visit, it increases. Could still eventually. But if token visits a cell often but it fails, it increases each visit. If token visits another cell less often, that other might starve? Round-robin ensures equal visit rates. So aging on visit is okay.

But if token at i and i not local max, it increases P_i. Then moves to next. Suppose neighbor j has higher P. When token reaches j, j receives and resets. Then i may become local max next visit. Good.

Need handle multiple local maxima. If token at i and i is local max, it receives. Then moves on. If there is another local max elsewhere, it will receive when token visits it. So both get budget. Fair.

But what if a cell is not local max because a neighbor has higher score, but that neighbor is also not local max because another has higher, etc. Finite graph, there is a local maximum along chain. Token visits it eventually. It receives. So the chain's blocking score drops. Eventually all.

Need prove no starvation formally:
- Assume graph connected and token follows local round-robin that visits every cell infinitely often. Need prove round-robin token visits every cell infinitely often. Is that always true? As earlier, rotor-router with single token on connected undirected graph may eventually enter a cycle. Does it visit every cell? I need be sure. Let's analyze. The local round-robin rule: At each cell, maintain a cyclic order of incident edges. When token arrives from neighbor prev (or starts), it leaves via the next edge after prev in the cyclic order. This is exactly a rotor-router walk with one chip and rotors at vertices. I recall for any finite connected undirected graph, the rotor-router walk is eventually periodic and the period traverses every directed edge? Wait there is a known theorem: For a single chip in rotor-router aggregation, if graph is finite, the chip eventually settles into a cycle. Is it an Eulerian tour of the graph? Let's test a graph where it might not visit all vertices. Consider two cycles connected by a bridge. I can simulate to see. Let's formalize state: For each vertex, a rotor points to a neighbor; when chip leaves v, it advances rotor to next neighbor in cyclic order, then sends chip to new rotor direction. The chip arrival at v may be from some neighbor; but the rotor's next direction depends only on current rotor, not incoming. The incoming neighbor is just previous location. Actually the rule "next after the one token came from" is equivalent to if rotor at v points to the neighbor that the token came from? Not exactly. In rotor-router, when chip arrives at v, the rotor at v is advanced, and chip moves to new rotor direction. The rotor does not depend on incoming except that the previous move from v was to the neighbor where chip came from? If the chip came from u to v, then last time chip left v, it went to u. But rotor may have advanced elsewhere? Actually if chip visits v, it leaves to some neighbor. Next time it arrives at v from that neighbor (because it left to it). So the incoming neighbor is exactly the last direction the rotor pointed from v. Then the rule "send to next neighbor after incoming" is same as advancing rotor. Yes.

So it's rotor-router single chip. What is eventual behavior? I remember: On a finite Eulerian digraph, a single chip in rotor-router eventually reaches a recurrent state and then moves periodically. The period may be a directed cycle that traverses each directed edge of some Eulerian subgraph? For undirected graph, is it guaranteed to visit all vertices? Let's test a counterexample. Consider graph: a square with a tail? Let's simulate mentally.

Graph: 0 connected to 1,2; 1 connected to 0,2; 2 connected to 1,0? That's triangle. Add leaf 3 attached to 0. Rotor orders:
0: neighbors [1,2,3] cyclic.
1: [0,2]? 
2: [0,1]?
3: [0].
Start token at 0, rotor at 0 points 1. Send to 1.
At 1 rotor maybe points 0. Send to 0.
At 0 rotor next after 1 is 2. Send to 2.
At 2 rotor points 0. Send to 0.
At 0 next after 2 is 3. Send to 3.
At 3 send to 0.
At 0 next after 3 is 1. Send to 1.
At 1 next after 0 is 2. Send to 2.
At 2 next after 0 is 1. Send to 1.
At 1 next after 2 is 0. Send to 0.
At 0 next after 1 is 2. etc. Visits all. Good.

Try graph with two triangles connected by a single bridge. Let A in triangle1 connected to B in triangle2 via bridge. Suppose at A rotor order [internal1, bridge, internal2]. At B order [internal1, bridge, internal2]. Token might go into triangle1, cycle, return to A from internal2. At A next after internal2 is internal1 (if cyclic order internal1, bridge, internal2, then after internal2 -> internal1). It goes internal1, not bridge. Next return from internal1? Let's simulate triangle A-C-D. A neighbors C, B(bridge), D in order [C,B,D]. Token at A, rotor next C -> C. C neighbors A,D. C rotor maybe A -> A. At A came from C, next after C is B -> bridge. So it does cross after one internal. Hmm.

Could there be a subset that traps token? Consider graph with two components connected by a bridge. For token to cross bridge, at bridge endpoint it must choose bridge. The rotor cycles through all neighbors, so it will choose bridge infinitely often if it visits endpoint infinitely often. But if token never returns to endpoint, then no. Could token get trapped in one component and never return to bridge? If it enters a subgraph that is a cycle attached only via bridge, to not return to bridge, it must never hit the attachment vertex. But the attachment vertex is the only entry/exit. If token enters the subgraph through attachment, to stay inside it must eventually return to attachment to leave; but if it never leaves, it may cycle inside without hitting attachment? In a connected subgraph, a walk that never hits the attachment vertex is possible if the attachment vertex is not needed. Example: bridge connects to a vertex A that has a self-contained cycle not including A? Wait A is in subgraph. If token enters A, then moves to neighbor C in subgraph. If subgraph minus A has a cycle, token could circulate in that cycle without returning to A? But to enter that cycle, it must pass through some vertices. Could it never return to A? It can cycle among C-D-E-C if that cycle is connected to A only via C? Actually if A connects to C, and C-D-E-C is a cycle, token at C could go D-E-C-D-E... never A if rotor at C keeps sending to D/E? But rotor at C advances each visit. It has neighbors A,D,E. If token arrives at C from D, next might be E; from E, next might be A; from A, next D; etc. It will eventually send to A because rotor cycles. To avoid A, C must never visit C? But it visits C in cycle. Rotor at C advances, so after finite visits it will choose A. Thus it cannot be trapped forever. So rotor-router likely visits all vertices.

Known result: Rotor-router walk on finite connected undirected graph: from any initial configuration, the chip eventually settles into a periodic orbit that visits every vertex? Let's verify. I recall a theorem: For rotor-router on a finite Eulerian graph, the chip eventually reaches an Eulerian circuit of the graph, i.e., traverses every directed edge exactly once per period. For non-Eulerian? Undirected graph is Eulerian if all degrees even? Actually undirected graph considered as directed both directions has even in/out at each vertex, so Eulerian directed graph. Yes, each vertex has outdegree = degree, indegree = degree. So the directed graph is Eulerian. The rotor-router single chip on an Eulerian digraph eventually enters an Eulerian circuit? I think yes: The eventual periodic orbit is an Eulerian circuit of the directed graph. Thus it visits every vertex infinitely often. Good. So local round-robin token visits every cell infinitely often on connected graph. We can state this simpler: Use a deterministic DFS token with per-cell memory of last neighbor; on a connected graph this token eventually visits every cell infinitely often. To avoid needing to prove rotor-router theorem, we can propose a simpler local traversal that obviously visits all? Is there a simple local algorithm using only direct neighbors that guarantees visiting all nodes infinitely often without global view? A token with stack? But stack is not local? Each cell can maintain a pointer. The rotor-router is simple and known. But maybe for an answer, we can just say "a token circulates by local round-robin; since the graph is connected and each cell cycles through its neighbors, the token visits every cell infinitely often." That's acceptable if we don't need rigorous proof. But is it always true? Yes for rotor-router on undirected connected graph. We can mention "standard rotor-router walk" or "local round-robin." If concerned, we can design a simpler local traversal with a spanning tree? But to build spanning tree needs global? No.

Alternatively, use random walk. A random walk on a connected graph visits every node infinitely often almost surely. This is local: at each step, token moves to a uniformly random neighbor. But fairness/no starvation? With probability 1, eventually visits all. But deterministic guarantee? Randomness can starve with probability 0? "Cannot starve forever" almost surely, not deterministic. The question likely wants deterministic. Random walk uses only local and is minimal. But "fair" maybe probabilistic? No starvation forever with probability 1. But they ask "cannot starve a cell forever" likely deterministic. A random walk is simpler than rotor-router. But if random, there's a nonzero probability (though zero for infinite) of long starvation. "Cannot starve forever" means probability 1. But engineer wants smallest mechanism; random walk might be even smaller: token flips coin to choose neighbor. But fairness in expectation? However it doesn't use potential/resistance. Could bias by potential/resistance. But no deterministic guarantee.

Maybe the expected answer is "a token walks to neighbor with highest potential/resistance, and after visiting, its potential decreases; because every cell has a chance to become local maximum, no starvation." But as discussed, token may not visit. But if token uses random walk, it will visit. Potential/resistance can bias random walk. Fairness: random walk visits all; aging ensures high potential eventually. This is local and simple. Let's consider.

Algorithm: Token performs a biased random walk. At cell i, compute score S_i = P_i / R_i. Compare with neighbors. If S_i >= max neighbors, i receives budget; else token moves to neighbor with probability proportional to S_j (or highest). After receiving, P_i decreases. Waiting cells increase P. Because random walk on connected graph is recurrent, every cell is visited infinitely often. When a cell's potential grows enough, it will be local max and receive when visited. Thus no starvation almost surely. This uses only local info. But "fair" maybe probabilistic. The question says "cannot starve a cell forever" not "almost surely". Hmm.

Maybe we can combine deterministic rotor-router with local priority. That gives deterministic no starvation. Let's build answer around that. It uses potential/resistance. It is minimal: one token, one pointer per cell, one age counter. No global view.

Need define "potential" and "resistance". Maybe potential could be "work waiting" and resistance "cost to execute". The priority is potential / resistance. Higher potential or lower resistance means cell should be selected. If resistance is like electrical resistance, current flows to low resistance; potential difference drives. Maybe selection score = potential / resistance. If resistance is high, less likely. We can use "conductance" = potential / resistance. Or if resistance is "how much it resists receiving", then score = potential - resistance. We can state any monotone local score; e.g., S_i = P_i / R_i. The algorithm doesn't depend on exact form as long as higher is more eager.

Need ensure fairness: If a cell is not served, increase its potential or decrease resistance. This is aging. The local rule: at token visit, if S_i >= S_j for all neighbors, it gets budget. Otherwise token moves on. Since token visits all cells, every cell gets infinite opportunities. Suppose cell i starved forever. Then its potential grows unbounded (or resistance falls). But its neighbors may also grow. However, if all cells in a blocked set grow, there is at least one local maximum in that set. That local maximum when visited receives and resets. Thus the maximum potential in the set cannot keep growing without service. More formal: consider the set of cells that have never been served after some time? Actually no starvation proof by contradiction:
Assume cell i never receives after time T. Then P_i increases without bound. Consider the connected component? Since graph finite, there is a cell with maximum potential among all cells. That cell is a local maximum (or tie). The token visits it infinitely often, so it will receive when visited (if tie-break allows). Thus some cell receives. But this doesn't directly prove i receives. However, if i never receives, its potential grows unbounded. Eventually it exceeds all other cells. Then i is global maximum, hence local maximum. Token visits i infinitely often, so it must receive when visited. Contradiction. This is simple! Wait if i's potential grows unbounded while others are bounded? But others may also grow unbounded if they never receive? But if i never receives, it increases every step/visit. Other cells may receive and reset, so their potentials are bounded by their waiting time since last service. If they also never receive, they also grow. But if i grows faster? If all non-served grow equally, i may not exceed. But consider a cell that receives, resets. If i never receives, over long time, its potential is at least number of visits since T. Other cells that receive have potential reset to low. Cells that never receive also grow. But there must be at least one cell that receives infinitely often? Not necessarily; could all cells starve? Token visits local maxima and they receive, so at least one receives each time token at local max. But could a set of cells never receive and all grow unbounded, with one of them being local max and should receive when visited. If it never receives, contradiction because when it is local max and visited, it would receive. So no cell can be local max and visited without receiving. If a cell never receives, it can never be local max at a visit. But if its potential grows unbounded, eventually it must be higher than all neighbors? Not if all neighbors grow unbounded too. But among a finite set of cells that never receive, there must be one that is local max relative to that set but may have a neighbor outside set with even higher potential? Outside set might receive and reset, so bounded. Actually if outside set receives, its potential bounded. So eventually the never-receiving set's potentials exceed outside neighbors. Within the never-receiving set, there is a local maximum (consider induced subgraph). That cell's potential is >= all neighbors in set and > outside neighbors (eventually). So it becomes local max in whole graph. Token visits it, so it receives. Contradiction to never receives. Thus no nonempty set of never-receiving cells. This proves no starvation if potentials of never-receiving cells grow unbounded relative to receiving cells. If all cells never receive, then any local max receives, contradiction. So at least some receive. Then eventually all.

This proof works if potentials increase without bound for cells that don't receive, and reset/decrease for those that do. If a cell receives, its potential drops. So a cell that never receives has potential increasing. Even if all never receive, finite graph has local max that receives when visited, contradiction. Wait if all never receive, then no one receives, but token at some local max would receive because condition. So impossible. Thus at least one receives. Then by induction? Suppose set S of cells that never receive after some time. If nonempty, all in S have potentials growing. Outside S receive infinitely often? They may also starve? But S is exactly never receive after T, so outside may receive finite or infinite. If outside receive infinitely often, their potentials reset. If outside receive finitely, they are in S? Actually S = cells that never receive after T. Outside S may receive at least once after T, but not necessarily infinitely. If a cell receives only finitely after T, it is not in S? It never receives after some later T'. We can take T large enough so S is cells that never receive after T. Then outside S receive infinitely often? Not necessarily; some may receive finitely many times after T, then never again. But we can choose T after all their last receive. Since countably finite? There may be cells with infinitely many receives. So outside S can be partitioned into finitely-receiving and infinitely-receiving. Cells with finitely many receives eventually join S if we take T larger. So after a sufficiently large T, S is exactly cells that never receive from then on, and outside S receive infinitely often (or at least infinitely? Actually if a cell receives finitely many, after its last receive it never receives, so it's in S. So outside S receive infinitely often). Thus outside S have bounded potentials (since they reset infinitely often, but between resets could be long; not bounded if gaps grow. But if they receive infinitely often, their potential may still grow unbounded if gaps unbounded. However, if a cell in S grows, it may force service. Hmm.

Simpler proof: At any time, among all cells, the one with maximum score (tie-break) is a local maximum. When token visits it, it will receive. Since token visits all cells infinitely often, the maximum-score cell will eventually receive? Wait the maximum-score cell may change. But at any moment, the global maximum is local max. Token visits it eventually if it remains maximum. But if before token reaches it, another cell exceeds it? The maximum can change. But the cell that is maximum at time t might not be visited before it loses max. However, consider the cell that actually receives: it must be local max at visit. Does this guarantee progress? Yes.

To prove no starvation: Assume cell i never receives. Then its score S_i grows without bound (if aging monotonic and no reset). Consider the sequence of times when token visits i. At each such visit, since i does not receive, there is a neighbor j with S_j > S_i (or tie-break beats it). Thus for i to never receive, at each visit at least one neighbor has higher score. Since finite neighbors, there is a neighbor j that has higher score at infinitely many such visits. If j receives infinitely often, its score resets, so cannot always be higher as S_i grows unbounded? Actually j might receive between visits and reset, but at the moment of i's visit it could have higher score if it has been waiting long. But if j receives infinitely often, its score just before reset could be high. Could it always be higher than i's unbounded score? If i's score grows unbounded, j's score between resets is bounded by the maximum gap between j's receives. If j receives infinitely often, gaps could grow unbounded, so j's score could also grow unbounded. But if j receives, it resets. If gaps grow, j may starve longer and longer but still infinite. Could there be an infinite chain where i never receives because j always higher, j never receives because k always higher, etc.? Finite graph, eventually cycle. A cycle of blocking would imply each has higher than previous, impossible unless scores increase around cycle. With ties, maybe. But if each in cycle never receives, their scores grow. They can't all be higher than each other in a cycle. At least one in the cycle is local maximum within the set and may have outside lower. That one would receive when visited. So contradiction. This is the local max argument.

We can present a simpler intuitive proof: Because the token visits every cell infinitely often, any cell that is not chosen must have a neighbor with a strictly higher score. Following this "higher neighbor" chain must end at a local maximum. The local maximum is chosen when the token reaches it, and then its score is reduced. Thus no cell can be eternally blocked: if it were, its score would keep rising while the scores of blockers are periodically reduced, so eventually it becomes the local maximum and is chosen. This is acceptable.

Need decide exact algorithm steps. Let's outline:

Assumptions:
- Graph is connected, undirected (or strongly connected if directed). If disconnected, only reachable component can be served; no local algorithm can serve unreachable cells.
- One budget token at a time. Cells can store small local state.
- Resistance R_i > 0. Potential P_i >= 0. Define priority S_i = P_i / R_i (or any monotone local score). Higher S means more deserving.

Algorithm (minimal local):
1. Token circulates deterministically by local round-robin: each cell keeps a pointer to the next neighbor after the one from which the token arrived (or simply cycles through its neighbor list). This makes token visit every cell infinitely often on connected graph.
2. When token is at cell i, i checks only its neighbors:
   - It computes S_i = P_i / R_i.
   - It compares S_i with S_j for j in N(i).
   - If S_i is maximal among its neighbors (with a fixed tie-break, e.g., smallest ID or token order), then i receives the unit.
   - Otherwise i passes the token onward.
3. If i receives:
   - P_i := P_i - 1 (or 0)
   - R_i := R_i + 1 (or leave; increasing resistance reduces future priority)
   - reset its waiting age.
   If i does not receive:
   - P_i := P_i + 1 (aging) or R_i := max(1, R_i - 1).
   (Optionally all cells age each round; then reset on receive.)
4. Token moves to next neighbor according to local round-robin.

But wait: If token at i and i is local max, it receives. Then we move token to next neighbor. If i is not local max, it passes. But what about a cell that is local max but token is not at it? It waits. That's fine. Token will eventually visit it. But if it receives, it resets. If token at i and i is local max, it receives. But could it receive too often? Suppose token visits i every cycle. If i remains local max because neighbors have low scores, it will receive every time token visits. That might be unfair to neighbors. But if neighbors are not local max, they might never receive? Let's test. Star graph center 0 with leaves 1,2,3. Potential all 1, resistance all 1. Token round-robin. At center, score 1. Leaves score 1. Tie-break? If center has tie-break over leaves, center is local max (>= all). When token at center, center receives every time. Leaves when token at leaf: leaf compares with center. If center score reset to 0 after receive, leaf score 1 > center, so leaf receives. Then its score resets. Center may have score 0, so leaves can receive. Good. But if center receives at every visit, its score resets to 0, so leaves become local max. So fair. If center not reset, would starve. So update is crucial.

What if tie-break causes center to always beat leaves when equal. After center receives, center score 0. Leaves score 1. So leaves beat center. So they receive. Good.

But consider two adjacent cells with no other neighbors. Token alternates. P1=P2=1. At 1, compare with 2. If tie-break 1>2, 1 receives, P1=0, R1+1. At 2, score 1 > 0, receives, P2=0. Then both 0. Next at 1, tie-break 1>2, receives. So they alternate? Actually after both reset, next at 1 receives, then at 2 receives. Fair. If tie-break always 1>2, at 1 receives, P1=0. At 2, P2=1 >0, receives. Then P2=0. At 1, P1=0, P2=0, tie-break 1>2, 1 receives. So yes alternating but with 1 getting extra when equal? Sequence: 1,2,1,2... after initial? Let's simulate: Start P1=1,P2=1. Token at 1: 1 receives -> P1=0. Token at 2: compare P2=1 vs P1=0 -> 2 receives -> P2=0. Token at 1: compare P1=0 vs P2=0, tie-break 1>2 -> 1 receives -> P1=0. Token at 2: P2=0 vs P1=0, tie-break? 1>2, so 2 is not >1. If condition is S_i >= max, tie-break? Need define. If tie-break global ID, at 2, S2=0, S1=0. If tie-break says lower ID wins, 2 does not win because 1 has same score and lower ID. Then 2 would never receive! Ah! Need careful. We need tie-break that is local and fair, or use aging so scores differ. If we use condition "S_i >= all neighbors" without tie-break, then both 1 and 2 are local maxima when equal. At token at 2, it would receive because S2 >= S1 (equal). So both receive when visited. That is fair. If we use strict tie-break, could starve equal-score cells. So use non-strict: i receives if S_i >= S_j for all neighbors. Then if tie, any visited cell with max score receives. This means multiple cells can be "local max" but only the one with token receives. Fair because token visits all. In the two-cell example: both equal, at 1 receives, P1=0. At 2, P2=1 >0 receives. At 1, both 0, S1>=S2, receives. At 2, both 0? Wait after 1 receives at step 3, P1=0 (already 0), P2=0. Step 4 at 2: S2=0 >= S1=0, so 2 receives. So both receive every visit. Fair.

But if a cell receives and we decrease P, it might not decrease if already 0? We should increase resistance or reset age so it doesn't immediately dominate ties. Or set P_i=0 and R_i++ so S_i decreases. If both P=0, S=0. Ties still allow. But if cell 2 receives every visit, is that unfair? Token alternates, so both get every other. Fine.

However, if a cell has high resistance, S=0. Ties with others at 0. Any cell with token and S>=neighbors receives. That means if all cells starved to 0, every visited cell receives. That's fair (round-robin). But then potential/resistance doesn't prioritize. That's okay.

But if we use "S_i >= all neighbors" and token at i, i receives whenever it is a local maximum (including tie). If i is not local max, it passes. Could there be a cell that is never local max because neighbor always has strictly higher? Aging increases its S. If neighbor receives, S drops. So eventually. Good.

But consider a cell with very high resistance, S always low. It will never be local max while neighbors have positive S. But if it waits, potential increases. If resistance is constant high, S = P/R. It can still grow unbounded, so eventually exceed. If resistance is decreased on waiting, even faster. So no starvation.

Need define update: On receive, reset P_i to 0 and maybe increase R_i by 1. On not receive, increase P_i by 1. If R_i increases on receive, it might grow unbounded, making S_i always low. But P_i also grows while waiting, so can overcome. However, if R_i increases every time it receives, over time R_i grows. But between receives, P_i grows. If it receives often, R_i high but P reset. It may become less likely. If it starves, P grows. So no starvation. But if R_i grows unbounded, P needed to overcome grows unbounded. That's okay. But resistance might represent intrinsic cost, not fair to modify. Maybe keep R_i constant. Then S = P/R. If R_i >0. On receive, P_i = max(0, P_i - cost). Or set P_i=0. On waiting, P_i++. That's enough.

If all cells always have P=0 after receive, and wait P increases. Fair.

Now, is the token's local round-robin affected by potential/resistance? The algorithm as described: token moves to next neighbor in fixed round-robin regardless of priority. The priority only decides whether current cell receives or passes. But if current cell is local max, it receives, then token moves. If current cell is not local max, it passes. That means the token still visits all cells. Potential/resistance do not influence which cell token goes to, only whether it gets budget upon visit. Is that acceptable? The question says "given per-cell potential and resistance values" and "decides which cell receives". It doesn't say token movement must use them. But maybe they want the rule to use potential/resistance to decide recipient. In our algorithm, the recipient is the first local-max cell visited by the token. If a high-priority cell is local max, it gets budget when visited. Low-priority cells pass. So potential/resistance affects who receives. But token path is independent. Could we instead let token move to neighbor with highest priority? That would use them for movement and might be more "efficient". But then need ensure no starvation. We can adapt: token moves to neighbor with highest priority (with round-robin tie-break) and if current is local max, it receives. But as discussed, might not visit all. However, if we combine with aging, maybe it still visits all because high potential cells attract token. But a cell with low potential might be skipped forever? It ages, becomes high, attracts. But if token stuck in a local max, that local max receives and resets, then token moves? Let's analyze a purely greedy token:
- At cell i, if S_i >= all neighbors, i receives and resets. Then token moves to neighbor with highest S (maybe now lower).
- Else token moves to neighbor with highest S.
This is like steepest ascent. Does it visit all? If a cell ages, its S increases. Eventually it becomes a local max. If token is elsewhere, it will follow increasing S. But steepest ascent can get stuck in local maxima. However, if token at a local max, that local max receives and resets, so it is no longer local max. Then token moves to highest neighbor. It may wander. Will it eventually visit the aging cell? Not guaranteed in arbitrary graph? Let's try to construct a trap. Suppose two separate local maxima basins connected by a low bridge. Token might oscillate between them, never crossing bridge because bridge has low S. But the starved cell on other side ages, eventually becomes high. The bridge neighbor on token side might have low S. Steepest ascent from token side to starved cell: if starved cell is high, there is a path with increasing S? Not necessarily. The bridge might have low S, creating a valley. Steepest ascent won't cross valley. So token won't reach starved cell even if it is high. Thus purely greedy can starve. So need a fair traversal independent of S. Our round-robin token solves reachability. So it's better.

But then potential/resistance only decide if current cell gets budget. The token may visit a high-priority cell and award it. If a high-priority cell is not local max because a neighbor even higher, it passes. The token still visits all. This is fine.

Could we make token movement use S but also guarantee visit all by using round-robin? For example, at each cell, maintain a queue of neighbors; choose next neighbor by priority but cycle through all eventually. But that's more complex. Minimal is fixed round-robin.

Need address "fair." In our algorithm, fairness means no starvation. But is it fair in the sense of equal treatment? It is not equal because high potential/low resistance cells receive more often. But the question says "given per-cell potential and resistance values" so fairness likely means "no cell is ignored forever." We can state: It is fair in the no-starvation sense: every cell gets the token infinitely often and its waiting potential grows, so it eventually becomes a local maximum and receives. It may be biased toward high potential/low resistance, which is intended.

Need maybe mention "if you need strict max-min fairness, you need global knowledge or a full token ring that ignores potential/resistance." But with local only, this is minimal.

Let's consider if there is an even smaller mechanism: Just a token that moves to neighbor with smallest resistance, and if stuck, potential increases. But no.

Maybe the user expects an algorithm like "Each cell maintains a 'pressure' = potential / resistance. If its pressure is greater than all neighbors, it takes the next budget; otherwise it forwards the request to the neighbor with highest pressure. To avoid starvation, increase pressure when not served." This is a classic "gradient ascent" local algorithm. They ask "Explain why the rule is fair and why it cannot starve a cell forever." They might expect this. But as I realized, gradient ascent can starve due to valleys. However, if the token starts at a cell and moves to neighbor with highest pressure until local max, the local max receives. If a cell is starved, its pressure increases until it becomes a local max. But the token may not reach it if it's not in the basin. But if every cell that waits increases pressure, eventually it might become a global max, and gradient ascent from anywhere will reach the global max? Wait I earlier said steepest ascent can get stuck at local maxima even if global max elsewhere. But can a local maximum exist if another node has higher potential? Yes. Example: path 1-2-3-4-5. Potentials: 1=0,2=10,3=0,4=20,5=0. Node 2 is local max (10 >0,0), node 4 is local max (20>0,0). Global max is 4. Steepest ascent from 1 goes to 2, stuck at 2. So token starting at 1 cannot reach 4. So if cell 4 is starved, increasing its potential to 100 doesn't help token at 1 reach it because valley at 3. So gradient ascent alone fails no-starvation. Unless token can move downhill sometimes. So round-robin token is necessary for deterministic guarantee.

But maybe the graph is a "cellular graph" where each cell is adjacent to all? No, cellular graph likely arbitrary grid. On a grid, steepest ascent can get stuck in local maxima. So yes.

What if we use "each cell sends request to neighbor with highest potential; local max receives; after receiving, its potential decreases; requests continue from all cells?" If every cell can send requests simultaneously, then local maxima receive. But multiple. To pick one, need global coordination. Not minimal.

Our algorithm with token round-robin is robust.

Let's refine algorithm to be as minimal as possible. We can avoid a separate "token" by having each cell know if it has the budget token. The token is passed locally. Each cell has a pointer `next` to a neighbor. When a cell receives the token, it checks priority. If it wins, it consumes the budget and then passes the token to `next` neighbor. If it loses, it passes the token immediately. After passing, it advances `next` to the next neighbor in cyclic order. This is local. The cell that wins is the one that receives the unit. The token itself is the "next unit" maybe. Actually if the cell wins, does it receive the unit and then pass the token? Yes, the token represents the right to allocate one unit. The cell that wins gets the unit. Then the token moves on to allocate the next unit.

Could we combine: The token carries the unit. When at cell i, if i is local max, it consumes the unit. Then a new unit is generated at i? Hmm. "Next unit of computation budget" could be allocated one at a time. The token could be the unit. If i is local max, it receives the unit; then a new unit starts at i? Or token continues. Simpler: There is a continuous process. At each step, the token is at some cell. If that cell is eligible, it gets the next unit. Then token moves to next neighbor.

But if cell receives, we need update its potential/resistance before moving on. The token then continues. The next unit allocation starts from next cell.

Now, local priority test: "S_i >= S_j for all direct neighbors j." This uses only i and neighbors. If true, i receives. If false, i does not. But wait: Suppose i is local max but there is another local max elsewhere. Token at i gives budget to i. Later token at other local max gives budget to it. That's fine. But what if i is not local max, but all its neighbors are not local max either? Then token passes through i. Eventually reaches a local max. In a finite graph, any maximal score node is local max. The token will visit it. So budget is always allocated at some point. Good.

But there is a subtle issue: If token at i and i is not local max, it passes. It does not receive. But it increases its potential. Next time token visits i, its potential is higher. If it becomes local max, it receives. But what if it becomes local max between visits, and token is at a neighbor? The neighbor might compare with i and see i higher, so neighbor passes. Token moves along. Eventually reaches i. Good.

Now, fairness proof. Let's write formal enough:
- Let R_i > 0. Define score S_i = P_i / R_i. On each token visit to i that does not award, set P_i ← P_i + 1 (or age_i++). On award, set P_i ← 0 and maybe R_i ← R_i + 1. This ensures any cell that is not awarded has its score nondecreasing; any cell that is awarded has its score reset to a base value.
- The token uses a local round-robin pointer at each cell. On a connected graph, this is a rotor-router walk and visits every cell infinitely often. (If we don't want to invoke theorem, we can say "a simple DFS-like token with a per-cell next-neighbor pointer" but round-robin is fine.)
- Suppose cell x is never awarded after some time T. Then its score grows without bound. Consider the set S of cells never awarded after T. S is nonempty. Since scores in S grow unbounded while any cell outside S is periodically reset (or has already been reset after its last award), eventually every cell in S has score larger than every neighbor outside S. Within the induced subgraph on S, take a cell y with maximum score. It is a local maximum in the whole graph. The token visits y infinitely often. When it next visits y, the rule awards y, contradiction. Thus S is empty. So every cell is awarded infinitely often. 
Need be careful: "any cell outside S is periodically reset" not necessarily periodically; but if outside S receives at least once after T, it may not receive again, then it would be in S if we choose T after its last receive. So by choosing T large enough, S can be exactly cells that never receive from then on, and outside S receive infinitely often? Actually if a cell receives finitely many times, after its last receive it never receives, so it belongs to S if T is after that last receive. So outside S receive infinitely often. Their scores may grow between receives, but if they receive infinitely often, their scores are reset infinitely often. However, they could still have unbounded score between resets if gaps grow. But we only need eventually every cell in S exceeds outside neighbors. If outside cells receive infinitely often, their score just after receive is 0. But at the moment y is visited, an outside neighbor might have accumulated a high score since its last receive. Could it be higher than y's unbounded score? If y's score grows unbounded, and outside neighbor's score between resets is bounded by the maximum gap between its receives. If its receive gaps are unbounded, its score can also grow unbounded. So y may not exceed it. But if outside neighbor receives infrequently, it might also be starved for long. However, if it receives infinitely often, its gaps could be arbitrarily large. Could an outside neighbor always have higher score than y at y's visits? Suppose outside neighbor receives only when it becomes local max, which requires its score to exceed y? This is circular.

Let's think more carefully. The simple proof "if x never receives, its potential grows unbounded; eventually it exceeds all others" assumes others' potentials are bounded. But others that receive infinitely often could have unbounded peaks if they wait longer and longer. But can they wait longer and longer while x never receives? x's potential grows, so x would eventually become local max and receive. To prevent x from receiving, at every visit to x there must be a neighbor with higher score. That neighbor must have waited longer or have higher resistance. But if that neighbor receives, it resets. So to block x, some neighbor must have a score higher than x's at that moment. As x grows, blockers must also grow. But if a blocker grows, it may become local max and receive, resetting. So there is a dynamic. Could there be an infinite sequence where x is always blocked, but blockers alternate and reset, and x's score grows unbounded? For x to be blocked at time t, a neighbor j must have S_j > S_x(t). If j receives at some time, its score resets to 0. Then later x visits again; to block, j must have regained a score > S_x. That means j waited since its reset. The time between j's receives must be at least proportional to S_x. So j's gaps grow. But j is receiving, so it's not starved forever. However, x is starved. Could this happen indefinitely? Consider two cells 1 and 2. 1 never receives. 2 receives whenever it blocks 1? Let's simulate. P1 increases. P2 receives sometimes. To block 1, P2 must be > P1. After P2 receives, P2=0. Then P1 grows. At next visit to 1, P1 > P2, so 1 would receive. Unless P2 has grown since its reset without receiving. But P2 only grows when it doesn't receive. It could grow if token visits it and it doesn't receive because P1 > P2? Wait if P1 > P2, when token at 2, 2 is not local max, so it doesn't receive and P2 increases. But token visits alternate. Let's simulate two cells with rule: At 1, if P1 >= P2, 1 receives (P1=0). At 2, if P2 >= P1, 2 receives (P2=0). Start P1=0,P2=0. Token at 1: P1>=P2, 1 receives, P1=0. Token at 2: P2=0 >= P1=0, 2 receives, P2=0. So both receive alternately. No starvation.

What if resistance? S1 = P1/R1. Suppose R1 huge, R2 small. P1 grows but S1 low. 2 receives often. Can 1 starve? At 1, condition S1 >= S2. If not, 1 passes and P1++. At 2, S2 >= S1, 2 receives and P2=0. Next at 1, P1 increased by 1. S1 = P1/R1. If R1=1000, P1 needs >1000*S2. S2 after reset is 0. So at next visit to 1, S1 >0, so 1 receives! Wait if 2 just received, P2=0, so S2=0. Then at 1, S1 >0, so 1 is local max and receives. So 1 cannot starve. The only way 1 is blocked is if neighbor has positive score. But after neighbor receives, its score resets to 0. So at next visit to 1, unless neighbor hasn't received since, its score might be 0. But if neighbor didn't receive, its score increased. Let's simulate alternating with R1=1000, R2=1. Token at 1: S1=0, S2=0, 1 receives (P1=0). Token at 2: S2=0, S1=0, 2 receives (P2=0). Both receive every visit. So high resistance doesn't matter if P resets to 0. If on receive we increase R, then S1 becomes 0/R1=0. Still ties.

If we set P_i = max(0, P_i - 1) on receive, and P starts 1. For R1=1000, after receive P1=0. So S=0. So it can still tie. If we require strict >, then high resistance could starve. But we use >=. So no starvation. But then potential/resistance doesn't prioritize much because after any receive, score becomes 0, and any cell with P>0 beats 0. So a cell that just waited one step beats all cells that just received. This leads to round-robin-like fairness, not much priority. To give priority, on receive we could reset P to a lower value, not 0. But then starvation proof needs aging.

Maybe we want potential/resistance to actually influence. We can set on receive: P_i = P_i - cost (maybe cost = resistance). If P_i still high, it may receive again. On waiting: P_i increases. This could starve if P_i never drops below neighbors? But if it receives, it drops. If resistance high, cost high, drops more. If potential high, it might receive multiple times. Fairness still if waiting increases potential unbounded. But if a cell receives and P remains high, it might be local max again. Other cells wait and increase. Eventually they exceed. So no starvation.

Let's design a more flexible update:
- Score S_i = P_i / R_i.
- When i receives, P_i ← max(0, P_i - R_i) (so score drops by 1) or P_i ← 0.
- When i does not receive, P_i ← P_i + 1 (or P_i ← P_i + R_i? to increase score by 1). This ensures waiting cells' scores increase.
- Resistance could be constant or modified.

Fairness proof: If a cell never receives, its score increases without bound. If it receives, its score decreases. Thus over time, a starved cell's score eventually dominates. The token visits all cells, so it will be local max and receive.

But the dynamic blocking issue: Suppose cell x never receives. Its score grows. To block x, some neighbor must have higher score at each visit. That neighbor must not have received recently (otherwise score low). But if it doesn't receive, its score also grows. So a set of mutually blocking cells all grow. In a finite set, one will be local max and receive, reducing its score. Thus x cannot be blocked forever. This is the correct proof.

We can state: Consider any time after which x never receives. Its score is strictly increasing. Look at the cell with maximum score among all cells that never receive. It may be blocked by a neighbor that does receive. But that neighbor's score is reset when it receives. If the neighbor never receives, then it's in the set and contradicts maximum. If it receives, then immediately after its receive its score is lower than x's (eventually). So x will not be blocked at its next visit. Hence x must receive. This is a bit hand-wavy but acceptable.

Let's try to make a rigorous no-starvation proof for our specific algorithm where on receive P_i=0. Then any cell that hasn't received since some time has P_i increasing. If x never receives, P_x grows. At each visit to x, if it doesn't receive, there is a neighbor j with P_j/R_j > P_x/R_x. Since P_x grows unbounded, P_j must also grow unbounded. But if j receives infinitely often, P_j resets to 0, so it cannot be > P_x at times when P_x is huge unless j has been waiting a long time. But if j waits a long time, it will itself become local max and receive before that. Actually if P_j grows large, it might be local max and receive when token visits it. Since token visits j infinitely often, j cannot wait arbitrarily long without receiving if it is local max. But it might not be local max if x has even higher P_x. So x and j could block each other? They are neighbors. If P_x > P_j, then x is higher. At x, x would receive (unless another neighbor higher). At j, j would not receive (since x higher). So j's P_j increases. Eventually P_j > P_x. Then at j, j receives. So they alternate. x cannot be forever blocked by j because j's score will eventually exceed x's, then j receives and resets, allowing x. So no starvation.

Thus the algorithm with P reset on receive and P++ on non-receive is fair.

But wait: If x never receives, its P_x increases every time token visits x. Token visits x infinitely often. At each visit, if x not receive, P_x++. So P_x grows. For x to never receive, at every visit there must be some neighbor j with S_j > S_x. Since P_x grows, S_j must also grow. But j's P_j grows only when token visits j and j doesn't receive. Token visits j equally often. If j receives sometimes, P_j resets. But if j receives, then after reset S_j=0 < S_x (since S_x>0). For j to block x at next x visit, j must have grown since its last receive. That means j didn't receive for a while. But if j didn't receive, its P_j grew. Eventually P_j > P_x, so at j's next visit, j would receive (unless another neighbor higher). So j cannot stay just above P_x without receiving. It will receive when it becomes local max. Thus x eventually receives. So no starvation.

Okay.

Now, what about "resistance" values? If R_i is fixed, then S_i = P_i / R_i. On waiting, we can increase P_i by R_i so S_i increases by 1. On receive, P_i = max(0, P_i - R_i) so S_i decreases by 1. This makes resistance scale the time needed. Or simply use S_i = P_i - R_i and on waiting P_i++, on receive P_i = R_i (or 0). The exact update can be chosen to fit semantics. The key is aging.

Maybe we can present the algorithm abstractly:
- Define priority score `S(i) = f(P_i, R_i)` where f is increasing in P and decreasing in R. (e.g., P/R).
- Token circulates locally.
- At token visit, if S(i) is at least that of every neighbor, i gets the unit; else it doesn't.
- If i gets the unit, decrease its potential/increase its resistance (or reset its age). If it doesn't, increase its potential/decrease its resistance (aging).
This is minimal.

Need answer the question: "Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

We should structure final:
- Assumptions.
- Algorithm in steps.
- Why local/minimal.
- Fairness/no starvation proof.

Let's write in an engineer tone.

Potential and resistance: Let potential be `P_i` (higher = more need) and resistance be `R_i > 0` (higher = more costly/harder). Define `score(i) = P_i / R_i`. If resistance means "resistance to receiving", then high resistance lowers priority. If it means "resistance to overload", maybe invert. We can say "or any local monotone score; the rest is unchanged."

Algorithm:
1. Each cell keeps a cyclic list of its neighbors and a cursor `next_i`. A single budget token moves around the graph. When token leaves cell i, it goes to the next neighbor after the one it came from (or simply advances cursor). This is the local round-robin/rotor-router.
2. When the token is at i, i computes `s_i = P_i/R_i`. It compares only with `s_j` for `j ∈ N(i)`.
3. If `s_i >= s_j` for all neighbors j, i is the winner: it receives the next unit.
   - Update: `P_i ← max(0, P_i - R_i)` (or `P_i ← 0`), and optionally `R_i ← R_i + 1` to damp it.
4. If `s_i < s_j` for some neighbor, i is not the winner: it ages:
   - `P_i ← P_i + R_i` (so `s_i` increases by 1) or `P_i ← P_i + 1`.
   - Optionally `R_i ← max(1, R_i - 1)`.
5. Move token to next neighbor in `next_i`.

Wait: If i is not the winner, we increase P_i. But if i is the winner, we decrease P_i. What about cells that are not visited by token? They don't update. But token visits all. However, if a cell is not visited for a while, it should age. In our algorithm, it only ages when token visits and it loses. If token visits it infrequently, it ages less. But token visits all equally? The local round-robin may not visit all equally often; some cells may be visited more often. But it visits all infinitely often. If a cell is visited infrequently, it might starve longer, but not forever. Fairness no starvation is okay. If we want more fairness, all cells can increment age every time step. But that requires global time? Not necessarily; each cell can have its own clock. But minimal mechanism can just age on token visit.

But consider a cell that is never visited? The rotor-router guarantees visits all. So okay.

What about a cell that is visited but always loses? It ages. Good.

Now, is the update "P_i ← P_i + R_i" on loss and "P_i ← max(0, P_i - R_i)" on win such that score changes by ±1. This makes resistance cancel. If R_i is fixed, S_i = P_i/R_i. Adding R_i increases S by 1. Subtracting R_i decreases S by 1. So each event changes score by 1. This is nice. Then even high resistance cells age at same rate in score.

If R_i can change, we need be careful. Maybe keep R_i fixed to avoid unbounded. Let's keep R_i fixed. Then score updates are simple.

Let's define:
- `P_i` is an aging counter / potential.
- `R_i` is fixed resistance.
- Score `S_i = P_i / R_i`.
- On loss: `P_i += R_i` (so `S_i += 1`).
- On win: `P_i = max(0, P_i - R_i)` (so `S_i -= 1` or reset to 0).
This makes a cell that is not served increase its score by 1 each token visit that it loses. A served cell decreases its score by 1 (or resets). Thus no starvation: any cell that keeps losing gets higher score until it becomes local max.

But if a cell receives and P_i doesn't reset to 0 but decreases by R_i, it might still be local max and receive again. That's okay; it will eventually decrease. Fairness still holds because other cells increase.

Let's test two-cell with this update. Start P1=0,P2=0,R=1. Token at 1: S1=0 >= S2=0, 1 wins, P1=max(0,0-1)=0. Token at 2: S2=0 >= S1=0, 2 wins, P2=0. Both win every visit. Fair. If start P1=10,P2=0. Token at 1: S1=10 >=0, 1 wins, P1=9. Token at 2: S2=0 < S1=9, 2 loses, P2+=1 -> P2=1. Next token at 1: S1=9 >=1, 1 wins, P1=8. Token at 2: S2=1 <8, 2 loses, P2=2. Eventually P1 decreases, P2 increases. They meet. Then both win when scores equal? At 1, S1=5, S2=5, 1 wins, P1=4. At 2, S2=5 >=4, 2 wins, P2=4. Then alternating. Fair.

What if R1=100, R2=1. Start P1=0,P2=0. Token at 1: S1=0 >=0, 1 wins, P1=0. Token at 2: S2=0 >=0, 2 wins, P2=0. Both win. So high R doesn't prevent if P=0. If we want high R to lower priority, we need initial P proportional? Actually if P=0, score 0 regardless of R. So any cell with P=0 ties. To give high R lower priority, we could set score = P - R, so high R gives negative. But then a cell with high R needs more P to reach 0. That works. Let's use `S_i = P_i - R_i`. Higher potential and lower resistance. On loss: `P_i += 1`. On win: `P_i = max(0, P_i - 1)` or reset. This is simpler. Resistance is a threshold. A cell with high resistance needs to age more to become local max. Fairness: if it never receives, P_i grows unbounded, so eventually S_i becomes high regardless of R_i. So no starvation. This might be more intuitive. But potential/resistance values: if resistance is cost, score = potential/resistance. Both are fine.

Maybe define `S_i = P_i / R_i` and on aging `P_i += R_i`. That makes score increase by 1 regardless of R. Then high R doesn't delay; it just scales P. If we want high R to delay, we can age `P_i += 1`, so score increases by 1/R_i (slower for high R). But eventually unbounded. Fairness still holds. So either.

Let's choose a simple one: `S_i = P_i / R_i` (R_i>0). On waiting, `P_i += 1`; on receiving, `P_i = 0`. This is very simple. High resistance means slower score increase, but eventually. However, if P resets to 0 on receive, then after any receive score=0. A cell that just waited one step has score 1/R. If R is huge, 1/R might be less than another cell's score. But eventually it grows. Fairness holds. Let's use this for simplicity. But if P resets to 0, the cell that receives becomes score 0. Then any cell with P>0 beats it. So it gives a round-robin flavor. High resistance cells need to wait longer to beat a neighbor with positive score. But they will eventually. So no starvation.

Let's specify: On receive, `P_i ← 0` (or decrease by cost). On not receive, `P_i ← P_i + 1`. This is minimal. Resistance fixed. Score = P/R.

Fairness proof with this: Suppose cell x never receives. Each time token visits x and it doesn't receive, P_x increases by 1. Since token visits x infinitely often, P_x → ∞. Thus S_x → ∞. At each visit, to prevent x from receiving, some neighbor must have S > S_x. But S_x is eventually larger than any bounded neighbor. Neighbors that receive reset to 0. Neighbors that never receive also grow, but within the set of never-receiving cells, one becomes local max and receives. So contradiction. Thus x receives infinitely often.

Actually if a neighbor also never receives, its S also grows. But consider the set of never-receiving cells. Since finite, take the one with maximum S. It is local max relative to that set. Its neighbors outside the set receive infinitely often (or have bounded S). So it becomes local max overall. Token visits it, so it receives. Contradiction. So no never-receiving set. This is a clean proof. We can present it.

Let's write the proof more clearly:
- Assume there is a nonempty set S of cells that never receive after some time T.
- For i ∈ S, P_i increases by 1 each time the token visits i and i does not receive. Since the token visits i infinitely often, P_i → ∞, so S_i → ∞.
- Consider the induced subgraph on S. Pick i* ∈ S with maximum score at some large time (or eventually). Since all scores in S tend to ∞, but relative order may change. However, we can argue: At any time, there is a cell in S that is a local maximum within S. Its neighbors outside S have scores that are reset to 0 infinitely often (if they receive) or are also in S. If they are in S, the local max beats them. If outside S, eventually their scores are smaller than the growing scores in S. So eventually that cell is a local maximum in the whole graph. When the token visits it, it will receive. Contradiction. Thus S must be empty.
This is a bit hand-wavy about "eventually local max" because the local max within S can change. But since finite, we can take the cell in S that is visited next among those with maximum score? Hmm.

Alternative proof by induction on graph size? Not needed. We can state intuitively: If a cell is starved, it keeps increasing its score. The only way it can be denied is if some neighbor has an even higher score. But that neighbor, if it is served, drops; if it is not served, its score also increases. Following this chain in a finite graph must eventually reach a cell that is a local maximum. That cell will be served when the token reaches it, dropping its score. Therefore the chain cannot keep the original cell starved forever. This is acceptable for an engineering answer.

Need mention tie-breaking. If we use `>=`, ties are resolved in favor of the cell currently holding the token. This is local and fair because token visits all. If we use a deterministic tie-break (e.g., smaller ID), it could starve a tied cell? Actually if tie-break is local and consistent, a cell might always lose ties to a neighbor with smaller ID. But aging will break ties because if it never receives, its P increases, so it won't tie. So even strict tie-break is okay if aging. But if P resets to 0, ties can occur. To avoid any subtle starvation, use non-strict `>=` so any visited local max (including ties) receives. Or use a tie-break based on token direction that cycles. We can simply say "with any fixed local tie-break; aging will break ties eventually." But to be safe, use `>=` and no additional tie-break. If two adjacent cells have equal max score, the one with token receives. Next time token at the other, if scores still equal, it also receives. So both get served. That's fair.

Let's consider if multiple cells with equal max score and token at one receives, resets P=0. Then the other has higher score, so it receives next. So no issue.

Now, what about cells not on the token path? The rotor-router ensures all visited. We should explain the local round-robin:
- Each cell stores a pointer `c_i` to one of its neighbors.
- When the token arrives at i from neighbor `prev`, i sends it to `c_i`, then advances `c_i` to the next neighbor in a fixed cyclic order (skipping `prev`? Actually rotor-router rule: send to current rotor, then advance. The incoming neighbor is not needed if rotor already points to last sent. But to ensure it doesn't immediately bounce back? It can bounce back, but that's okay. The classic rotor-router: at each visit, advance rotor to next neighbor and send token there. Let's use that. It doesn't need to know where it came from. Each cell has a cyclic list of neighbors. When token visits i, i sends it to the neighbor pointed to by its rotor, then advances rotor to next in cycle. This is even simpler. Does this visit all nodes infinitely often? Yes, rotor-router on connected undirected graph. It may bounce back and forth, but eventually covers all. Let's verify with path 1-2-3. Start token at 1. Rotor at 1 points 2 -> send 2, advance to 2 again? If degree 1, always 2. At 2, rotor points 1 -> send 1, advance to 3. At 1, send 2. At 2, send 3. At 3, send 2. At 2, rotor next after 3 is 1. Send 1. At 1 send 2. At 2 send 3... Visits all. Good. This is simpler: no incoming neighbor needed. Each cell just cycles through neighbors. Is it guaranteed to visit all? Yes, rotor-router with single chip on finite connected undirected graph eventually visits all vertices? Let's check a star graph. Center 0 with leaves 1,2,3. Rotor at 0 cycles 1,2,3. Token at 0 sends to 1. Leaf 1 sends to 0. Center next sends to 2. Leaf 2 sends to 0. Center next sends to 3. Leaf 3 sends to 0. Center next sends to 1. Visits all. Good.

What about a graph where token might get stuck in a subset? I think rotor-router single chip on undirected graph is recurrent and visits all vertices. There is a known result. We can just state "a token that advances a per-cell round-robin cursor and moves to the next neighbor will, on a connected graph, visit every cell infinitely often (this is the standard rotor-router walk)." That's fine.

If we want to avoid relying on rotor-router theorem, we could use a deterministic depth-first traversal with more state (e.g., each cell remembers which neighbors have been explored). But that requires more memory and might be more complex. The question asks for smallest mechanism. Rotor-router is minimal: one pointer per cell.

Alternatively, use a random walk: at each cell, pick a random neighbor. On a connected graph, it visits every cell infinitely often almost surely. This is even simpler (no pointer, just randomness). But deterministic no-starvation is stronger. We can mention random walk as a fallback: if probabilistic fairness is acceptable, random walk with aging also works. But we want deterministic.

Let's also consider if the graph is directed. Cellular graph might be directed? Usually cellular graph is undirected. If directed, need strongly connected for token to visit all. We can mention assume connected/strongly connected.

Now, let's think if there is a simpler algorithm that does not require a circulating token but uses local messages. For example, each cell broadcasts its score to neighbors; if it has highest among neighbors, it sends a "claim" to neighbors; but multiple claims. To decide one, could use a token. Token is minimal.

Maybe the question is from a prompt about "cellular graph" and "computation budget" in the context of "self-assembly"? They might want a "local algorithm" similar to "each cell compares potential/resistance to neighbors; if it has highest potential/resistance, it takes budget; otherwise it forwards to neighbor with highest." But as we discussed, that doesn't guarantee global fairness. The user explicitly asks "why it cannot starve a cell forever." So they are aware of starvation. A robust answer should include aging and a fair traversal.

Let's maybe present the algorithm as:
- A single "budget token" circulates through the graph using a local round-robin.
- When it visits a cell, that cell is considered. If its score is at least as high as all neighbors, it receives the unit and then its score is reduced. If not, its score is increased (aging) and the token moves on.
This is minimal and fair.

Let's write the final answer in a clear way.

Potential details:
- Let `P_i` be potential, `R_i` be resistance. Define `score(i) = P_i / R_i` (if `R_i > 0`). If resistance is supposed to be subtracted, use `P_i - R_i`; the same algorithm works with any monotone score.
- Each cell stores: `P_i`, `R_i`, a neighbor cursor `next_i`.
- Token state: current cell `c`.
- At each step:
  1. Let `S_i = P_i / R_i`.
  2. If `S_i >= S_j` for all `j ∈ N(i)`, then i wins. Award budget to i. Set `P_i = max(0, P_i - 1)` or `P_i = 0` (or `R_i += 1`). 
  3. Else, i loses. Set `P_i = P_i + 1` (aging).
  4. Move token to `next_i` and advance `next_i` to the next neighbor in a fixed cyclic order.

Wait: If i wins, we move token to next neighbor. If i loses, we also move. The cell that wins receives the unit. But what about the cell that wins—does it also age? No.

But if i wins, we decrease P_i. If i loses, we increase P_i. This is local.

One issue: The token visits a cell, it either wins or loses. But what if a cell is not visited for a long time? It doesn't age. However, the token visits all infinitely often. But if a cell is visited rarely, it ages slowly. Could that cause starvation? No, because it still gets visited infinitely often, so it can eventually win. But if it is visited very rarely, its competitors might receive often and reset, so it might need many visits to age. But it gets infinite visits, so eventually. So no starvation. Fairness in terms of bounded delay? Not guaranteed. But "cannot starve forever" is satisfied.

If we want all cells to age continuously, we can say "each cell increments P_i every time step it does not receive; when it receives, reset P_i." But that requires each cell to know time steps. In a distributed system, they can have local clocks. The local rule still uses only local info. But minimal mechanism? The token itself can be the clock; cells only update on token visit. That's more minimal. But then a cell that is not visited doesn't age. However, the token visits all, so it's fine. Let's stick with aging on token visit.

Wait: If a cell is not visited for a long time, it doesn't increase P. But during that time, other cells receive and reset. When it is finally visited, its P might be low, so it might lose. Then it increases P. It might take many visits to become local max. But it will eventually. So no starvation.

But consider a cell that is visited very frequently but always loses because a neighbor has slightly higher score. It increases P each visit. The neighbor also increases P if it loses, or resets if it wins. Eventually the first will win. So fair.

Let's also mention "tie-breaking: use >=, so if scores tie, the cell holding the token can take the unit. This avoids a fixed tie-break starving tied cells. Aging breaks ties anyway."

Now, let's think about the "fair" definition. We can say:
- The algorithm is fair in the sense of eventual service: every cell that can be reached by the token is served infinitely often.
- It is not necessarily equal-rate fair; cells with higher potential/lower resistance get more budget. That is intended by the score.
- If you want strict round-robin fairness, set all scores equal; the algorithm reduces to a token ring.

Let's also mention "minimal": You need only one token, one pointer per cell, and one scalar per cell. No global max, no global queue. The rule is strictly local: a cell only reads its own P,R and its neighbors' P,R.

Let's consider if the algorithm requires neighbors' P,R. The cell at token compares its score with all direct neighbors. So it needs to know neighbors' P,R. In a cellular graph, cells can share their P,R with direct neighbors. That's local. The rule uses only direct neighbors. Good.

Now, let's address potential edge cases:
- If resistance is zero, define score as infinite or handle by setting R_i ≥ ε > 0.
- If graph is disconnected, a token cannot reach other components; no local algorithm can serve them from one component. So assume connected.
- If the token is at a cell that is not local max, it passes. But what if no cell is local max? In a finite graph, there is always at least one local max (with >=). So the token will eventually award at some cell.

Let's write the final answer with a pseudo-code.

Pseudo-code:
```
state per cell i:
    P_i, R_i
    next_i  # cursor into cyclic neighbor list

token at cell i:
    s_i = P_i / R_i
    s_max = max(s_j for j in neighbors(i))
    if s_i >= s_max:
        # i receives next budget
        P_i = max(0, P_i - 1)   # or P_i = 0
        # optionally R_i += 1
    else:
        # i ages while waiting
        P_i = P_i + 1
    # move token
    j = next_i
    next_i = next_neighbor_after(j)  # advance cursor
    token = j
```

Wait: If i receives, should it also reset its waiting? P_i decreases. If it loses, P_i increases. But if i receives, it might still have high P_i, so it could receive again next time. That's okay. But if we want to prevent monopolization, set P_i = 0 on receive. Let's set P_i = 0 on receive for simplicity. Then the winner is reset to 0, so it won't be local max unless neighbors are also 0. If neighbors are 0, ties allow. So it may still receive often if all are 0. But token round-robin means it only receives when visited. Fair.

Let's use `P_i = 0` on receive. Then aging on loss `P_i += 1`. Score = P_i / R_i. This is very simple.

But consider a cell with high R. If it loses, P_i increases. To get score 1, it needs P_i = R_i. So it ages R_i times. Neighbors with low R age faster. But high R cell will eventually get P_i large enough. So no starvation.

Now, if a cell receives, P_i=0. So its score becomes 0. Any neighbor with P>0 beats it. So it won't receive again until it loses and ages or until all neighbors are 0. This enforces fairness.

Let's test star graph with center R=1, leaves R=100. Token at center: P=0, leaves P=0, center wins, P_center=0. Token at leaf1: P=0, center P=0, tie, leaf wins, P_leaf=0. Token at center: all 0, center wins. Token at leaf2: all 0, leaf2 wins. So all get served equally. High R doesn't matter because P resets to 0. To make R matter, we need initial P > 0 or not reset to 0. But the question says "given per-cell potential and resistance values." If we reset to 0 on receive, resistance only matters when P > 0. If all start at 0, it's pure round-robin. Maybe that's acceptable? But we want to use potential/resistance. If we set P_i = max(0, P_i - R_i) on receive, then a cell with high potential and low resistance might retain high score and receive multiple times. Let's use that to actually use the values.

Let's design update to respect resistance:
- Score `S_i = P_i / R_i`.
- When i receives, it "spends" some potential: `P_i = max(0, P_i - R_i)`. This reduces its score by 1.
- When i loses, it "accumulates" potential: `P_i = P_i + R_i`. This increases its score by 1.
This way, a cell's score changes by exactly 1 per token visit, regardless of R. Resistance doesn't affect aging rate in score. It only scales P. So high R doesn't delay. To make high R delay, use `P_i += 1` on loss and `P_i = max(0, P_i - R_i)` on win. Then high R makes it harder to win? Actually score = P/R. On loss, P += 1, score increases by 1/R. So high R increases slowly. On win, P -= R, score decreases by 1. So high R cells need to wait longer to build score, but when they win they lose a lot. This seems reasonable: high resistance means slower accumulation. Fairness still holds because if it never wins, P grows unbounded, so score grows unbounded regardless of R. So no starvation.

Let's use:
- On loss (not selected): `P_i ← P_i + 1` (aging).
- On win (selected): `P_i ← max(0, P_i - R_i)` (or reset to 0).
This uses resistance: a cell with high resistance needs more waiting to reach a given score, and when it wins it spends more potential. But if it is starved, it eventually accumulates enough.

But if R_i is large, `P_i - R_i` might set P_i to 0 even if it had high P. That means it gives up a lot. Fairness still okay.

Alternatively, simply reset P_i = 0 on win. It's minimal. The question doesn't specify exact dynamics of potential/resistance after allocation. It just says "given per-cell potential and resistance values" for the decision. We can leave update as "decrease potential/increase resistance on win; increase potential/decrease resistance while waiting." That's enough.

Let's phrase:
- Define `score(i) = P_i / R_i`.
- On winning, apply an update that cannot increase its score (e.g., `P_i ← 0`, `R_i ← R_i + 1`).
- On losing, apply an update that increases its score (e.g., `P_i ← P_i + 1`, `R_i ← max(1, R_i - 1)`).
This is general and clear.

Now, let's write the final answer.

We should also mention "no global view" explicitly: The only information used is the cell's own `P_i,R_i` and those of its direct neighbors. The token is passed to a direct neighbor. The cursor is local.

Let's outline final:

**Assumption:** Connected undirected graph; one token; cells can store local state.

**Algorithm:**
1. Each cell has a cyclic pointer over its neighbors. A single token moves: at cell i, send it to the neighbor pointed to by `next_i`, then advance `next_i`. This is a local round-robin/rotor-router; on a connected graph it visits every cell infinitely often.
2. When the token visits i, compute `S_i = P_i / R_i` (or any local score: higher potential, lower resistance is better).
3. Compare with neighbors: if `S_i >= S_j` for all `j ∈ N(i)`, i wins the next unit. Otherwise it doesn't.
4. Update:
   - Winner: `P_i ← max(0, P_i - R_i)` (or `P_i ← 0`), optionally `R_i ← R_i + 1`.
   - Loser: `P_i ← P_i + 1` (or `R_i ← max(1, R_i - 1)`).
5. Move token.

**Why fair / no starvation:**
- The token visits every cell infinitely often (rotor-router on connected graph).
- A cell that is not chosen increases its score each time it is visited (aging). The only reason it is not chosen is that some neighbor has a strictly higher score.
- Follow that neighbor; if that neighbor is not chosen either, its score also increases; if it is chosen, its score is reset/decreased. In a finite graph, following the "higher score" chain must end at a local maximum. When the token reaches that local maximum, it is chosen, and its score drops.
- Therefore no cell can remain permanently below all neighbors. If a cell were starved forever, its score would grow without bound. Eventually it would be the local maximum (or part of a finite set of starved cells, within which one becomes local maximum), and the token would choose it when it arrives. Contradiction.
- So every cell receives the budget infinitely often. The algorithm is fair in the no-starvation sense; it biases toward high potential/low resistance but still serves every cell eventually.

We should also mention tie-breaking: Use `>=` so ties don't block; if a tie occurs, the cell holding the token can take it. Aging will break ties anyway.

Let's consider if the token's round-robin pointer needs to be initialized. Any initialization works.

Let's also mention "minimal": one token, one cursor per cell, two scalars per cell. No global ranking, no global max, no central queue.

Now, let's think if there is any flaw in the no-starvation proof with the update `P_i = max(0, P_i - R_i)` on win. Suppose a cell wins and P_i remains high. It might continue to win. Other cells lose and increase P. Eventually they exceed. So fair. The proof still holds: if a cell never wins, its P grows unbounded, so its score grows unbounded. The set of never-winning cells, if nonempty, has a local max that will win. So no starvation.

What if a cell wins infinitely often but with gaps growing? It's not starved. The question asks cannot starve forever. So okay.

Let's maybe include a note: "If you need bounded delay fairness, you need a global clock or a stricter token ring; with only local information, eventual fairness is the strongest reasonable guarantee."

Now, let's write final answer in a concise but complete way. The desired oververbosity is 5. We can be moderately detailed.

Let's draft final:

```
Assume graph connected. Let P_i >= 0, R_i > 0. Define score S_i = P_i / R_i.
Each cell keeps a cyclic list of neighbors and a cursor.
A single budget token circulates: at cell i, send token to cursor(i), then advance cursor(i).
When token is at i:
    if S_i >= S_j for all neighbors j:
        i receives the next unit.
        P_i = max(0, P_i - R_i)   # or P_i=0
        # optionally R_i += 1
    else:
        P_i += 1                  # aging
        # optionally R_i = max(1, R_i-1)
Move token.
```

Then explain.

Let's ensure the algorithm "decides which cell receives the next unit" — the cell that receives is the one where the token is when condition holds. If condition doesn't hold, no cell receives at that step; token moves. Eventually some cell receives. So each step either allocates or passes. The "next unit" is allocated when a local max is visited. This is a local decision.

Maybe we should say "If the token is at i and i is local max, i gets the unit immediately; otherwise the unit is carried by the token to the next cell." So the token carries the unit. That's clear.

Let's also mention "direct neighbors" in condition. The cell only needs to read `P_j,R_j` for `j` adjacent. That's allowed.

Let's consider if the token itself is a global object. Is a token considered global view? No, it's just a local message passed around. Each cell only knows if it currently holds the token. No cell knows global state.

Let's write final with headings.

Potential final answer:

**Minimal local rule:**
- Use a single token that walks the graph by a local round-robin/rotor-router.
- At each visit, the current cell is awarded iff its priority is maximal among itself and its immediate neighbors.
- Waiting cells age; winners are damped.

**Fairness proof:**
- Token visits all cells infinitely often.
- Aging ensures a cell's priority grows while it is denied.
- Finite graph + local max chain => someone is always a local max; token eventually reaches it and awards it; its priority drops.
- Hence no cell remains denied forever.

Let's include tie-breaking: `>=` not `>`; if tie, current cell wins. This prevents deterministic tie-break starvation and is still local.

Let's also mention resistance: If resistance is a cost, use `S_i = P_i / R_i`; if it's a tolerance, use `S_i = P_i - R_i`. The exact form doesn't matter as long as higher means more deserving and aging increases it.

Now, let's think if there is any need to explain "why the rule is fair" beyond no starvation. Fairness could mean "equal chance" but our algorithm is not equal. We can say "It is fair in the sense that it cannot ignore a cell forever. It is not equal-rate fair; it is priority-biased with aging, which is usually what you want when potential/resistance are given." That addresses potential misunderstanding.

Let's also mention "If all potentials/resistances are equal, the algorithm degenerates to a token ring, which is perfectly round-robin fair." That's a nice touch.

Let's write final answer now.

## answer

Assume the cellular graph is connected and undirected. Let each cell \(i\) have potential \(P_i \ge 0\) and resistance \(R_i > 0\). Define a local priority score

\[
S_i = \frac{P_i}{R_i}
\]

or any other monotone local score: higher potential is better, higher resistance is worse.

## Minimal local rule

Use one “budget token” that circulates through the graph.

1. Each cell keeps a cyclic list of its direct neighbors and a cursor `next_i`.
2. When the token is at cell \(i\), move it next to `next_i`, then advance `next_i`.
   - This is a local round-robin / rotor-router walk.
   - On a connected graph, this token visits every cell infinitely often.
3. When the token visits cell \(i\), \(i\) compares its score only with its direct neighbors:
   \[
   S_i \ge S_j \quad \text{for all } j \in N(i)
   \]
4. If true, \(i\) receives the next unit of budget.
   - Update it downward: e.g. \(P_i \leftarrow \max(0, P_i - R_i)\), or simply \(P_i \leftarrow 0\).
5. If false, \(i\) does not receive the unit.
   - Update it upward as “aging”: e.g. \(P_i \leftarrow P_i + 1\).
6. Continue moving the token.

Ties can be resolved by letting the current token holder win, i.e. use \(\ge\). This avoids a fixed tie-break starving one side of an equal-score edge.

## Why it is local

At any moment, a cell only needs:

- its own \(P_i, R_i\),
- the \(P_j, R_j\) of its direct neighbors,
- its local neighbor cursor.

No cell needs a global maximum, global queue, or global clock.

## Why it is fair and cannot starve a cell forever

The token visits every cell infinitely often because it advances a per-cell round-robin cursor on a connected graph.

If a cell is not chosen, its potential increases each time it is denied. So a starved cell’s score \(S_i\) grows without bound. The only way it can keep losing is if some neighbor has an even higher score.

Following that “higher-score” chain in a finite graph must eventually reach a local maximum. When the token reaches that local maximum, it is chosen, and its score is reduced. Therefore the chain cannot keep blocking the original cell forever.

Equivalently: suppose a nonempty set of cells never receives budget after some time. Their scores all grow without bound. Within that finite set there is some cell that is maximal relative to its set; eventually it also dominates its neighbors outside the set, so it becomes a local maximum. The token visits it infinitely often, so it must eventually receive the unit. Contradiction.

Thus every cell that the token can reach is served infinitely often. The algorithm is fair in the no-starvation sense: it is biased toward high-potential/low-resistance cells, but aging guarantees that every cell eventually gets a turn. If all potentials and resistances are equal, it degenerates to a simple fair token ring.
