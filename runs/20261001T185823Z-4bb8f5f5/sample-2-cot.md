# sample 2 — lens: a teacher who explains by building one small piece at a time

## seed_requested
{"seed": 24417, "bits16": "0101111101100001", "source": "mothquantum/coin-toss-v1:1shot", "entropy_bits_true": 16, "job_ids": ["fb6ea9b6-7b18-4d93-b2d1-b56e7206d805", "a2c46da3-f4c1-4380-8a3d-3e0d13437bff", "c4cd8c4f-a7ac-40ca-87a1-3811de3a02fe", "0d8dec72-6c8c-4677-b920-3838fcce949a", "3ef803db-9b50-42df-905f-a3c27efad217", "22da566a-8a3d-4db7-804f-31033de90887", "b9d1794d-2a2d-49ea-b453-c4ffea3c60e3", "d665f3af-b9b5-4865-b4f8-c478318a972b", "cb3bd285-bca5-40a0-9b0e-93ae9fe489ed", "5f4ef598-2949-4eb9-8435-7ef6754a2a31", "af27f779-45ce-40da-9954-5263bbba182b", "6b25d6a4-7395-4461-b3c1-00ebca6d270e", "5b439c29-fffb-4996-a717-efd807970b3b", "f19f5d28-9704-416d-81f2-9cd2d1b15508", "581b559e-b125-4be8-b273-c007da30f440", "e44802ba-fc2e-4ac2-b002-bd70ce7883f5"]}

## chain-of-thought

We need answer. Need craft explanation. User asks: "Lens: you are a teacher who explains by building one small piece at a time.

Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

We need design minimal local algorithm. Need infer context? Cellular graph, per-cell potential/resistance. Decide which cell receives next unit of computation budget. Rule uses only cell and direct neighbors (no global view). Explain fair, no starvation.

We need likely propose local stochastic/priority rule based on potential/resistance. Need decide "which cell receives next unit" possibly distributed locally. Need use only local info. We need design minimal local algorithm. Need discuss fairness and starvation. Need ensure no cell starves forever. We need be precise.

This sounds like cellular automaton/graph scheduling/resource allocation. Each cell has potential P_i and resistance R_i. Need choose next cell to compute. Local rule: each cell compares its own "urgency" u_i = P_i / R_i? Or potential divided by resistance? Higher potential, lower resistance means more deserving. But to decide globally, local algorithm maybe each cell checks if it has higher urgency than all neighbors; if so, it "wins" and consumes budget? But simultaneous? Need next unit singular. If multiple local maxima, conflict. We can break ties deterministically by IDs. But if every cell only knows neighbors, a cell can only know if it's local maximum. To decide global next unit without global view, need distributed protocol like token passing? Hmm.

Question: "Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

Maybe they want local rule: each cell computes "credit" = potential / (resistance + 1). It compares to neighbors. If its credit is at least all neighbors, it may take budget. But global conflict? In cellular graph, maybe "next unit" can be granted to any cell that is a local maximum. But if algorithm runs asynchronously and each cell decides independently, multiple cells can take simultaneously? The question says "decides which cell ... receives the next unit" singular. Maybe assume a central scheduler? But rule must use only cell and direct neighbors (no global view). Contradiction? Maybe the scheduler can be local: a token travels? Need design minimal local algorithm.

Could design a randomized local algorithm: Each cell, when it needs budget, asks neighbors? Or each cell with potential p and resistance r has probability p/(p+r) to request budget; neighbors pass? Need no global.

Let's parse wording carefully. "Lens: you are a teacher who explains by building one small piece at a time.

Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

Maybe from "cellular graph" each cell has potential and resistance. Need allocate "computation budget" to cells. We need local algorithm. "Fair" and "cannot starve forever." This might be like "self-organizing scheduling in cellular networks" where each cell has potential (queue length) and resistance (cost). Need choose next cell. Local rule: each cell computes priority = potential / resistance. It sends token to neighbor with highest priority? Hmm.

Maybe they expect: At each step, each cell keeps a "deficit" or "credit" counter. It increases by potential and decreases by resistance when served. A cell may serve if its deficit is greater than all neighbors. This is local and fair? Let's think.

We need design minimal local algorithm. We can introduce a "pressure" score S_i = P_i / R_i. To decide next unit, each cell checks its neighbors: if S_i > S_j for all neighbors j, it declares itself winner. If tie, use unique ID. But this only picks local maxima, not global. If every cell only checks neighbors, a local maximum can be winner even if not global. If multiple local maxima, conflict. Could use a token: only one cell has token; token moves to neighbor with highest S among current and neighbors? Wait token movement can choose next cell locally: current token holder compares its own score with neighbors, moves token to neighbor with highest score if neighbor's score > its own, else consumes budget at current cell? This is a local hill-climbing algorithm. It uses only current cell and direct neighbors. It decides next unit by moving token around. But can it starve? If scores fixed, token climbs to a local maximum and stays there forever, starving others. Unless scores update after service: potential decreases, resistance maybe changes. Then after serving, score drops, token can move elsewhere. This might be fair and no starvation if potentials regenerate or resistances adjust. Need incorporate.

Maybe "per-cell potential and resistance" perhaps potential is amount of work queued, resistance is cost to compute. Budget should go to cells with high potential and low resistance. If potential decreases when served, it's like scheduling. A local token algorithm: token at current cell i. It looks at itself and neighbors. It chooses the cell among {i} ∪ N(i) with largest urgency u = P / (R + ε) (or P - λR). If it chooses a neighbor, token moves there (no budget spent yet? or budget spent on move?). If it chooses itself, it consumes one unit of budget: P_i decreases by 1 (or by R_i?). Then repeat. This uses only local info. Fairness? If a cell has positive potential, its urgency eventually becomes high relative to neighbors? Need prove no starvation. But if a cell is surrounded by neighbors with always higher potential, token may never move to it? But as neighbors get served, their potentials drop. If potentials are replenished? Need assumptions. If potentials static positive, token may stay at a local maximum forever, starving lower potential cells. Unless resistance values change with waiting? To prevent starvation, need local aging: each cell's resistance decreases or potential increases while waiting. But the problem gives per-cell potential and resistance values; maybe they are dynamic? We can update them locally. Need design rule that cannot starve a cell forever. Need ensure fairness.

Maybe use "age" or "credit" accumulator. Each cell accumulates potential? Hmm.

Let's consider possible interpretations. The phrase "per-cell potential and resistance values" maybe from "cellular graph" where each node has potential and resistance. Need decide next cell for computation budget. Rule local. Fairness and no starvation. Could be a scheduling algorithm akin to "Gossip" or "token ring" with potentials and resistances. We need design minimal local algorithm.

Maybe we can propose: Each cell i has a local score q_i = P_i / (R_i + c_i), where c_i is a waiting counter (number of rounds since last served). At each step, a token moves to the neighbor (or stays) with the highest q. If the token stays, that cell gets the budget and c_i resets; all other c_j increment? But incrementing all others is global. Instead, each cell's waiting counter can increment locally each round when it does not receive budget. But how does it know it didn't receive budget? If token is local, only token holder knows? Could broadcast? Not local. Alternatively, each cell increments its own "debt" every time it is consulted? Hmm.

If we need only local info, we can have each cell maintain a local counter that increases every time it is not chosen by its neighbors? Maybe token passing: when token passes through a cell, if not served, its resistance increases (or waiting credit increases). The token visits cells via local hill-climbing. If a cell is never visited, it can't age. But token moving along local maxima might not visit all. Need guarantee.

Could design a deterministic local algorithm that cycles through all cells? For example, each cell has a token/pointer to one neighbor; when it receives budget, it passes the right to compute to its neighbor with highest urgency? That's global? If each cell points to neighbor, following pointers can cycle. But no starvation? Hmm.

Maybe a local algorithm: each cell, when it receives the token, compares its potential/resistance with its neighbors. If it has the highest "deficit" among itself and neighbors, it takes budget. Otherwise it forwards token to the neighbor with highest deficit. This is local. It may get stuck if deficits static. But if taking budget reduces potential, then repeated service to a cell lowers its deficit, so token moves on. This is like greedy local scheduling. No starvation if every cell has positive potential and service reduces it; but if potentials are constantly high for some cells, others may starve. Need fairness guarantee maybe via aging.

Let's define potential P_i as pending work (demand). Resistance R_i as cost/inertia. Budget unit should go to cell maximizing P_i/R_i. Local rule with token: token at cell i. Look at i and its neighbors. Pick cell j in {i}∪N(i) with maximal P_j/(R_j+1). If j ≠ i, move token to j. If j = i, grant budget to i, then set P_i ← max(0, P_i - 1) (or P_i ← P_i - R_i). This uses only local. Fair? If a cell never served, its P_i remains high. When token comes near, it will move toward it if its P/R is higher than neighbors. But if there is a local maximum elsewhere, token may never leave. But after serving local maximum, its P decreases; eventually it may become lower than neighbor, so token moves. This is like greedy descent on potential landscape? Actually token moves to higher P/R. Service reduces P at current, so token can move to other higher cells. Over time, if total potential finite, all positive cells get served. But if new potential arrives globally, maybe starvation? Need no starvation forever maybe assume potentials are positive and finite? The question doesn't specify dynamics. Could say under standard work-conserving assumption: each cell has at least one pending unit and service reduces its potential; if a cell is not served, its potential (or waiting credit) eventually surpasses all neighbors, so token must move toward it. But is that true? If neighbors also not served and have higher potential, token may serve them first. But eventually they drop. If potentials are replenished, a high-potential cell could continually grow? But budget units allocated to it keep it from growing? Need model.

Maybe we need design fairness by using resistance as "starvation avoidance": each time a cell is not selected, its resistance decreases? Or potential increases? Let's propose a local age counter that is updated only when cell is visited by token. But to guarantee no starvation, we need every cell visited eventually. A token moving to highest local score may skip cells. Could use a local random walk: token at cell i. It picks next cell among {i}∪N(i) with probability proportional to potential/resistance. If it picks itself, it gets budget. This is local. Fairness? Random walk on connected graph visits all cells infinitely often if it never stops? But it can stop and consume budget at current, then continue. Actually if token always moves with positive probability to every neighbor, it will visit all cells eventually. Then each cell can receive budget when token lands and chooses itself. But if scoring biases too strongly, some edges might have zero probability if neighbor score low? We can use ε-greedy: choose self with probability based on score, else choose uniformly random neighbor. That guarantees positive probability to move along any edge, so irreducible Markov chain on graph. Thus every cell visited infinitely often. And if when visited it has positive probability to be served (or if its potential high, higher chance), no starvation almost surely. But the question asks "decides which cell receives next unit" deterministic? Could be stochastic. "Fair" could be probabilistic. "Cannot starve forever" maybe almost surely. Minimal local algorithm: each cell computes priority, token performs biased random walk; when it stays, consumes budget. But that may not be "decides" singular? It does.

Alternatively, deterministic fair local algorithm: token does round-robin over neighbors? But need use potential/resistance. Could combine: token at i. If P_i/R_i > some threshold? Hmm.

Maybe the problem is from a specific context: "cellular graph" maybe "cellular automata" where each cell has potential and resistance. Need "minimal local algorithm" that decides which cell receives next unit of computation budget. It might be about "scheduling in a graph with local information" and "fairness/no starvation" is like "token-based local algorithm" using "potential/resistance" to route token. The rule must use only a cell and its direct neighbors. We can design a token that moves to neighbor with highest potential/resistance; if none higher, it serves current. To avoid starvation, ensure potential/resistance updated: if a cell waits, its resistance decreases (or potential increases). Then eventually it becomes attractive. But again token may not know about it until it gets there.

Let's think of formal graph G=(V,E). Each cell i has potential p_i and resistance r_i. Need assign next unit to a cell. A local rule can be: At any time, there is a single "budget token" at some cell. The token holder i compares its own value v_i = p_i / r_i (or p_i - r_i) with each neighbor's v_j. It moves token to the neighbor j with largest v_j if v_j > v_i; if no neighbor has greater value, it gives the budget to i, then updates p_i (e.g., p_i ← p_i - 1). This is deterministic and local. Fairness? If p_i decreases when served, a served cell's value drops. The token will eventually leave local maxima. But if there is a cycle of higher values, token may move around and never serve some low cell? Wait token only moves to higher value. It never moves to lower. So it only climbs to a local maximum, then serves it. After serving, its value may drop below neighbors, so token can move to a neighbor with higher value. But if all neighbors have lower value, it stays and serves again. It may serve the same local maximum until its value drops below some neighbor. Then it moves. But can it ever move to a cell that was initially lower? Yes, when current value drops below that lower cell's value. But if that lower cell also gets served? It only gets served when token reaches it and it is local max. The token follows gradient of values, never moves to lower. Could it get trapped in a region? Suppose two cells A and B. A value 100, B value 1. Token at A, serves A until value < 1, then moves to B. So B served eventually. Suppose A=100, B=99, C=1. Token at A, serves A until 98, then moves to B (since B=99 > A=98). Serves B until < A? Then moves back to A? But A is 98, B drops. It may alternate A and B while C=1 starves until A and B drop below 1. But if A and B have high potentials that are replenished? If finite, eventually C served. If potentials are constantly replenished? Suppose A and B have infinite work, always high, C has 1. Token may never leave A/B if service doesn't reduce below C. But if service reduces by 1, eventually A/B drop to 0, then C. If work arrives at A/B at same rate as service, their values stay high, C starves. To prevent starvation under arbitrary arrivals, need aging: C's resistance decreases or potential increases while waiting, so eventually C becomes higher. But if C's waiting state is local, can be updated. But token may not know until it reaches C? If C's value increases, token at A/B sees neighbors? Only direct neighbors. If C is not adjacent to A/B, token may not see it. It may be stuck in a local max region where all neighbors have lower values. C's value could become huge, but token cannot see it. So local rule cannot guarantee unless token explores.

Thus deterministic greedy token with only direct neighbor comparisons cannot guarantee no starvation on arbitrary graph if values of distant cells don't affect local comparisons. Need random walk or token circulation to ensure visits all cells. Then local aging works.

So a robust design: token-based local algorithm with ε-greedy random walk + aging. It uses only local info. Fair and no starvation almost surely. But user asks "minimal local algorithm" maybe wants simple. Could design: Each cell i maintains a score s_i = p_i / (r_i + w_i), where w_i is waiting time since last service. At each step, the token at i chooses the next cell among {i}∪N(i) with probability proportional to s_j (or highest score with ε exploration). If it chooses i, i gets budget and w_i=0, p_i←p_i-1; all other cells increment w? But that's not local. Alternatively, w_i increments only when token visits i and doesn't serve it? That doesn't reflect waiting. Or each cell can increment its own w_i every time step locally without global synchronization? In distributed system, each cell can have a local clock; it increments w_i each time it is not served. But how know not served? It can increment every step; when served, reset. If all cells increment every step, that's local per cell (no global view) but requires synchrony. The token doesn't need to know all; when it compares, it reads neighbors' w. That's allowed: cell and direct neighbors. So we can have each cell maintain w_i (waiting time) locally, increment each step. When token at i, it reads its own and neighbors' p,r,w, computes score. It moves to highest score (or random). If it stays, i served, w_i=0, p_i decreases. Other cells just continue incrementing w. This is local? Each cell increments its own w every step; no global view. The decision uses only i and neighbors. This can guarantee no starvation if token eventually reaches every cell. If token uses ε-greedy exploration, it will visit all. Aging ensures when token arrives, a long-waiting cell has high score, so likely served. Actually if token arrives at a cell that hasn't waited much but neighbor has huge score, it may move there. But random walk visits all; a starved cell's score grows without bound, so when token enters its neighborhood, it will be chosen and served. Thus no starvation almost surely.

But maybe too complex. We can simplify: Use a token that does a random walk with bias toward high potential/resistance, and when it stays, it allocates budget. Because random walk is irreducible, every cell is visited infinitely often. To prevent starvation, add aging: if a cell is visited but not served, its resistance decreases (or its priority increases). Then eventually it is served when visited. Actually if random walk visits infinitely often, even without aging, if the rule at cell i has positive probability to serve itself, then every cell gets served infinitely often almost surely. For example, token at i: with probability 1/2 stay and serve i, with probability 1/2 move to uniformly random neighbor. This ignores potential/resistance. Add bias: choose stay with probability proportional to p_i/r_i, and move to neighbor j with probability proportional to p_j/r_j, but ensure ε probability to move to any neighbor. Then every cell has positive probability to be served when token is there. Since random walk visits all cells infinitely often, no starvation almost surely. Fairness: long-run service rate proportional to potential/resistance? If bias proportional, stationary distribution of token is proportional to score, so service rate at i ∝ score_i? Actually if token at i, it stays with probability proportional to s_i, moves to j with probability proportional to s_j. The transition matrix might have stationary distribution π_i ∝ s_i. Then service rate at i = π_i * P(stay at i) = π_i * (s_i / sum_{i∪N} s) not exactly s_i. But fairness in sense higher potential/lower resistance gets more. And no starvation due to positive exploration.

But question says "given per-cell potential and resistance values" not waiting time. Maybe we can design deterministic local rule: "At each step, every cell compares its potential/resistance with its neighbors. A cell is eligible if its value is a local maximum. Among eligible, a token moves to one and allocates." But global selection of one among local maxima needs coordination. Could use token.

Let's search memory: There is a concept "cellular graph" and "potential/resistance" maybe from "cellular computing" or "ambient networks"? "computation budget" maybe "Turing machine" cells? "per-cell potential and resistance" might be from "artificial chemistry" or "cellular automata" with "potential" and "resistance" deciding which cell fires next. Local algorithm to decide next cell. Fairness and starvation. Could be from a paper? The question likely from an interview or open-ended. We need provide a design and rationale.

Let's outline possible answer:

1. Model: Graph G, each cell i has potential p_i ≥ 0 (how much it wants/needs budget) and resistance r_i > 0 (how hard it is to compute). Define urgency u_i = p_i / r_i. Higher p, lower r => more urgent.

2. Local rule: A single budget token walks the graph. Token at cell i. It looks only at i and N(i). Compute u_j for j ∈ {i}∪N(i). Choose next cell j:
   - With probability ε (small), choose uniformly from N(i) (or stay?) to explore.
   - Otherwise, choose j maximizing u_j; ties by cell ID.
   If chosen j = i, allocate the unit to i: p_i ← max(0, p_i - 1) (or p_i ← p_i - r_i). If j ≠ i, just move token to j (no budget spent yet). Repeat.

This is minimal and local: each step requires only neighbor comparisons. It can be implemented without global view.

Fairness: The ε-random exploration makes the token an irreducible Markov chain on the connected graph if ε>0. Thus every cell is visited infinitely often. When visited, it has a nonzero chance to be chosen (either by being local max or via ε stay/exploration). So every cell gets budget infinitely often in the limit. Long-run allocation is biased toward high p/r cells because most moves follow urgency. So it is fair in the sense of no permanent exclusion plus proportional attention.

No starvation: Suppose cell c not served. Since token visits c infinitely often, each time it is at c, if c has positive potential, it has a positive probability (at least ε/degree or if it becomes local max due to aging) to be selected. If we add aging (waiting credit), then by the time token returns, c's urgency has grown, so it will be selected even more. Thus probability of never being served after infinitely many visits is zero. Deterministically with aging and forced exploration, if token visits c and c's urgency exceeds all neighbors, it will serve; since urgency grows without bound while waiting, eventually it exceeds neighbors when token is at c. But token may not be at c at that moment. However random walk visits c infinitely often, and once urgency is huge, the next visit will serve. Therefore no starvation almost surely. For deterministic no starvation, we can use a round-robin exploration counter: token cycles through neighbors? But that's more complex.

But the question asks "cannot starve a cell forever" not "almost surely". Maybe they expect a deterministic argument. We can modify to deterministic fair: Use a token that at each step moves to the neighbor with highest urgency, but if it has not served itself for too long, it forces service. However "too long" local? Each cell can have a counter. When token arrives, if counter > 0, it serves. But token might never arrive. Need deterministic exploration. Could use token that does a depth-first traversal? But requires memory of global graph. Not local. Random is easiest for probabilistic no starvation.

Maybe we can design deterministic local algorithm using "leaky bucket" or "deficit round robin" where each cell's resistance decreases with waiting; token moves to highest urgency among neighbors. If graph is connected and token follows gradient, can it starve? As argued, if a cell's urgency grows without bound, but token is stuck in a local maximum region where all neighbors have lower urgency. However if the starved cell is not adjacent, token can't see it. But if its urgency grows, how does token leave local region? The local region's cells also have growing urgency if they wait? Actually if token serves them, their urgency resets. The starved cell's urgency grows. But token cannot see it until it reaches a neighbor. The token only moves to higher urgency among neighbors. If all neighbors of current cell have lower urgency, token stays and serves current. After serving, current urgency drops. Then token may move to neighbor with higher urgency. But if all neighbors have lower urgency, it stays. It may serve current until current urgency drops below all neighbors. Then it moves to the neighbor with highest urgency. So token can move to any neighbor if current drops enough. It can eventually traverse to any cell if every cell's urgency becomes high when not served. But consider a cell A that is served often, so its urgency stays moderate. Its neighbor B is never served, so B's urgency grows. When token at A, B is a neighbor. If B's urgency > A's, token moves to B. So B gets served. Thus no starvation. The token will move toward any waiting cell that is adjacent to a served cell. Since graph connected, eventually it can reach all. This suggests deterministic local rule with aging works: urgency u_i = p_i / r_i + w_i (waiting time). Each cell increments w_i when not served. Token at i moves to neighbor with highest u if higher than own, else serves i and resets w_i. Because a starved cell's u grows unbounded, it will eventually exceed its neighbors and attract token. But what if token is not at a neighbor? It will propagate through graph: as the starved cell's high urgency makes its neighbor's neighbor not necessarily high? Wait token at A, neighbor B not starved, neighbor C starved. C's high urgency doesn't affect B's urgency unless B is not served. But B may be served often, so its urgency low. Token at A sees B's low urgency, not C's high. So it won't move toward C. C's high urgency only visible to B. But token may never go to B because B's urgency is low. So C can starve even though its own urgency is high, because token doesn't see it. This is the key. Local gradient only sees immediate neighbors; a high value at C doesn't propagate to A unless B also has high value. B is served, so B's value low. Thus token won't move from A to B. So deterministic greedy with aging can starve distant cells if intermediate cells are kept low by frequent service. To prevent, need exploration or ensure urgency propagates via B not being served. But B is served because token is at A? Actually token at A, B is neighbor. If B's urgency is low, token stays at A. C's high urgency never affects B because B is not waiting. So C starves. Thus deterministic greedy local token can starve. Need random exploration or a "pressure" that propagates. Local rule cannot propagate high urgency through served cells unless those cells also have high urgency. So no deterministic guarantee without exploration.

Thus random exploration is necessary for no starvation with only local info. We can state that.

Alternatively, we can design a local algorithm that uses a "ring" or "token" that visits all cells in a fixed local traversal. But without global view, can we guarantee visiting all? A random walk does. Deterministic local traversal of unknown graph that visits all nodes? Each node only knows neighbors. A token can do a deterministic walk that explores all nodes if it remembers where it came from? But with only local info, a token can do a depth-first search if it has memory of visited edges? But the rule must use only a cell and its direct neighbors. The token could carry state. But the algorithm might be more complex. The question says "minimal local algorithm" so random walk is minimal.

Maybe the expected answer is simpler: Use "local voting": each cell computes priority = potential / resistance. It asks neighbors for their priorities. If its priority is highest among itself and neighbors, it takes the budget. If two adjacent cells both think they're highest, they compare IDs. This is local. Fairness? Because potentials/resistances change after budget, eventually all cells get a chance. But as argued, local maximum can starve others if not global. However if every cell can be a local maximum? The algorithm only decides among a cell and its neighbors, not global. But the question says "decides which cell ... receives next unit" maybe it doesn't require unique global; maybe in cellular graph, each cell's local decision is enough because only one cell will be eligible? Not necessarily.

Let's re-read: "Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

It might be a trick: No such algorithm can guarantee both fairness and no starvation with only local information if potentials/resistances are static. Because local decisions cannot see global state; a cell could be isolated by a wall of higher potential neighbors. To guarantee fairness, need either randomization/exploration or global coordination. The question asks "Design a minimal local algorithm..." so likely expects a specific algorithm, maybe with randomization.

We can answer: Design a token-based ε-greedy local scheduler with aging. Explain fairness and no starvation. But we need be careful: "cannot starve a cell forever" under what assumptions? If potentials are static, even random walk with ε exploration can starve? If token at i, with ε probability move to random neighbor, eventually visits all. When at a cell, if it always chooses highest urgency among neighbors, it may not serve a low urgent cell if a neighbor is higher. But if the low urgent cell is visited, it may be chosen only if its urgency is highest among itself and neighbors. If it has a neighbor with higher urgency, token moves there. That neighbor might be served, dropping its urgency. Eventually the low cell can be served. But if the neighbor's urgency is replenished externally, it may always be higher. To guarantee no starvation, we can include aging: each cell's urgency increases while not served. Then when token visits, eventually it will be highest. But if token visits and moves away because neighbor higher, the cell's urgency increases. Next visit, it might still be lower, but eventually exceeds. So it will be served. This is almost sure. Under static positive potentials, without aging, if a cell has zero potential, it doesn't need service. If all cells have positive potential and service reduces potential, then eventually all served. If potentials are replenished arbitrarily, aging ensures no starvation.

But wait: if token uses ε-greedy and at cell i, it chooses max among i and neighbors. Suppose i has a neighbor j with higher urgency. Token moves to j. j gets served, its urgency drops. Token may return to i later. If i's urgency hasn't grown enough, it may move to j again if j replenished. With aging, i's urgency grows each step. j's urgency may be reset when served. So eventually i's urgency > j. So i served. This is local. Good.

But if token is not at i, i's urgency grows. When token eventually reaches i's neighborhood, it will see i's high urgency from a neighbor? Actually token at neighbor k of i sees i's urgency and moves to i if i highest. So i served. Thus aging plus random walk ensures no starvation.

Let's formalize the algorithm:

- Each cell i stores:
  - p_i: potential (work demand)
  - r_i: resistance (cost)
  - w_i: waiting age (initialized 0)
- Define local score s_i = (p_i + α w_i) / (r_i + β) or simply s_i = p_i / r_i + w_i. We want higher potential, lower resistance, longer wait.
- A single budget token is at some cell. (If no token, initialize arbitrarily; graph connected.)
- At each step, token at cell i:
  1. Read s_i and s_j for all j ∈ N(i).
  2. With probability ε (small, e.g., 0.05), choose uniformly among N(i) ∪ {i} (or among N(i) then maybe stay).
  3. Otherwise, choose the cell j in N(i) ∪ {i} with maximum s_j; ties broken by unique ID.
  4. If j = i, allocate one unit of budget to i:
       p_i ← max(0, p_i - 1)   (or p_i ← max(0, p_i - r_i) if resistance is cost)
       w_i ← 0
     (If p_i becomes 0, it can still be visited but has low priority.)
     If j ≠ i, move token to j (no allocation yet).
  5. Every cell increments its own w_i by 1 each round (or only when not served; since served resets, the effect is the same if we increment all and reset on service).

Wait: If every cell increments w_i each round, then when token at i, it reads neighbors' w. That's local. But in a distributed system without global clock, each cell can increment its own w_i at each local tick. The token's decision uses current values. That's fine.

But fairness: The ε exploration ensures the token's position is an irreducible Markov chain on the graph. Therefore it visits every cell infinitely often. When it is at a cell i, i has probability at least ε/|N(i)+1| to be chosen (if we include i in uniform choice), regardless of scores. So i is served infinitely often almost surely? Wait if ε choice includes i, then when token at i, it can choose i and serve. If token visits i infinitely often, then with probability 1, eventually it will choose i via ε. So every cell served infinitely often almost surely, even without aging. Actually yes! If ε>0 and uniform choice includes self, then whenever token is at i, there is a positive probability to serve i. Since token visits i infinitely often, the probability of never serving i is zero. So no starvation almost surely. Fairness in long-run: service rate at least ε/degree times visit rate. But visit rate may be non-uniform. With ε-greedy, the chain is irreducible and positive recurrent, so all cells positive recurrent. Thus every cell gets positive share. The score guides the rest of the probability, so high urgency cells get more.

This is very clean. We don't even need aging for no starvation, only for fairness in the sense of preferential treatment to high potential/low resistance. But if we want deterministic no starvation, randomness gives almost sure. The question says "cannot starve a cell forever" maybe acceptable as almost surely. But maybe they want deterministic. Could mention "with probability 1" and add aging to make it stronger.

But the question says "Design a minimal local algorithm that decides which cell receives the next unit of computation budget". If we use random exploration, the decision is random. Is that allowed? It doesn't say deterministic. "Fair" might imply probabilistic fairness. We can state it.

Alternatively, we can design a deterministic local algorithm using a "deficit counter" that is not token-based but each cell decides if it should receive budget based on neighbors. But to avoid starvation, we can use "round-robin among local maxima" with a circulating token. Hmm.

Let's consider if there is a known "minimal local algorithm" for this: "At each step, each cell with the highest potential/resistance among its neighbors and itself requests the budget. If two adjacent cells both have highest, the one with lower ID wins. The budget goes to the winner. After receiving, its potential decreases by 1. If no cell wins, increase all potentials." This is local. Fairness? Not necessarily. Could starve a cell with low potential if surrounded by high potential that are constantly replenished. But if potentials are not replenished, eventually it gets. The question might assume potentials are fixed? "given per-cell potential and resistance values" maybe they are static properties. Then budget should be allocated to cells with high potential/resistance. But if static, any cell with low potential might never get budget, which is fair? Maybe fairness means proportional to potential/resistance? Starvation of low potential is acceptable? But they ask "cannot starve a cell forever" so all cells must eventually get some. So potentials must change or aging.

Maybe the problem is from a class on "fair scheduling in cellular automata" where each cell has potential and resistance. The algorithm might be: "Each cell has a counter. When its counter exceeds resistance, it sends a request to the neighbor with highest potential. The cell that receives the budget decreases its potential." Not sure.

Let's think of a simple local rule that is fair and starvation-free without randomness: Use a token that moves to the neighbor with the highest "potential - resistance" but if no neighbor has higher, it serves itself. To avoid starvation, when a cell serves, its potential is set to 0, and all neighbors' potentials increase by 1? But increasing all neighbors is local (the cell can notify its neighbors). This is like "negative feedback" that spreads. For example, when cell i is served, it sets p_i=0 and increments p_j for all neighbors j. Then a served cell becomes unattractive, and its neighbors become more attractive. This can create a token that moves around, never stuck. This is local and deterministic. Fairness? If a cell is never served, its potential doesn't increase from its own service, but it may increase when neighbors are served. If neighbors are served often, the cell's potential grows. Eventually it becomes high and attracts token. This could prevent starvation. Let's explore.

Algorithm:
- Each cell i has potential p_i and resistance r_i. Define priority u_i = p_i / r_i (or p_i - r_i).
- There is a token at cell i.
- At each step, token chooses among i and neighbors the cell with highest u. If it chooses i, i receives budget. Then update: p_i = max(0, p_i - 1). To prevent starvation, when i is served, it sends a "credit" to all neighbors: p_j ← p_j + 1 (or some fraction). This is local (i can update its neighbors). Thus cells that are near a served cell get more potential, eventually attracting token. But if i is served repeatedly, its neighbors' p increase. Eventually a neighbor's u exceeds i's, so token moves. This is like "negative feedback" or "leaky bucket" that ensures fairness. But if a cell is isolated? Graph connected. If a cell is never served, its neighbors may be served and will increase its potential. So its potential grows, eventually it gets served. This is deterministic and local. Could be a nice minimal algorithm.

Let's test: Graph path A-B-C. Token at A. p_A=10, p_B=1, p_C=1. A served repeatedly. Each service, B's p increases by 1. After 10 services, B's p=11 > A's p=0? Actually A's p decreases by 1 each service. So A's p drops. B increases. Eventually B's u > A's, token moves to B. B served, increases A and C. C increases. Eventually C gets served. So no starvation. If A's potential is replenished externally at high rate, A's p stays high, but B's p also increases when A served? Wait if A served, B increases. So B's p grows. A's p is replenished, so A's p might stay high. B's p grows without bound if A served forever. Then B will eventually exceed A, token moves to B. B served, increases C. C grows. So even if A is constantly replenished, B and C get served. This seems to prevent starvation. But what if A is not served? Then token moves to whichever has highest. If C is starved, its neighbors B might be served and increase C. So C's potential grows. Eventually it attracts token. This is a local algorithm that propagates "pressure" from served cells to neighbors. It might be fair and no starvation.

Let's formalize: Token at cell i. It looks at itself and neighbors. It computes priority s_j = p_j / (r_j + 1) (or p_j - r_j). It moves to the neighbor j with highest s_j if s_j > s_i; if no neighbor has higher, it serves i. After serving i:
- p_i ← max(0, p_i - 1)
- For each neighbor j of i: p_j ← p_j + δ (e.g., δ=1) (or p_j ← p_j + 1/deg(i) to conserve budget? Not necessary for fairness).
This uses only local info: i knows its neighbors. The update is local to i and its neighbors. It doesn't need global view.

Fairness: Every time a cell is served, it passes a "waiting credit" to its neighbors. If a cell c is never served, consider its neighbors. If any neighbor is served, c's potential increases. If no neighbor is ever served, then c is in a disconnected component? Since graph connected, eventually a neighbor must be served? Wait if c is never served, maybe its neighbors are also never served. Then the token is stuck somewhere else. But if the token is stuck at some local maximum, it serves that cell repeatedly. That cell's neighbors get credits. So credits spread outward from served cells. Thus eventually c's potential increases. If c's potential increases without bound, when token is at a neighbor of c, it will move to c. But how does token get to a neighbor of c? The credits spread from served cell to its neighbors, increasing their potential, so token moves to them, then to their neighbors, etc. So the token will eventually reach c. This is like a wave. No starvation.

But is it guaranteed? Consider a cell c that is never served. Its potential increases whenever a neighbor is served. If no neighbor is ever served, then c's potential doesn't increase. But if no neighbor is ever served, then the token never visits them. Could the token be confined to a set S not including c or its neighbors? If S is a local maximum, cells in S are served, and they pass credits to neighbors. Those neighbors include cells outside S. Their potential increases until they exceed the served cells in S, then token moves to them. So the served set expands. By induction, the token will eventually reach every cell in the connected component. Thus no starvation. This is a deterministic local algorithm with no randomness. It might be the intended solution? But the question says "given per-cell potential and resistance values" and "minimal local algorithm". Maybe this is more complex than needed.

Let's think of "potential and resistance" in a cellular graph. Perhaps "potential" is like charge, "resistance" is like edge weight? The algorithm might be: "At each step, each cell with the highest potential/resistance ratio among its neighbors and itself gets the budget. If a cell receives budget, its potential decreases by 1. If a cell does not receive budget, its potential increases by 1." This is local aging. But as argued, a distant starved cell's potential increases, but token may not see it. However if all cells increase potential when not served, then the starved cell's high potential is local, but its neighbors also increase if not served. If neighbors are served, their potential resets. So the starved cell's high potential doesn't propagate. But if the token is at a neighbor, it sees the starved cell's high potential and moves there. So the token must reach a neighbor. If the token is stuck in a local maximum, it serves that cell, resetting its potential. The starved cell's potential grows. But the token's neighbors have low potential because they are served? Actually if token is at A, and B is neighbor, B is not served (since token at A). So B's potential increases every step. Eventually B's potential > A's, token moves to B. Then B is served. Then C's potential increases. So the token moves along the path to the starved cell. So aging alone (without credit passing) might work if every unserved cell's potential increases. But wait: if token is at A, and B is neighbor, B is not served, so B's potential increases. Yes! I previously thought B's potential low if B served often, but if token is at A, B is not served. So B's potential increases. Eventually B becomes more attractive than A, token moves to B. Then C (neighbor of B) has been increasing all along. When token at B, C's potential may be high, so token moves to C. Thus the token can propagate toward any cell that has not been served? Actually if token stays at A for a while, B's potential grows. So token leaves A to B. Then C's potential has been growing since B was not served? Wait C is not served regardless of token, so C's potential grows continuously. So when token reaches B, C's potential is already high, so token moves to C. Thus the token will move to the cell with the highest potential in the graph? Not globally, but because potential increases with waiting, the token will move to the neighbor with the highest potential, which may be the one that has waited longest. But if a cell is served, its potential resets. So the token will tend to visit cells that have waited longest. This is like a local greedy scheduler with aging. Does it guarantee no starvation? Let's analyze.

Algorithm: Each cell i has potential p_i. At each step, token at i. It compares p_i with neighbors p_j. It moves to neighbor with highest p_j if p_j > p_i; else serves i and sets p_i = 0 (or p_i -= 1). Every cell not served increments p_i by 1 each step.

Suppose cell c is never served. Its potential p_c grows by 1 each step. Its neighbors: if they are not served, their potentials also grow. If they are served, their potentials reset. But can c's neighbors be served without c being served? Yes, token could be at neighbor b and serve b, resetting b. Then b's potential is low. Token might stay at b and serve b repeatedly? But if b is served, its potential resets to 0. Then c's potential is high. When token at b, it sees c's high potential and moves to c. So c would be served. Thus if c is never served, its neighbors cannot be served either? Wait if token at b, and c is neighbor with high potential, token will move to c (if c's potential > b's). Since c's potential grows, eventually it exceeds b's. So b cannot be served indefinitely without c being served. So c's neighbors are not served often. Therefore c's potential and its neighbors' potentials all grow. The token will move toward the region with highest potential. Since c has the longest waiting time, its potential is highest, so token will eventually reach c. This seems plausible.

But consider a cycle: A-B-C-D-A. Suppose token at A. p_A=0 (just served), p_B=10, p_C=10, p_D=10. Token at A sees B=10, moves to B. Serves B, resets B=0. Then token at B sees C=10, moves to C. Serves C, resets C=0. Then token at C sees D=10, moves to D. Serves D, resets D=0. Then token at D sees A=0? Actually A has been unserved since start, so A's potential increased to 3? Token at D sees A=3, moves to A. Serves A. So all get served. Fair.

What if token at A, p_B=0, p_C=100, p_D=0. A sees B=0, stays and serves A repeatedly. But B is not served, so p_B increases. After a few steps, p_B > p_A (which resets to 0 each service). Token moves to B. Then B sees C=100, moves to C. Serves C. So C gets served. So no starvation.

It seems a simple local rule with aging might work: each cell's potential increases while waiting. The token moves to the neighbor with the highest potential; if none higher than itself, it serves itself and resets its potential. This is like a "greedy walk" on a dynamically updated potential field where service resets potential and waiting increases it. Because waiting increases potential, the token will eventually move to any cell that has waited longer than its neighbors. Since the graph is connected, the token will traverse the graph, serving the cell with the locally maximal waiting time. This is akin to "ant colony" or "token ring" with aging. It cannot starve a cell because if a cell is not served, its potential grows without bound, eventually becoming the highest in its neighborhood. The token, wherever it is, will follow increasing potentials. But could the token be trapped in a local maximum that is not the starved cell? If the starved cell has higher potential, then any neighbor of the starved cell has lower potential (unless they also waited). The token will eventually reach that neighbor and then move to the starved cell. How does it reach the neighbor? The neighbor's potential may be lower than the starved cell, but it may still be higher than its other neighbors if it has waited. If the neighbor is served often, its potential resets, so it may not attract the token. But if the neighbor is served, then the token is at the neighbor, and it will see the starved cell's high potential and move to it. So the starved cell cannot be skipped. Thus no starvation.

Wait, if the neighbor is served, the token is at the neighbor. It sees the starved cell's high potential and will move to it (unless the neighbor's own potential is higher, but it just served, so reset). So the starved cell gets served. Therefore a starved cell can only be starved if its neighbors are never served. But if its neighbors are never served, their potentials also grow. The token will eventually move into that region. By induction, the token will reach the starved cell. This seems a valid deterministic local algorithm.

But the question mentions "given per-cell potential and resistance values". In this aging algorithm, we use potential as dynamic waiting credit. But the problem gives per-cell potential and resistance values. Maybe potential is already the waiting credit? Or resistance is the threshold for service? Let's incorporate resistance: The rule should use both potential and resistance. We can define priority s_i = p_i / r_i. The token moves to neighbor with highest s_i. If none higher, it serves itself. When served, p_i decreases by 1. When not served, p_i increases by 1? Or resistance decreases? Actually if potential is fixed, resistance could be the aging factor? Hmm.

Let's re-read: "given per-cell potential and resistance values." So each cell has a potential and a resistance. The algorithm should decide which cell gets next budget. The rule must use only a cell and its direct neighbors. Explain why the rule is fair and why it cannot starve a cell forever.

Maybe the intended rule is simply: "Each cell computes its priority as potential/resistance. If its priority is greater than all its neighbors, it takes the budget. Otherwise it waits. Since the cell with the highest potential/resistance among its neighbors is chosen, and after receiving budget its potential drops, the next highest will be chosen. This is fair and no starvation." But as I argued, this is not globally fair if there are multiple local maxima. However in a cellular graph, maybe the algorithm is run in parallel: every cell that is a local maximum receives budget? But "next unit" singular. So no.

Maybe the graph is a tree? In a tree, local maxima might be multiple. No.

Maybe the question is from a context where "cellular graph" means a graph where each cell is connected to all others? No, that's complete graph. If complete, direct neighbors are all cells, so local view is global. But "cellular graph" likely means a grid where each cell has neighbors.

Let's search my memory: There is a concept in "cellular learning automata" or "cellular graph" where each cell has "potential" and "resistance". A local algorithm for "fair scheduling" might be: "Each cell has a potential. It sends a token to the neighbor with the highest potential/resistance. The token moves until it reaches a local maximum, which gets the budget. Then its potential is reduced. To prevent starvation, add a small random perturbation." This is exactly the token-based local search.

Given the user's phrasing, they want an explanation "why the rule is fair and why it cannot starve a cell forever." This suggests the rule should have a mechanism that ensures fairness and no starvation. The token with aging or random exploration is a good candidate.

Let's design a clear, minimal local algorithm. We can present it as a token-based scheduler. We'll define:

- Each cell i has potential P_i and resistance R_i.
- Define urgency U_i = P_i / (R_i + 1). Higher means more deserving.
- There is a single budget token. It starts at any cell.
- To decide the next unit, the token at cell i looks only at i and its direct neighbors N(i).
- It picks the cell j in {i} ∪ N(i) with the highest urgency U_j. Ties broken by a fixed local rule (e.g., smallest ID).
- If j ≠ i, the token moves to j and repeats (no budget spent yet).
- If j = i, then i receives the budget. Update P_i ← max(0, P_i - 1). Then the token stays at i for the next decision.

This uses only local info. But as argued, it can starve cells if there are multiple local maxima and one is constantly replenished. To prevent starvation, add a local aging term: each time a cell is not served, its resistance decreases or its potential increases. For minimal, we can say: replace U_i by P_i / (R_i + W_i) where W_i is a waiting counter that increases by 1 each step the cell is not served, and resets to 0 when served. Now the token will eventually move toward any long-waiting cell.

But wait: If the token is at i, it only sees neighbors' W. If a distant cell has high W, it won't matter until the token reaches its neighbor. As argued, the token will move to neighbors with higher urgency. If a neighbor is not served, its W increases, so it will eventually attract the token. Thus the token will propagate. This is a deterministic local algorithm with aging. We can explain no starvation with a "potential well" argument: If cell c is never served, its waiting counter W_c grows without bound. Consider the set S of cells that are served infinitely often? Actually if c is never served, then its neighbors cannot be served infinitely often without eventually serving c, because when the token is at a neighbor, c's urgency will eventually exceed all others. More formally, suppose c is never served. Since W_c → ∞, eventually U_c > U_j for all j adjacent to c. If the token ever visits a neighbor of c, it will move to c and serve it. So the token must never visit any neighbor of c after W_c becomes large. But the token moves on a connected graph. If it never visits a neighbor of c, it is confined to a set S not containing c. Consider the boundary of S: there is an edge from a cell in S to a neighbor of c (or to c). Let a be a cell in S adjacent to b outside S. Since a is in S, it may be served. But b is not served (otherwise token would visit? Actually b is neighbor of c, if b served then c served? Not necessarily, but if b is served, token at b sees c and moves to c. So b cannot be served after W_c large). Thus b is not served, so W_b → ∞. Since a is adjacent to b, when token is at a, b's urgency eventually exceeds a's, so token moves to b. Then b moves to c. Contradiction. Thus c cannot be starved. This is a solid deterministic proof.

But this proof assumes that if b is not served, its W_b grows. Yes. And if b is served, then token was at b, so c would be served. So c never served implies no neighbor of c is ever served after some time. Then by induction, no cell at distance 1 from c is served, then no cell at distance 2, etc. If graph connected, no cell is served, contradiction because token must serve something. Thus c must be served. This is a nice proof. It shows no starvation for any cell in a connected graph.

Let's refine the algorithm with aging. We need to specify how waiting counter is updated locally. Each cell i has W_i. It increments W_i by 1 every time step (or every decision) unless it receives budget, in which case W_i ← 0. This can be done locally without global view: each cell just increments its own counter every clock tick. When the token is at i, it reads W_i and W_j for neighbors. That's allowed.

But the question says "given per-cell potential and resistance values." We can use W_i to modify resistance: effective resistance R_i' = R_i + W_i (or R_i / (1+W_i)). Or modify potential: P_i' = P_i + W_i. Let's define urgency U_i = (P_i + W_i) / R_i. Higher potential, lower resistance, longer wait. Or U_i = P_i / (R_i + W_i) if resistance increases with waiting? Actually we want a cell that waits longer to become more attractive, so we should increase its potential or decrease its resistance. Let's use U_i = (P_i + W_i) / R_i. When served, W_i = 0. This is simple.

Algorithm steps:
1. Each cell i maintains P_i, R_i, W_i.
2. At each decision tick, every cell increments W_i by 1 (or only when not served).
3. A single token at cell i.
4. Token reads U_i and U_j for j ∈ N(i).
5. It selects j ∈ {i} ∪ N(i) with maximum U_j (ties by smallest ID).
6. If j = i, allocate budget to i: P_i ← max(0, P_i - 1); W_i ← 0. If j ≠ i, move token to j.
7. Repeat.

This uses only local info: step 4 uses i and neighbors. Step 2 is local per cell. Step 6 is local to i. The token movement is local.

Fairness: Over time, cells with higher P/R (and longer waits) are chosen more often. The waiting term ensures that a cell that has not received budget recently becomes more urgent, so it will eventually be chosen. This balances service across cells. In the long run, no cell is permanently ignored; every cell gets service. The exact fairness can be described as: the algorithm approximates proportional fairness to P_i/R_i, with an aging correction that prevents starvation.

No starvation proof: Suppose cell c is never served. Let W_c grow unbounded. Consider the set of cells that are served infinitely often. If c is not served, then its neighbors cannot be served infinitely often, because whenever the token is at a neighbor, W_c will eventually dominate and pull the token to c. More formally, for any neighbor b of c, once W_c > max_{j∈N(b)} (P_j + W_j)/R_j * R_c - P_c, the token at b will move to c. So b can be served at most finitely many times after that. By induction along paths from c, no cell in the connected component can be served infinitely often. But the token must serve some cell at each step (when it stays). So at least one cell is served infinitely often. Contradiction. Therefore c is served infinitely often. This proves no starvation.

Wait: The token might move forever without serving? No, if it moves to a neighbor with higher U, it eventually reaches a local maximum (since U values are bounded? But W increases, so U can increase. Actually if all cells' W increase, the token may keep moving to the one with highest U among neighbors. Since U values change, it could move indefinitely without serving? But if it moves to a neighbor with higher U, that neighbor's U might later be exceeded by another. However the token only moves to higher U at the moment. It could cycle if U values change? For example, A and B alternate being higher because W increases. But if token at A, B's W increases, so B's U increases, token moves to B. Then A's W increases, token moves back to A. It could oscillate without serving? But when token is at A, if it doesn't serve, A's W doesn't reset. Actually W increases for all cells regardless. So if token moves from A to B, A's W continues increasing. When token at B, A's U might become higher than B's, so token moves back to A. This could happen indefinitely? Let's simulate: A and B, both P=0, R=1. W_A=0, W_B=1. Token at A: U_A=0, U_B=1 -> move to B. Now W_A increments to 1, W_B=2? Wait at each tick, all W increment. Let's say after moving to B, tick: W_A=1, W_B=2. Token at B: U_B=2, U_A=1 -> stays at B? Actually it compares B and A. U_B=2 > U_A=1, so it serves B. So it serves. If W_A was higher, it would move back. But since W_B was higher when token arrived, and W_B continues to increase, it stays. Actually if token moves to the cell with higher U, that cell's U is higher. After moving, all W increment equally. The difference in W remains constant. So the higher cell remains higher until it is served and resets. Thus the token will serve the local maximum. It won't oscillate because the relative order of U among neighbors doesn't change unless a service resets W. So the token will reach a local maximum and serve it. Then that cell's W resets, its U drops, and the token moves to another. So the algorithm is well-defined.

Let's verify: Suppose A and B. Token at A. U_A=0, U_B=1. Move to B. Now W_A=1, W_B=2 (since tick). Token at B. U_B=2, U_A=1. B is max, so serve B. W_B=0. Next tick: W_A=2, W_B=1. Token at B. U_B=1, U_A=2. Move to A. Token at A. Tick: W_A=3, W_B=2. U_A=3 > U_B=2, serve A. So they alternate. Fair.

So the algorithm works.

Now, is this "minimal"? We have a token, a waiting counter, and a local comparison. That's fairly minimal. We can also omit waiting counter if we assume potentials are dynamic and service reduces them. But to guarantee no starvation, we need aging. We can present the waiting counter as part of the algorithm.

Alternatively, we can use randomization instead of aging. Which is simpler? Random walk with ε-greedy is also minimal: just a token that moves randomly with bias. No need for waiting counters. But the question says "given per-cell potential and resistance values" and asks to explain fairness and no starvation. A random walk with ε-greedy uses only potential/resistance, no aging. It is fair and no starvation almost surely. But "cannot starve forever" might be interpreted as deterministic. The aging algorithm gives deterministic no starvation. I think the aging algorithm is better because it directly addresses starvation deterministically and uses potential/resistance. But it modifies potential/resistance by adding waiting time, which might not be explicitly given. We can say "use an aging term as part of the local state; it is updated locally."

Let's consider if we can design a purely local rule without a token. For example, each cell decides independently whether to request budget. It compares its U with neighbors. If it's a local maximum, it sends a request. A central arbiter? No global view. The token is a simple way to serialize decisions without global view. The token only needs local info to move. So token is a good minimal mechanism.

Let's structure the answer:

- Start with the model.
- Define local urgency.
- Describe the token algorithm.
- Explain why it uses only local info.
- Explain fairness: high potential/low resistance gets more budget; aging ensures eventual service for all; no starvation proof by contradiction.
- Maybe mention tie-breaking.

Let's write in a teaching style, building one piece at a time.

We need be careful with terminology: "cellular graph" -> graph of cells. Each cell has potential P_i and resistance R_i. "computation budget" -> a unit of work. "next unit" -> one cell at a time.

Let's draft:

**Step 1: Define a score.**
For cell i, let
\[
U_i = \frac{P_i + a_i}{R_i}
\]
where \(a_i \ge 0\) is an age counter (how long since i last got budget). Higher \(U_i\) means "more deserving": more potential, less resistance, longer wait.

**Step 2: Put one token on the graph.**
The token marks the cell currently considering the budget. It is the only global-looking object, but it only looks at its current cell and immediate neighbors.

**Step 3: Local decision.**
Token at i. It reads \(U_i\) and \(U_j\) for all neighbors j. It chooses the cell with maximum U among i and its neighbors. If the maximum is a neighbor, the token moves there and repeats. If the maximum is i, i gets the budget.

**Step 4: Update.**
When i gets the budget:
- \(P_i \leftarrow \max(0, P_i - 1)\) (consume one unit of potential)
- \(a_i \leftarrow 0\) (reset age)
Every cell increments its own age \(a_i\) by 1 every time step (or every step it is not served). This is a purely local update; no cell needs to know about non-neighbors.

**Why local?**
The token's decision uses only i and N(i). The age update is per-cell. The potential update is at i. No global view.

**Fairness.**
- Cells with higher P and lower R have higher U, so they attract the token more often. This gives priority to urgent work.
- The age term \(a_i\) grows for any cell that is ignored. So a cell that has not been served for a long time becomes more urgent and eventually outcompetes its neighbors. This prevents any cell from being permanently ignored.
- Over time, the algorithm balances service: it serves urgent cells but also gives a chance to every cell as its age grows.

**No starvation proof.**
Suppose cell c never receives budget. Then its age \(a_c\) grows without bound. Consider a neighbor b of c. If b ever gets budget after \(a_c\) becomes very large, then the token is at b. Since c is a neighbor, the token will see \(U_c > U_b\) (because \(a_c\) is huge) and will move to c, giving c budget. Contradiction. So b can only be served finitely many times after that. But then b's age also grows, so the same argument applies to b's neighbors. By induction along any path from c, no cell in the connected component can be served infinitely often. But the token must serve some cell at each step (it cannot move forever without eventually hitting a local maximum and serving it). So at least one cell is served infinitely often. Contradiction. Therefore c must be served eventually, and in fact infinitely often. Hence no starvation.

Wait: The induction step: If c never served, then neighbors of c can only be served finitely many times. Then consider a neighbor b of c. After b is no longer served, its age grows. For a neighbor d of b, if d is served after b's age becomes large, token at d sees b's high U and moves to b, then b sees c and moves to c. So d can only be served finitely many times. By induction, all cells at distance k from c can only be served finitely many times. Since graph is connected, all cells can only be served finitely many times. But the algorithm must serve some cell at each step. Contradiction. This proves no cell is starved. We need assume graph is finite and connected. If infinite, at least some cell served infinitely often? If infinite, could have no cell served infinitely often? The token moves and serves, so it serves infinitely many times, but could serve each cell finitely many times. Then no starvation in the sense each cell eventually served, but if c never served, the induction would say all cells served finitely many times, so total serves finite, contradiction. So even for infinite connected graph, c cannot be never served? Actually if graph is infinite, the token could wander off and never return to c, serving each other cell finitely many times, and c never served. The induction would say neighbors of c served finitely many times, then their neighbors, etc. But the token could go to infinity and serve cells at increasing distance from c, each finitely many times. Then c never served. So the proof requires finite graph or some guarantee of recurrence. The problem says "cellular graph" likely finite. We can assume finite connected graph.

Let's check the induction carefully. Suppose c never served. Let S_k be cells at distance ≤ k from c. Claim: all cells in S_k are served only finitely many times. Base: c never served (0 times). Assume true for S_{k-1}. Consider a cell v at distance exactly k. Its neighbors closer to c are in S_{k-1}, so they are served only finitely many times. After a time T when all closer neighbors have stopped being served, their ages grow without bound. If v is served after T, then the token is at v. It will see a closer neighbor u with huge age and move to u. Then u will see its closer neighbor, etc., until c. So v cannot be served after T (otherwise c would be served). Thus v is served only finitely many times. By induction, every cell served finitely many times. But the algorithm serves one cell per step, so infinitely many serves. Contradiction. This works for finite graph. For infinite, the induction gives each cell finitely many serves, which is consistent with infinitely many serves overall. So for infinite, c could be starved. But "cellular graph" likely finite. We can state "assuming the graph is finite and connected." If not, add a random exploration to ensure recurrence.

Actually, wait: In the induction, if v is served, token at v sees a closer neighbor u with huge age. But what if v's own age is even huger? v was just served, so its age resets to 0. So u's age is huge, so U_u > U_v. So token moves to u. Then u sees its closer neighbor with huge age, moves, etc. Eventually reaches c. So c served. So v cannot be served. This is correct.

But there is a subtlety: The token might not be at v when v is served? To serve v, token must be at v. So yes.

Thus the proof is solid.

We should also mention tie-breaking to avoid deadlock: if two cells have same U, use cell ID.

Now, is this algorithm "minimal"? It requires a token. The token is a single piece of state that moves. The rule uses only local info. The age counters are local. It's fairly minimal.

We can also present a simpler version without token: each cell runs the same rule asynchronously. But then multiple cells might think they are max. Token serializes decisions. We can say "To pick exactly one cell per unit, use a single token. This is the minimal serialization; it doesn't require global knowledge."

Let's consider if the user expects a specific answer like "use a local maximum of potential/resistance; fair because after serving, potential decreases; no starvation because potential of others increases." Maybe our answer is more sophisticated. But the prompt says "Lens: you are a teacher who explains by building one small piece at a time." So we should explain step by step.

We can write the answer as a dialogue:

"Let's build it.

1. Score: \(s_i = P_i / R_i\). But static scores can starve. So add an age: \(s_i = (P_i + a_i) / R_i\).

2. Token: ..."

We should also mention how to initialize and update age. If the problem doesn't mention age, we can say "If you are not allowed to add an age counter, no deterministic local rule can guarantee no starvation for arbitrary potentials/resistances. You need either randomization or aging. Here is a minimal version with aging."

This is important: The question says "given per-cell potential and resistance values." It doesn't say we can add age. But to guarantee no starvation, we likely need some dynamic. If potentials and resistances are static, then any cell with lower score might never get budget if a neighbor always has higher score. But if we update potential after service, it changes. The question might assume potential changes when budget is spent. So maybe aging is not needed if potential decreases. But as argued, a cell can still starve if a neighbor is replenished. The problem doesn't specify dynamics. So we can say "Assume potentials can change when budget is spent; if not, add an age counter." To be safe, include aging as part of the algorithm.

Let's think of a simpler local algorithm that does not require a token: Each cell has a counter. At each step, each cell increments its counter. A cell is eligible if its priority is greater than all neighbors. The cell with the smallest ID among eligible gets the budget. But this requires global selection among eligible? If they are not adjacent, multiple eligible. The token solves this.

Alternatively, we can use a "leaky bucket" where each cell has a credit. At each step, each cell adds potential/resistance to its credit. If its credit exceeds 1, it takes budget and subtracts 1. This is local and fair. But it doesn't decide which cell gets the next unit globally; multiple cells might take simultaneously. But if budget is just a unit of computation, maybe they can all take? The question says "which cell receives the next unit" singular.

Let's stick with token.

Let's outline the final answer:

**Title: A local token scheduler with aging**

- Graph \(G=(V,E)\). Each cell \(i\) has potential \(P_i\) and resistance \(R_i>0\). Add a local waiting counter \(w_i\).

- Define urgency:
\[
u_i = \frac{P_i + w_i}{R_i}
\]
(You can also use \(P_i/(R_i+w_i)\) if resistance grows with waiting; the key is monotonic in waiting.)

- Algorithm:
  1. One token somewhere. All \(w_i\) start at 0.
  2. At each step, every cell increments \(w_i\) by 1 (or only if not served).
  3. Token at \(i\). It compares \(u_i\) with \(u_j\) for \(j\in N(i)\).
  4. It moves to the cell with the largest \(u\) among \(\{i\}\cup N(i)\). Ties: smallest ID.
  5. If the largest is \(i\), then \(i\) gets the budget. Set \(P_i \leftarrow \max(0, P_i - 1)\), \(w_i \leftarrow 0\). Token stays.
  6. If largest is a neighbor, token moves there and repeats from step 3.

- Why local: step 3 only needs \(i\) and its neighbors. Step 2 and 5 are local updates.

- Why fair:
  - High \(P_i/R_i\) gets more attention.
  - Waiting counter \(w_i\) grows for ignored cells, so they become more urgent.
  - The token acts like a local hill-climber on the urgency landscape. It serves the current local maximum, then that cell's urgency drops, letting others rise.

- Why no starvation:
  - Assume finite connected graph. Suppose cell \(c\) never gets budget.
  - Then \(w_c \to \infty\). Any neighbor of \(c\) that is served after \(w_c\) is large will have the token at it; the token will see \(c\)'s huge urgency and move to \(c\), serving it. So no neighbor of \(c\) can be served infinitely often.
  - By induction, no cell at distance 1, then 2, ... can be served infinitely often. Since the graph is finite and connected, no cell can be served infinitely often. But the algorithm serves one cell each time it stops at a local maximum, and it must stop somewhere; actually it serves infinitely many times. Contradiction.
  - Therefore every cell is served eventually, and in fact infinitely often. So no starvation.

Wait: The induction step: If no neighbor of c served infinitely often, then consider a cell at distance 2. It can only be served finitely often because if it were served after all its neighbors closer to c have stopped being served, those neighbors' w grow, and the token would move toward c. This is the same argument. So by induction, all cells served finitely often. Contradiction with infinite serves. Good.

We should also note: The token might move to a neighbor and not serve immediately. But the process always eventually serves because urgency values are finite at any step and the token moves to strictly higher urgency unless it serves. Could it move forever? If it moves to a neighbor with higher urgency, that neighbor's urgency is higher. But after moving, the previous cell's urgency might increase due to w. However the token only considers current cell and neighbors. It could cycle? Let's analyze: Suppose token at A, moves to B because U_B > U_A. At B, U_B might now be less than U_A because A's w increased? But A's w increases by 1, B's w also increases by 1. The difference U_B - U_A remains? Let's compute: U = (P + w)/R. If R differs, increments affect differently. If R_A = R_B = 1, then U_B - U_A = (P_B + w_B) - (P_A + w_A). Both w increment equally, so difference constant. So if U_B > U_A at A, it remains > at B. So token stays at B and serves. If R differ, w increments change U by 1/R. If R_B < R_A, U_B increases faster, so difference grows. If R_B > R_A, U_A increases faster, so U_B might drop below U_A. Then token at B might move back to A. Could this oscillate? Let's test: A: P=0, R=1, w=0 -> U=0. B: P=0, R=100, w=1 -> U=0.01. Token at A sees B=0.01 > A=0, moves to B. Now w_A=1, w_B=2. U_A=1, U_B=0.02. Token at B sees A=1 > B=0.02, moves back to A. Now w_A=2, w_B=3. U_A=2, U_B=0.03. Token at A sees B=0.03 < A=2, so stays at A and serves A. So it doesn't oscillate forever; it serves. What if both have high resistance? It might move back and forth a few times but eventually the lower resistance cell's U grows faster, so it will become dominant and serve. In general, since w increments, eventually one cell's U will dominate because 1/R differs. If R equal, difference constant. So the token cannot move forever without serving; it will reach a cell that is a local maximum and serve. We can state "the token follows a strictly increasing urgency unless it serves; since urgency is bounded above in the short term? Actually urgency can increase unboundedly with w. But the token only compares current neighbors. If it moves to a neighbor with higher urgency, that neighbor's urgency is higher. It might later move back if the other's urgency increases faster. But eventually the cell with the highest 1/R (or highest urgency) will dominate. Since the graph is finite, the token will eventually serve. This is a bit hand-wavy. For the proof, we don't strictly need that the token serves infinitely often; we can assume it does because at each step if it doesn't serve, it moves. But if it moves forever without serving, then no cell gets served, which contradicts the algorithm's purpose. Could the algorithm get stuck in an infinite move loop? Let's see if it's possible. We need to ensure the algorithm terminates each decision. Actually, the algorithm as described: token at i, it picks j with max U among i and neighbors. If j != i, it moves to j. Then it repeats. This is a while loop to decide the next cell to serve. It will eventually reach a cell that is a local maximum and serve it. Is it guaranteed to terminate? The urgency values are updated (w increments) every step, including during the token's movement? In my step 2, every cell increments w at each step. So while the token is moving, w's are increasing. This could cause the token to never settle if the landscape keeps changing. But as argued, eventually some cell's urgency will be the highest in its neighborhood and it will serve. Let's try to construct an infinite move loop. Suppose two cells A and B. A has R=1, B has R=2. Both P=0. Start token at A, w_A=0, w_B=0. U_A=0, U_B=0. Tie -> smallest ID maybe A. So it serves A. Not a loop. If tie broken to move, it might move to B. Let's say tie goes to neighbor with higher ID. Token at A, U_A=0, U_B=0, moves to B. Now w_A=1, w_B=1. U_A=1, U_B=0.5. Token at B sees A=1 > B=0.5, moves to A. Now w_A=2, w_B=2. U_A=2, U_B=1. Token at A sees B=1 < A=2, serves A. So it terminates after 2 moves. What if R_A=1, R_B=100, and P_B is huge so U_B always higher? Token moves to B and serves B. So it terminates. To have infinite loop, the token would need to keep moving to a neighbor that is higher, but the neighbor's urgency drops relative to current due to w increments. Since w increments, the cell with smaller R increases U faster. If token keeps moving to the cell with larger R, its U grows slower, so the other cell's U might catch up and become higher, causing it to move back. But then the other cell has smaller R, so its U grows even faster, so it will eventually dominate and serve. So the token will eventually serve. I think termination is guaranteed. We can mention "the token follows the local gradient until it reaches a local maximum; because service resets the urgency, it cannot loop forever."

Actually, in the algorithm, w increments every step. If the token is moving, no cell is served, so all w increase. The relative order of U can change based on R. But the token only moves to a cell with strictly higher U at that moment. It cannot move to a lower U. So the sequence of U at the token's current cell is strictly increasing? Let's check: Token at A, U_A. It moves to B because U_B > U_A. Now token at B. Next step, it might move to A because U_A' > U_B'. But U_A' is the updated U_A. Since U_A increased, it could be higher. So the U of the token's current cell is not monotonically increasing. It could go A (U=0) -> B (U=0.01) -> A (U=1) -> B (U=0.5?) Wait, if it moves back to A, the new U_A is 1, which is higher than previous U_B=0.01. So the sequence of U at token position: 0, 0.01, 1, ... It increased from 0.01 to 1. Then if it moves to B again, U_B might be 0.5, which is less than 1. So it could decrease. But if it moves to B, it must be because U_B > U_A at that moment. So if U_A=1, U_B must be >1 to move. So the sequence of U at token position when it moves is strictly increasing? Let's see: At A, U_A=0, moves to B because U_B=0.01 > 0. At B, U_B=0.01. Next step, U_A becomes 1, U_B becomes 0.02. Token at B sees U_A=1 > U_B=0.02, so it moves to A. Now token at A, U_A=1. The U increased from 0.01 (at B) to 1 (at A). So the U at the new position is higher than the U at the old position at the time of decision? Actually at the time of decision at B, U_A=1, U_B=0.02, so it moves to A because U_A > U_B. So the new U (1) is greater than the old U (0.02). So the U at the token's position increases with each move. Is it always? At decision time, token compares its own U_i with neighbor U_j. If it moves to j, then U_j > U_i. So the new cell's U is greater than the old cell's U at that moment. After moving, the new cell's U might change, but the value when it moved was greater. So the sequence of U values at the moments of arrival is strictly increasing. Since U values can grow unbounded, this doesn't prove termination. But can it grow unbounded without serving? The U values are \(U_i = (P_i + w_i)/R_i\). If no service, all w_i increase by 1 per step. The maximum possible U increase per step is 1/R_min. So U can grow unbounded. The token could theoretically follow a sequence of ever-increasing U, moving to cells that have waited longer. But since the graph is finite, the maximum U is at some cell. The token will eventually reach that cell and serve it. Because if it keeps moving to higher U, it must eventually reach the global maximum. Since U values change, the global maximum might shift, but the token is always moving to a neighbor with higher U. In a finite graph, a local hill-climb on a changing landscape might not terminate if the landscape changes. But here the landscape only increases (w increments) except when serving. If no serving, all U increase. The token could chase the global maximum, but the global maximum is a single cell. It will eventually reach it because it moves to a neighbor with higher U. Since the graph is finite, the path to the global maximum has strictly increasing U along the path? Not necessarily, because the global maximum might move. But the token's U is increasing. It cannot exceed the global maximum at that time. So it will eventually hit the global maximum. When at the global maximum, all neighbors have lower U, so it serves. Thus termination is guaranteed. Good.

So we can state: The token walks to a local maximum of urgency. Since urgency of the token's position strictly increases on each move, and the graph is finite, it cannot move forever without reaching a local maximum. Once it reaches a local maximum, it serves. (Actually if landscape changes, the token might move before serving, but it will still eventually serve because it cannot move to a cell with lower U; the U of the token's position strictly increases, and there is a maximum possible U at any finite time, but it can increase. However, if it never serves, U grows unbounded, but the token's U also grows. Could it keep moving to the cell with the current highest U? The highest U is a single cell. The token will move toward it. Since the graph is finite, it will reach it in finite steps. When it reaches it, that cell is the highest U in the graph, so it is a local maximum, so it serves. Thus no infinite move loop. This is a nice argument.

Let's refine the algorithm to avoid the complication of w incrementing during movement. We can make the token's decision loop atomic: it moves until it reaches a local maximum, then serves. During this loop, w does not increment. The w increments only between budget allocations. This is simpler and avoids infinite loops. So:

- Between budget allocations, all w_i increment by 1? Or just before each decision?
Better: At each decision step, the token starts at some cell. It does a local search: while there is a neighbor with higher U than current, move to the neighbor with highest U. When no neighbor has higher U, serve current cell. Then update P and w for served cell, and increment w for all other cells? Actually if we increment w for all cells every decision, it's fine.

Let's define:
- At each scheduling round:
  1. Every cell that did not receive budget in the previous round increments its waiting counter w_i by 1. (Or we can just say w_i is number of rounds since last service.)
  2. Token starts at the last served cell. It compares U_i with neighbors. If a neighbor has higher U, it moves to the highest such neighbor. Repeat until the token is at a cell with U higher than all neighbors (a local maximum).
  3. That cell receives the budget. Set P_i ← max(0, P_i - 1), w_i ← 0.
  4. Next round.

This is clearly local and terminates. The token's local search is just following increasing U. Since U is static during the search, it cannot cycle. It will reach a local maximum. This is minimal and clear.

Now, fairness and no starvation proof as above.

Let's write the final answer in a teaching style.

We should also mention that resistance \(R_i\) can be any positive number; if \(R_i\) is zero, use \(\epsilon\) to avoid division by zero.

Let's include a small example? Maybe not necessary.

Let's also address "why it cannot starve a cell forever" with the induction proof.

Let's prepare the final response.

Potential structure:

1. **Set up the local score.**
2. **Add a token to serialize the choice.**
3. **The algorithm.**
4. **Why it uses only local info.**
5. **Why it is fair.**
6. **Why no starvation (proof sketch).**

Let's write in a friendly teacher voice.

We need ensure the answer is self-contained. Assume graph is finite, connected. If not, mention random exploration.

Let's draft:

---

Let each cell \(i\) have potential \(P_i\) and resistance \(R_i > 0\). We also keep a local age \(a_i\) (initially 0). Define urgency
\[
U_i = \frac{P_i + a_i}{R_i}.
\]
Higher \(U_i\) means the cell should be served sooner.

Put one token on the graph. The token is the only thing that serializes decisions, but it never needs a global map.

**Rule (one unit of budget):**
1. Every cell increments its own age \(a_i\) by 1 (cells that were just served reset to 0).
2. The token starts at some cell \(i\).
3. It looks only at \(i\) and its direct neighbors \(N(i)\). It finds the cell \(j \in \{i\} \cup N(i)\) with the largest \(U_j\). Ties are broken by, say, smallest cell ID.
4. If \(j \neq i\), the token moves to \(j\) and repeats step 3.
5. If \(j = i\), then \(i\) receives the budget. Update \(P_i \leftarrow \max(0, P_i - 1)\) and \(a_i \leftarrow 0\). The token stays at \(i\) for the next round.

This is local: each comparison uses only the current cell and its neighbors.

**Fairness:** The rule favors cells with high potential and low resistance because they have high \(U\). But the age term \(a_i\) grows whenever a cell is ignored. So a cell that has waited a long time becomes more urgent. Thus the scheduler balances between "urgent work now" and "don't forget anyone."

**No starvation:** Suppose, for contradiction, that a cell \(c\) never gets the budget. Then its age \(a_c\) grows without bound. Take any neighbor \(b\) of \(c\). If \(b\) ever gets the budget after \(a_c\) is huge, the token is at \(b\). Since \(c\) is a neighbor, the token will see \(U_c > U_b\) (because \(a_c\) is huge) and will move to \(c\), so \(c\) would get the budget. Contradiction. Therefore \(b\) can only be served finitely many times after that. But then \(b\)'s own age grows, so by the same argument its neighbors can only be served finitely many times. Repeating this along the connected graph, every cell can be served only finitely many times. Yet the algorithm serves one cell at every round, i.e., infinitely many times. Contradiction. Hence \(c\) cannot be starved forever. In fact, every cell is served infinitely often.

(If the graph is not finite, add a small random exploration step to the token's movement; then the same conclusion holds almost surely.)

---

This is good. We should also mention that if you don't want to add an age counter, you can use randomization. But the above is sufficient.

Let's consider if the user might object that the algorithm uses a token, which is a global object. The token's position is a global state, but it only moves locally. The rule uses only a cell and direct neighbors. The token is just a way to pick one cell at a time. It doesn't need a global view. We can clarify: "The token is not a global view; it is a single moving marker. At any moment it is at one cell, and it only inspects that cell's neighborhood."

Also, the age increment "every cell increments its own age" is local. It doesn't require communication. If cells don't have synchronized clocks, we can say "each cell maintains a local counter that increases when it is not served; when the token visits, it reads the counter." But how does a cell know it is not served? It can just increment every time step. If there's no global time, we can use logical rounds. For simplicity, assume discrete rounds.

Let's also consider if resistance is a cost that should be subtracted. Our urgency \(P/R\) is a reasonable priority. If resistance is high, urgency is low. Good.

Let's write the final answer with the requested "teacher" lens. Use "small piece at a time" style.

We can start: "Let's build it from the smallest possible pieces."

Then step by step.

Let's ensure the final answer is not too long but detailed enough. Desired oververbosity 5. We'll provide a clear, structured explanation.

Let's also mention that if multiple cells have same urgency, tie-break by ID to ensure deterministic choice.

Let's now produce the final answer.

## answer

Let’s build it one piece at a time.

## 1. Give each cell a local “urgency” score

For cell \(i\), let:

- \(P_i\) = its potential,
- \(R_i > 0\) = its resistance,
- \(a_i\) = a local age counter: how long since it last received budget.

Define its urgency as

\[
U_i = \frac{P_i + a_i}{R_i}.
\]

Higher \(P_i\) means it wants budget more.  
Higher \(R_i\) means it is harder/more costly to serve.  
Higher \(a_i\) means it has been ignored longer.

So a cell is more urgent if it has high potential, low resistance, or has waited a long time.

## 2. Use one moving token to serialize the choice

We need to choose exactly one cell for the next unit of budget. To do this without a global view, keep a single “budget token” somewhere on the graph.

The token is not a global controller. It only knows where it currently is. At each step, it looks at its current cell and that cell’s direct neighbors.

## 3. The local rule

At each budget decision:

1. Every cell increments its own age counter \(a_i\) by 1, except a cell that was just served resets \(a_i = 0\).

2. The token is at some cell \(i\).

3. The token compares \(U_i\) with \(U_j\) for every direct neighbor \(j \in N(i)\).

4. It moves to the neighbor with the largest urgency. If its own urgency is the largest among itself and all neighbors, it stays at \(i\).

5. If the token stays at \(i\), then \(i\) receives the next unit of computation budget. Update:
   \[
   P_i \leftarrow \max(0, P_i - 1), \qquad a_i \leftarrow 0.
   \]

6. If the token moved to a neighbor, no budget is spent yet. Repeat from step 3.

Ties are broken by a fixed local rule, e.g. smallest cell ID.

This uses only the current cell and its direct neighbors. No cell needs to know the whole graph.

## Why this is fair

The rule favors cells with high potential and low resistance because they have high \(U_i\). So urgent work gets attention.

But the age term \(a_i\) grows whenever a cell is ignored. Thus a cell that has not been served for a long time becomes more urgent. It will eventually outcompete its neighbors and pull the token toward itself.

So fairness here means:

- cells with high \(P_i/R_i\) get more budget,
- but no cell is permanently forgotten because waiting increases its urgency.

## Why it cannot starve a cell forever

Assume the graph is finite and connected. Suppose, for contradiction, that some cell \(c\) never receives budget.

Then its age \(a_c\) grows without bound. Its urgency \(U_c\) becomes arbitrarily large.

Take a neighbor \(b\) of \(c\). If \(b\) ever receives budget after \(a_c\) has become huge, the token is at \(b\). But \(c\) is a direct neighbor of \(b\), and \(U_c\) is now enormous, so the token will move from \(b\) to \(c\). Then \(c\) would receive budget. Contradiction.

So \(b\) can only be served finitely many times after \(c\) has waited very long.

But then \(b\)’s own age also grows. The same argument applies to \(b\)’s neighbors. By repeating this along any path in the connected graph, every cell can be served only finitely many times.

That is impossible, because the algorithm serves one cell at every round, i.e. infinitely many times.

Therefore cell \(c\) cannot be starved forever. In fact, every cell is served infinitely often.

So the minimal local rule is:

\[
\boxed{
\text{Use } U_i = \frac{P_i + a_i}{R_i}
\text{ and let a token hill-climb to the local maximum of } U.
}
\]

The token only ever checks a cell and its direct neighbors, yet the age counter guarantees that no cell is permanently ignored.
