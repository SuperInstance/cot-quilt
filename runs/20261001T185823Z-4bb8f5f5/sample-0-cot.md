# sample 0 — lens: a skeptic who trusts only what can be checked against the stated premises

## seed_requested
{"seed": 52840, "bits16": "1100111001101000", "source": "mothquantum/coin-toss-v1:1shot", "entropy_bits_true": 16, "job_ids": ["4dd3d358-af05-4be2-b3e1-a20b7afad030", "ccfb0b79-759d-4988-84a6-18680d6a4591", "6053f0ad-39b7-4410-b4f8-74f72ff7a1a2", "b3ad250a-a495-474b-afd4-e5775ec10a04", "fdb3f332-adad-4afd-b74d-fd8e44793bcf", "b73bdf43-6d3d-4905-991a-3f6912f3abd0", "c6dc2c9a-c9fd-4869-96a2-89eaaf8fabf3", "d717ffbf-bb7f-4d48-85d8-8fddfdf1aae5", "d72b5221-3f2f-4f38-94bb-29afc6fabbec", "6c7dc60a-9c19-4a5e-ab0f-cd34f1a42773", "7970e640-60d7-4a3f-be35-2661af31abd9", "d741dc01-4846-45bb-8661-f01f979477f8", "4f00f4b1-2f22-434f-be45-981cd3070151", "06e2051d-292c-4365-a3c2-f616679347f8", "10ba4bad-1498-480a-bf82-f423239561d2", "26c89f47-e6a8-4c21-8228-98797507c83b"]}

## chain-of-thought

We need answer. Need parse. User asks: "Lens: you are a skeptic who trusts only what can be checked against the stated premises.

Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

We need provide algorithm. Need infer context? "cellular graph", per-cell potential and resistance values. Need decide which cell receives next unit of computation budget. Rule local only cell and direct neighbors. Fairness, no starvation. We need design minimal local algorithm. Could be inspired by "cellular automaton scheduling" or "token allocation" with potential/resistance. Need decide next cell based on potential and resistance. Maybe akin "random walk" / "greedy local potential difference" / "current flow" where cell with highest potential/resistance? Need define.

Need be careful: They ask "given per-cell potential and resistance values." We need decide which cell receives next unit of computation budget. Use only a cell and direct neighbors. Explain fair and no starvation. We need design algorithm. There are many possibilities.

Maybe "cellular graph" with cells, each has potential p_i and resistance r_i. Need allocate next budget to cell. Local rule: each cell compares its "urgency" (potential / resistance or potential - resistance?) with neighbors. The cell with highest local maximum among neighbors? But to decide a single cell globally, need either run distributed election: if a cell's score exceeds all neighbors, it is local maximum. But if multiple local maxima, how choose? Need next unit? If every cell checks local condition, some local maxima. Need tie-breaking, token passes? Without global view, cannot select unique global max unless algorithm uses propagation or random walk. The question might be from "cellular graph" where cells communicate locally; algorithm decides which cell receives next budget. Need design minimal local algorithm. Fairness/no starvation.

Maybe "least recently served" local? Potential and resistance values. Use only cell and direct neighbors. We can design a distributed scheduler: each cell maintains a counter/credit. At each allocation round, a token moves from current cell to neighbor chosen by a local rule based on potential and resistance. The token holder receives budget? Wait "decides which cell receives next unit." If rule local only cell and direct neighbors, a cell can decide if it should get budget based on neighbors. But if no global state, only local info. To guarantee no starvation on arbitrary graph, need some mechanism like random walk with positive probability to visit all cells. But potentials/resistances might bias. If rule uses only local, fairness may be probabilistic or over time.

Let's examine wording: "Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

Maybe this is about "cellular automata" scheduling: each cell has potential (work needed) and resistance (difficulty). Need allocate budget to cell with highest "potential difference" across resistance. Local rule: cell receives budget if its potential minus average neighbor potential exceeds resistance? Or if it has highest potential/resistance among neighbors. Fairness? Hmm.

Maybe they expect "gradient" algorithm: At each step, each cell computes a local pressure = potential / (resistance + 1) or potential - resistance. The cell with highest pressure among itself and neighbors gets budget. Since local comparisons only. But if every cell does this, multiple cells might think they win? Actually if a cell has highest pressure among its closed neighborhood, it is a local maximum. If we allocate to all local maxima simultaneously, that's a maximal independent set-ish. But "next unit" singular. Need choose one local maximum. Without global tie-breaking, impossible deterministically to choose unique global max using only local info. Unless we allow asynchronous updates: any cell that is a local maximum can claim the next budget. If simultaneous, need collision resolution. But fairness/no starvation? If always choose local maxima, a non-max cell may never be local max if neighbors always higher. But potentials/resistance change after budget? If receiving budget reduces potential, then eventually neighbors drop, so non-max can become max. Ah! This is key. If potential decreases when cell gets budget (or resistance increases?), then greedy local max may not starve because cells that get budget reduce their potential, allowing others.

The question: "given per-cell potential and resistance values." If budget unit is computation, maybe potential is amount of work, resistance is cost. The next unit should go to cell with highest potential/resistance? After it receives, potential decreases or resistance changes. Need explain fairness and no starvation. Local rule: each cell compares its "pressure" = potential / resistance (or potential - resistance) with direct neighbors. If it is the strict local maximum, it can take next unit. To avoid simultaneous conflicts, use local tie-break (e.g., cell ID) or randomized backoff. But if only direct neighbors, a cell with a neighbor chain can still have local maxima. Multiple local maxima may exist. If all local maxima can receive simultaneously, not "next unit" but batch. For next unit, need a token. Maybe token moves to neighbor with highest pressure. The token holder gets budget? Let's reason.

The phrase "decides which cell of a cellular graph receives the next unit of computation budget" might imply there is a central scheduler? But "rule must use only a cell and its direct neighbors (no global view)" means each cell can decide locally whether to request or not. A distributed algorithm: every cell computes a score; a cell receives budget if its score is greater than all neighbors' scores. But if multiple local maxima, we need conflict resolution. The question asks "Design a minimal local algorithm". Could be "local maximum selection": At each round, each cell examines own and neighbors' potentials/resistances. If its potential is highest among neighbors and above threshold, it claims the budget; otherwise it defers. Ties broken by ID. Fairness? With potential decreasing after service, no cell can be permanently blocked because any neighbor with higher potential eventually gets served and decreases. But what if multiple cells keep increasing potential? Need assumptions? If potentials represent pending work, maybe increases over time? If a cell has high potential due to incoming work, it gets more. But fairness requires bounded wait.

Need formalize. Let's define graph G=(V,E). Each cell i has potential p_i ≥ 0 and resistance r_i > 0. Define priority score s_i = p_i / r_i (or p_i - r_i). Algorithm: At each allocation step, every cell broadcasts s_i to neighbors. Cell i is eligible if s_i > s_j for all j∈N(i), with tie-break by smallest ID. Among eligible local maxima, choose? Wait if every cell only knows direct neighbors, it cannot know if another local maximum elsewhere is also eligible. If we let all local maxima take one unit simultaneously, then it's not a single next unit. If we need exactly one next unit, no deterministic local algorithm can select a unique global maximum without additional global token or communication. Unless we use a moving token: the token arrives at some cell, that cell decides whether to take budget or pass token to neighbor with higher score. This uses only local info at each step. The token follows increasing score until local maximum; then that cell gets budget. This selects a local maximum, not global maximum. But fairness? If token starts anywhere and moves uphill to a local maximum, then after service, score decreases and token can move again. But could get stuck in a local maximum basin? Need reset/random walk to avoid starvation. If token always moves to strictly higher score or stays if local max, then after service of local max, its score decreases. Token may then move to neighbor with higher score, possibly back and forth. But a cell in a different basin might never be visited if token never crosses valleys. To avoid starvation, add random restarts or allow downward moves with some probability. But question asks minimal local algorithm and fairness/no starvation. Maybe use potential/resistance to bias a random walk, but ensure positive probability to visit every cell. A random walk on connected graph visits all cells infinitely often with probability 1. If budget goes to token holder, no starvation almost surely. But fairness? Not deterministic.

Could use "least recently served" local? Each cell maintains age since last served. At each step, cell with maximum age among neighbors gets token? Again global unique issue.

Maybe the intended answer: Use a local "pressure" and a token that moves to neighbor with highest pressure. The token holder gets budget. Fairness: because after receiving budget, its potential decreases (or resistance increases), so it cannot remain highest forever; eventually token moves to others. No starvation: if graph connected and every cell's potential is finite, a cell that hasn't been served will have relatively high potential compared to served neighbors, so token will drift toward it. But this is not rigorous for arbitrary topologies: a cell behind a low-potential barrier? Let's analyze.

Suppose token moves to neighbor with highest p/r. If token at cell A, it looks at neighbors and moves to highest. If a cell C far away has high p, token may need path through intermediate cells. If intermediate cells have low p, token won't move toward C. So C can starve if surrounded by low-potential cells. Unless all cells' potentials increase when waiting (work accumulates), then eventually intermediate cells' potentials rise as they wait, allowing token to move. If potentials represent pending work that accumulates over time, then any unserved cell's potential grows, and path cells also grow. But still a cell behind barrier? If C's potential grows, its immediate neighbor B also grows if unserved. Token might move to B when B's potential exceeds current, then to C when C exceeds B. So eventually. If potentials are given fixed, starvation possible. The problem says "given per-cell potential and resistance values" maybe they can change? Not specified. "receives next unit of computation budget" implies potentials maybe decrease when served. Fairness and no starvation require dynamic potentials.

Maybe there is a known algorithm: "Cellular graph" and "potential/resistance" reminiscent of "chip-firing" or "random walk with electrical resistance". Potential and resistance values: Maybe each cell has potential (like charge) and resistance; budget allocation according to "largest potential drop per resistance" along edges. Local rule: choose neighbor j maximizing (p_i - p_j)/r_ij. This is like current flow. The cell with highest inflow gets budget? Fairness? Hmm.

Could be from a problem about "distributed scheduling in a graph" where each node has "potential" (workload) and "resistance" (cost to communicate). Need allocate budget to cell with highest "priority" = potential / resistance. Local rule: "At each step, each cell compares its potential/resistance to its neighbors. If its value is greater than all neighbors, it gets budget." This is local. Fairness: It's a local maximum. But starvation? If a cell is never local maximum because it has a neighbor with higher value, that neighbor gets budget and its potential decreases. Eventually the neighbor's value drops below, so it can become local maximum. However, what if that neighbor receives new work and potential increases? If workload is dynamic, fairness not guaranteed. But if potential is non-increasing when served and no new work, then yes. But if potential represents pending computation, it may increase as new tasks arrive. The question likely assumes potentials are per-cell "demand" and receiving budget reduces them. Then no starvation.

But there is still multiple local maxima. If all local maxima receive simultaneously, that's okay for "next unit" maybe they mean "each cell decides if it receives the next unit" but multiple can? Hmm.

Maybe we need design "minimal local algorithm" that decides "which cell receives the next unit" singular. The only way with only local info is to have a token or distributed mutual exclusion. But the question says "The rule must use only a cell and its direct neighbors (no global view)." It doesn't say cells can't communicate/coordinate. We can define a token-based algorithm. Let's design one that is minimal and provably fair/no starvation.

Potential approach: Token-based local scheduling with potential/resistance. Each cell has potential p_i (work backlog) and resistance r_i (cost). A single token circulates. When token arrives at cell i, it receives one unit of budget. Then token moves to a neighbor chosen by a local rule based on p and r. To ensure no starvation, we can make token perform a biased random walk: at cell i, choose neighbor j with probability proportional to max(p_j/r_j, ε) or something. This uses only i and its neighbors. Since graph connected and probabilities positive, the token visits every cell infinitely often with probability 1, regardless of potentials/resistances. That gives fairness (in the long-run) and no starvation almost surely. But is it "fair"? It may not be deterministic fair, but fair in the sense each cell has positive probability. If we want deterministic no starvation, use round-robin token movement? But then potentials/resistances not used. Could combine: token moves to neighbor with highest "deficit" but include a round-robin fallback. For deterministic no starvation, token can cycle through a spanning tree? But no global view. A simple deterministic local rule on connected graph that visits every vertex infinitely often: a depth-first search token? Needs memory, but local. A token can move to least recently visited neighbor? That can cycle? On a graph, a token that always moves to the neighbor it visited least recently (with tie-break) performs a walk that visits all vertices infinitely often if graph connected? I think yes? Let's check. "Rotor-router" or "propp machine" on a connected graph: each vertex has a cyclic order of neighbors; token moves according to rotor. The rotor walk is fair: visits every vertex infinitely often. This uses only local info (rotor state at current cell and neighbors). Potentials/resistances can be used to set neighbor order/priorities, but fairness comes from rotor. This is deterministic and no starvation. That might be a strong answer. The question mentions potential and resistance values. We can design: each cell maintains a rotor (pointer) over neighbors sorted by some score (e.g., potential/resistance of neighbor). When token visits a cell, it gives budget to that cell, then advances its rotor and passes token to the next neighbor in the rotor order. Only current cell's rotor and direct neighbor scores are used. Fairness: rotor-router on connected graph is recurrent; every cell receives token infinitely often. This uses potential/resistance to bias order, but fairness from cyclic rotor. That's minimal local? Each cell needs a rotor pointer. That seems plausible.

But the question asks "Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever." Could be expecting a "local algorithm" like "each cell computes its priority; if it has highest priority among neighbors, it takes budget." They might not expect rotor-router. But the phrase "next unit" singular and "cannot starve forever" suggests need deterministic fairness. Rotor-router is a known way to guarantee no starvation with local info.

Let's explore possible interpretations.

The problem might come from an AI alignment or resource allocation context? "Lens: skeptic who trusts only what can be checked against stated premises." They want a minimal local algorithm. "Cellular graph" maybe from a paper? "potential and resistance values" reminiscent of "cell potential and resistance" in "cellular automata" or "graph-based scheduling". "computation budget" maybe from "AI safety gridworld"? Hmm.

Maybe it's from "cellular graph" where cells have potential (like "utility") and resistance (like "cost"). Need allocate next unit of computation budget. Local rule: cell gets budget if its potential minus resistance is greater than neighbors? Fairness and no starvation. Let's not overcomplicate. We can present a token-based algorithm with rotor-router, which is rigorous and uses only local info. Explain fairness and no starvation. We can also mention simpler local-maximum if you allow simultaneous service; but for unique next unit, token+rotor is safer.

Let's design a concrete minimal algorithm.

Definitions:
- Graph G=(V,E) connected.
- Each cell i has potential p_i ∈ ℝ (e.g., backlog) and resistance r_i > 0.
- Define priority/desirability of i: q_i = p_i / r_i (or p_i - r_i; choose one). Higher means more urgent.
- A single token represents the current right to schedule. Only token holder can receive the next budget? Or token holder decides which cell receives? Let's decide.

Algorithm A (token moves to neighbor with highest q, with rotor tie-breaking):
1. Initially token at some cell s.
2. When token is at cell i, cell i receives one unit of budget. (Or token chooses neighbor? The question: "decides which cell receives next unit". The token could decide the next cell to receive. If token is at i, it can decide to grant itself or pass. Simpler: token holder i grants the unit to itself. Then moves token to a neighbor.)
3. After granting, update p_i (e.g., p_i ← max(0, p_i - c_i) or p_i decreases).
4. Cell i chooses next token destination j ∈ N(i) ∪ {i}? To avoid starvation, must always move to a neighbor (not stay) unless graph single node. If it stays when q_i highest, could starve others. So always move to a neighbor. The choice uses local info: sort neighbors by q_j descending, then by a fixed cyclic order/rotor pointer. Advance rotor and send token to next neighbor in sorted order? Wait if we sort by q_j each time, the order changes. Rotor-router with dynamic priorities might not guarantee fairness? Standard rotor-router on a fixed cyclic order guarantees fairness. If we reorder by q each time, it's a "greedy" walk that may get stuck in a subset? Need be careful.

Standard rotor-router: Each vertex has a fixed cyclic order of its outgoing edges. Upon each visit, the token leaves along the next edge in the cyclic order. This guarantees that on a finite connected graph, every vertex is visited infinitely often (for a single rotor walk? Actually rotor-router walk is recurrent on finite connected graphs? I recall: rotor-router walk on a finite connected graph is recurrent; each vertex is visited infinitely often. Yes, for a single chip, the rotor walk is recurrent if graph is finite and connected. It might have transient behavior? Let's verify. Rotor-router with one chip: At each vertex, rotor points to next neighbor. This is deterministic walk. On finite connected graph, is it always recurrent? I think yes? Wait consider a directed cycle? Example graph: two nodes A-B. Rotor at A alternates B, B? With one neighbor, moves to B. Rotor at B moves to A. So visits both infinitely. Path of 3 nodes: A-B-C. Start A. Rotors alternate neighbors. A has only B -> B. B has neighbors A,C, rotor starts A. B goes A. A goes B. B rotor now C. B goes C. C goes B. B rotor now A. B goes A. A->B. B rotor now C. B goes C. C->B. B->A... Visits all. Star graph: center connected to leaves. Center rotor cycles leaves. Leaves go back to center. Every leaf visited when center points to it. So yes. I think rotor walk is recurrent on finite connected graph. Actually there is a known result: rotor-router walk is recurrent on finite graphs with sink? For a single chip, it may enter a cycle that covers all vertices? Let's test a graph where rotor orders cause a cycle not covering all? Suppose square with a diagonal? Rotor at each vertex cycles neighbors. Could the chip get stuck in a 2-cycle? If at A, rotor points B. A->B. B rotor points A. B->A. A rotor now next neighbor C. A->C. So not stuck. Because each time you visit a vertex, you advance rotor. To go back and forth, you must visit A and B, advancing both. Eventually they point elsewhere. So it tends to explore. I think it's recurrent.

But if we want to use potential/resistance, we can set the cyclic order at each cell each time based on neighbor priorities? If dynamic, fairness not guaranteed. We can instead use potential/resistance only to decide which cell receives budget when token is there? Or to set a fixed order initially: sort neighbors by q. That uses local info at initialization. But potentials may change. If we want adapt, we can use a "rotor" that cycles through neighbors in order of current q? That is like "fair queuing" per node. Does it guarantee no starvation? If we always pick the neighbor with highest q, a low q neighbor could starve. To prevent, use a deficit round-robin at each cell: each cell maintains for each neighbor a credit/deficit based on q, and chooses the neighbor with largest deficit. This is local and fair among neighbors. But global fairness across graph? Token could still get trapped? Rotor-router with fair local selection might still guarantee? Not sure.

Simpler: Use a random walk with positive probability to all neighbors. That is fair and no starvation with probability 1, regardless of potentials. To incorporate potential/resistance, bias probabilities but keep all positive. For example, at cell i, choose neighbor j with probability proportional to exp(β q_j) or (1 + q_j). Since all probabilities > 0, the token visits every cell infinitely often on a connected graph. This is a minimal local algorithm: token holder i receives budget, then moves to a neighbor chosen randomly with probabilities based on p_j/r_j. It uses only i and neighbors. Fairness: the Markov chain is irreducible (because graph connected and all transition probabilities positive), so stationary distribution positive on all cells, and visits all cells infinitely often almost surely. No starvation almost surely. But "cannot starve forever" might mean deterministic guarantee. Random gives probability 1 but not absolute. The lens "skeptic who trusts only what can be checked against stated premises" might prefer deterministic. But probabilistic fairness is often acceptable? The question says "cannot starve a cell forever." That sounds deterministic. We can use rotor-router for deterministic.

Maybe combine: Use a deterministic local fair queuing: token moves according to a rotor-router with neighbor order determined by potential/resistance. If order is fixed (or changes slowly), fairness is guaranteed by rotor-router. But if potentials/resistances are given and fixed, we can sort once. If they change, we can recompute order? That might break guarantee. We can instead use potential/resistance to decide whether the current cell receives the budget, and use a fixed rotor to move token. For example: Token at i. It asks neighbors for their q. If q_i is greater than all neighbors, i takes budget; else it passes token to the neighbor with highest q (or rotor tie-break). This may starve cells behind barriers. Not good.

What if the algorithm is: Each cell i maintains a local counter/age. At each step, every cell independently decides to request budget if its potential/resistance exceeds the average of its neighbors. The cell with smallest ID among requesters gets budget. But no global view. Hmm.

Let's search memory. There is a concept "cellular graph" in "OpenAI's debate? potential and resistance?" Maybe "potential and resistance" are terms from "cellular automata for resource allocation" by David Deutsch? Not sure.

Maybe the problem is from a prompt generation about "Lens: skeptic..." It might be asking to design an algorithm for "which cell of a cellular graph receives next unit of computation budget" given "per-cell potential and resistance". This sounds like a cellular automaton where each cell has "potential" (like voltage) and "resistance" (like electrical resistance). The rule could be Ohm's law: current flows along edges. The next unit of computation budget goes to the cell with the highest "current" or "power" dissipation? Local rule: compare potential drops across edges. Fairness? No starvation? Hmm.

Let's parse "potential and resistance values" exactly. In electrical circuits, potential and resistance determine current. A cell's "potential" and "resistance" could be used to compute a local priority: potential / resistance = current. The cell with highest current gets budget. Fairness? If a cell has high resistance, it gets less? "Resistance" might mean resistance to receiving budget? Or cost to compute? If resistance is high, maybe it should get less? Or more? The problem doesn't specify. We can define our own scoring function and justify.

Maybe the question expects: "Each cell computes its own priority as potential / resistance. It sends a request to its neighbors if its priority is greater than all neighbors' priorities. The next budget goes to the cell with the highest priority among those that receive no higher-neighbor veto. Ties broken by cell ID. Fairness: because after receiving budget, its potential decreases (or resistance increases), so its priority drops, allowing neighbors to win. No starvation: if a cell is starved, its potential keeps increasing (or resistance decreases), eventually exceeding all neighbors, so it becomes a local maximum and wins." This is a common answer. But it ignores multiple local maxima and global uniqueness. Maybe the problem allows multiple cells to receive? "which cell receives the next unit" singular. But in a distributed setting, multiple local maxima could each think they should receive. To resolve, we can use a token. But maybe they don't care about simultaneous conflicts; they ask "design a minimal local algorithm" and "explain fairness and no starvation". The simplest local rule: cell gets budget if its potential/resistance is highest among itself and neighbors. Fairness? Not necessarily if multiple. But if we assume synchronous rounds and only one cell can be selected by some tie-break (e.g., all cells with local max request, central arbiter picks one? But that uses global view). Not allowed.

Let's think of a rigorous local algorithm for unique next unit. The token+rotor is a solid answer. But does it use potential and resistance? We can incorporate them into the rotors. For example, at each cell i, the outgoing edge order is sorted by the neighbor's potential/resistance. The token visits i, i receives budget, then token advances to next neighbor in i's rotor. This uses only i and its direct neighbors (to sort? Actually to sort neighbors, i needs their p/r, which are direct neighbors; that's allowed). The order can be recomputed each time the token visits i, but to preserve rotor-router fairness, we should not reorder dynamically? If we recompute order based on current p/r, it's still a deterministic rule using local info. Does it guarantee no starvation? Not necessarily, because dynamic reordering might create a cycle that ignores some nodes. But we can make the order fixed at initialization or update only after a full cycle? If potentials change, we might want to adapt. We can use a "fair queuing" at each node: maintain a queue of neighbors ordered by their current priority, but each time a neighbor is served (token passed to it), its credit resets. This is like deficit round-robin. It might guarantee that every neighbor is eventually chosen by each node. But global starvation? If token visits a subset, some nodes not visited so their queues not updated. Hmm.

Maybe we can design a local algorithm that is both fair and uses potential/resistance to allocate budget, not just move token. How about: Each cell maintains an "urgency" counter. At each step, each cell compares its urgency to neighbors. If its urgency is strictly greater than all neighbors, it takes the next unit and resets its urgency to 0. If not, it increments its urgency by some function of potential/resistance. This is a local algorithm. Fairness: It's a local maximum selection. But multiple local maxima? We can use an asynchronous model: only one cell can take budget at a time. If multiple local maxima, they contend; use random backoff or token. But if we assume cells take budget when they are local maxima and can do so simultaneously, then it's not "next unit" but a set. If we want singular, we can say: "Run this as a distributed election: the cell with the highest urgency among all local maxima will eventually be the only one that does not see a higher neighbor? No, local maxima don't see each other. So cannot guarantee unique."

What if the graph is a tree? Then local maxima can be multiple. No global max selection possible without global info. So any deterministic unique next cell selection must involve a token or some global coordination. The problem says "no global view", but doesn't forbid a token. So token is necessary for unique selection.

Let's design a token-based algorithm that uses potential/resistance to decide which cell gets budget, and uses a fair rotor to move token. Maybe:

Algorithm:
- A single token circulates. When token is at cell i, cell i is the candidate for next budget.
- Cell i computes its priority q_i = p_i / r_i. It also knows neighbors' q_j.
- If q_i is greater than all neighbors' q_j, then i receives the budget (and updates p_i). Otherwise, it passes the token to the neighbor with the highest q_j (ties by rotor).
- If i receives budget, after updating, it passes the token to the neighbor with the highest q_j (or to its rotor next). This is a greedy walk toward local maxima. After serving a local max, its q drops, so token moves to another local max. But could starve cells in a basin that token never enters. To prevent, add a rotor that forces the token to visit all neighbors evenly. For example, when passing, choose between the highest-q neighbor and the next neighbor in a cyclic rotor, alternating: with probability 1/2 follow q, with 1/2 follow rotor. But deterministic? Use a rotor that cycles through all neighbors; on each visit, if q_i is not a local max, pass to neighbor with highest q; if q_i is local max, receive budget then pass to next in rotor. Still could be trapped? If token always follows q, it may never leave a basin. But if local max served, its q drops, maybe token goes to next highest. If all in basin drop, token may eventually go to boundary. If potentials are fixed and only decrease, eventually all served? But if a cell's q becomes 0, it may never get served again? That's okay? Fairness over time with new work? Not clear.

Rotor-router with fixed order is the simplest guaranteed no starvation. We can use potential/resistance to set the order. But if we want to use them dynamically, we can set the rotor order at each cell to be sorted by neighbor's q. But then the walk might not be recurrent. Let's test dynamic greedy walk: token at i, moves to neighbor with highest q. This is a deterministic greedy walk. On a finite graph with fixed q, it goes uphill to a local max and then stays (if allowed to stay) or cycles between equal q. If it can't stay, it moves to highest neighbor, which may be lower. It could get stuck in a cycle of two cells if they are mutual highest neighbors. Other cells starve. So not fair.

Thus, for guaranteed fairness, the local rule must include a fair exploration mechanism independent of q. Rotor-router is ideal. We can say: "Use potential/resistance to define the rotor order at each cell. Once set, the rotor-router guarantees each cell is visited infinitely often. Additionally, when a cell is visited, it receives budget if its potential/resistance exceeds its neighbors'? Or just always receives budget." The question says "decides which cell receives next unit ... given per-cell potential and resistance values." If token holder always receives, then potential/resistance only affects movement order, not who gets budget directly. But that's a valid local algorithm: the token holder is the cell that receives. The decision of which cell receives next is made by the movement rule, which uses potential/resistance. We can say: At each step, the token is at cell i. Cell i receives the next unit. Then it chooses the next cell to receive the following unit by selecting a neighbor using a local rule based on potential/resistance and a rotor to ensure fairness. This is a bit off because the next unit goes to i, not chosen by i. But the algorithm decides the sequence.

Maybe better: The token is at cell i. Cell i decides which cell receives the next unit: it can be itself or a neighbor. It uses a local rule: compute q for itself and neighbors; choose the one with highest q, but to prevent starvation, use a deficit round-robin: each cell i maintains a credit c_j for each neighbor j. At each visit, i gives one unit of budget to the neighbor j (or itself) with the smallest credit, then increments that credit by q_j. This is like weighted fair queuing. It uses local info. Does this prevent global starvation? If token moves to the chosen cell, it's a walk. If each cell uses weighted fair queuing to choose next token destination, could a subset be starved? Yes, if token never enters a subset. But if the graph is connected and each cell eventually gets visited, then it will choose all neighbors fairly. But to get visited, some neighbor must choose it. This is a mutual recursion. Rotor-router with fixed order solves it. Weighted fair queuing at each node with a token still might not guarantee global fairness. There is a known "fair walk" on graphs: a token that at each vertex chooses its next neighbor according to a rotor-router with a fixed cyclic order visits all vertices. If the order is fixed, it's fair. If the order is weighted by q, we can pre-sort neighbors by q and then cycle through them in that order. That's a fixed order (assuming q fixed). If q changes, we can recompute the order periodically. But then no deterministic guarantee during recomputation? We can just say q is given and fixed for the scheduling period; if it changes, recompute and the guarantee holds for each fixed period. That might be acceptable.

Let's outline a minimal local algorithm:

**Algorithm (Fair local token rotor):**
- Assume graph connected, finite. Each cell i has p_i (potential) and r_i > 0 (resistance). Define priority q_i = p_i / r_i.
- There is one token. Initially at any cell.
- When the token is at cell i, i receives one unit of budget (or if we want the token to choose the next cell, it chooses itself? Let's make it: the token holder is the cell that receives the next unit).
- After receiving, update p_i ← max(0, p_i - Δ) (or r_i ← r_i + Δ; any update that does not increase q_i). If potentials are static, skip update.
- Cell i then chooses the next token destination among its neighbors. It keeps a rotor pointer over N(i). The rotor order is the neighbors sorted by decreasing q_j (ties by fixed cell ID). On each visit, i advances its rotor to the next neighbor in this cyclic order and passes the token there. (If i has no neighbors, it stays; single cell trivial.)
- Only information at i and its direct neighbors (their q_j) is used to set the order; after that, i only uses its own rotor pointer and neighbor list.

Wait: To set the rotor order, i needs q_j of neighbors. That's allowed. But if q_j changes, the order might need updating. We can say: recompute the rotor order only when the token visits i and q_j has changed; but to preserve the no-starvation proof, we can use a "fair rotor" with dynamic priorities by cycling through all neighbors before re-sorting. Actually, we can design a deterministic fair algorithm that uses dynamic q without risking starvation: At each cell i, maintain a queue of neighbors. When visited, choose the neighbor with the highest q among those not yet passed to since the last time i completed a full cycle? This ensures every neighbor is eventually chosen. But does that guarantee global no-starvation? If the token visits i infinitely often, then i will eventually pass to every neighbor. But if i is never visited, it doesn't help. The token must visit all cells. The standard rotor-router with a fixed order guarantees all cells visited. If we change order, we might break the guarantee. However, we can use a two-level rotor: The primary rotor cycles through all neighbors in a fixed order. The secondary uses q to decide whether to follow the primary rotor or the highest-q neighbor? Hmm.

Maybe we don't need to use q in the token movement at all. We can use q to decide whether the token holder receives the budget. For example, token at i. It compares q_i with neighbors. If q_i is highest, i takes budget and token moves to next neighbor in fixed rotor. If not, i passes token to the neighbor with highest q, but this could starve. Alternatively, the token always moves according to a fixed rotor. When it arrives at i, i receives budget if its q_i exceeds the average of neighbors? But then some cells might never receive if they never meet condition. If q changes, eventually. Not guaranteed.

Another idea: Use a local "auction" or "market" where each cell's potential and resistance determine a bid. The token collects bids from neighbors. The cell with highest bid gets budget. To ensure fairness, each cell adds a "fairness bonus" that increases with time since last served. This is a classic scheduler: priority = potential/resistance + α * waiting_time. The token moves to the neighbor with highest priority. Since waiting_time increases for unserved cells, eventually they win. But token still might not reach them if they are not neighbors. However, if a cell is waiting, its neighbors also waiting? Not necessarily. But if the token is elsewhere, the waiting cell's bonus grows, but the token won't see it until it moves closer. If intermediate cells have low bonus, token won't move toward it. To fix, make the bonus grow for all cells. If the waiting cell's bonus grows, its neighbors' bonuses also grow if they are waiting. But if the token is stuck in a region, cells outside have growing bonus. Eventually the boundary neighbor's bonus may exceed the token region's cells, causing token to move out. This could work if bonus grows unbounded for all unserved cells. But if a neighbor is served, its bonus resets, creating a barrier? Let's analyze. Suppose token is in a cycle among cells A,B. Cell C outside is starved. C's bonus grows. B is neighbor of C. B might be served frequently so its bonus resets, but C's bonus grows. Eventually C's priority exceeds B's, but token at A or B must choose C. B only chooses C if token is at B and C has highest priority among B's neighbors. Since C's priority grows unbounded, eventually it will exceed A's. So token moves to C. So no starvation if bonuses grow unbounded. This is a local algorithm: each cell maintains time since last served. When token at i, it computes priority for itself and neighbors: priority_j = q_j + α * age_j. It moves to the neighbor with highest priority (or stays if itself highest). After moving, the new cell receives budget and resets age. This uses only i and neighbors (age_j can be known by i? i can ask neighbors for their ages). This guarantees no starvation? Need prove. If a cell C is never served, its age grows unbounded. For any cell B that is served infinitely often, its age is bounded. Consider the token's trajectory. If C is not served, it is never visited. Since graph connected, there is a path from token's current location to C. Let B be the first cell on that path that is visited infinitely often? Actually, the token might be confined to a subset S of cells that are visited infinitely often. If C not in S, then the boundary of S has a cell B in S adjacent to C (or to a path to C). Since C's age grows unbounded, its priority eventually exceeds any bounded priority of neighbors of B in S. When token is at B, B will choose the neighbor with highest priority. If C is a direct neighbor, eventually B chooses C, so C gets served. If C is not direct, let D be a neighbor of B on path to C. If D is not served, its age also grows unbounded. Eventually D's priority exceeds other neighbors, so token moves to D. Then repeat. So token eventually reaches C. This is a known result for "age-based routing" with unbounded ages. So this algorithm is fair and no starvation deterministically. It uses only local info: current cell knows its own and neighbors' potentials, resistances, and ages. It doesn't need global view. This is a minimal local algorithm. And it directly uses potential/resistance to decide which cell receives next budget. This might be the best answer!

Let's formalize: At each step, a token is at some cell. The token holder (or scheduler) needs to decide which cell gets the next budget. The decision can be made by the token holder: it considers itself and its direct neighbors. For each candidate j, compute priority
\[
\pi_j = \frac{p_j}{r_j} + \alpha \, a_j
\]
where \(a_j\) is the time (or number of rounds) since j last received a budget. (Or \(a_j = \text{waiting time}\)). The token moves to the candidate (itself or neighbor) with the largest \(\pi_j\). Ties broken by smallest ID. The chosen cell receives the next unit. Then its \(a\) resets to 0, and all other cells' ages increase by 1? Actually, ages can be maintained locally: each cell increments its own age each round unless it receives budget. But the token holder only needs the ages of itself and neighbors. It can query them. Since ages grow, eventually unserved cells win.

Wait: The token moves to the chosen cell. If the chosen cell is a neighbor, the token moves there. If it's itself, it stays? If it stays, it could keep choosing itself if its priority remains highest. But after receiving, its age resets to 0, and p decreases. So its priority drops. It may still be highest if p/r is huge. But eventually others' ages grow and p/r drops. However, if it stays, it can receive multiple units in a row. That's allowed if it's the most urgent. But no starvation because ages grow.

But if the token stays at i, it only sees i and its neighbors. If a cell C far away is starved, its age grows, but the token might never move toward it if intermediate cells are not chosen. However, as argued, the boundary neighbor of the token's visited region will eventually have its age grow if not served. Wait, if token is stuck at i, i's neighbors' ages grow. Eventually the neighbor with highest p/r + age will exceed i's priority, so token moves to that neighbor. Then that neighbor's neighbors' ages grow, etc. So token will eventually move out. Thus it reaches all cells. This is a deterministic local algorithm that guarantees no starvation.

Let's verify: Suppose token at i. It chooses max over {i} ∪ N(i). If i keeps winning, its age resets to 0. But its neighbors' ages increase. Eventually a neighbor j has π_j > π_i, so token moves to j. Then j receives, resets. Now i's age increases. If j keeps winning, its neighbors' ages increase, eventually token moves to one of them. So token can move. It might wander, but since ages grow unbounded for unserved cells, any finite set of cells that excludes some cell C will eventually have a boundary neighbor with age growing, forcing token to move out. By induction, C will eventually be visited. This is a standard "fair scheduling with aging" proof.

This algorithm only uses current cell and direct neighbors. It does not require global view. It uses potential and resistance via priority p/r. It is minimal: one token, local comparison, age counter per cell. Fairness: each cell's priority increases with waiting time, so no cell can be permanently ignored. No starvation: if a cell never receives, its age grows unbounded, eventually exceeding any neighbor's priority, so it will be selected when the token is adjacent; by connectedness, the token reaches it.

We can present this as the answer. We should also mention tie-breaking and age update. Let's define clearly:

- Graph G connected, finite.
- Each cell i stores:
  - potential p_i
  - resistance r_i > 0
  - age a_i (initially 0)
- A single token indicates the current decision point. Initially token at any cell.
- At each allocation step:
  1. Let i be the cell holding the token.
  2. For each j ∈ {i} ∪ N(i), compute score \(s_j = p_j / r_j + \lambda a_j\), where \(\lambda > 0\) is a small positive constant (or just use \(a_j\) if p/r normalized). Higher score = more deserving.
  3. Choose j* = argmax s_j over {i} ∪ N(i). Ties broken by smallest cell ID (or a fixed cyclic rotor).
  4. Cell j* receives one unit of computation budget.
  5. Update p_{j*} (e.g., decrease by the amount of work done, or increase resistance) to reflect that it has been served. Reset a_{j*} = 0.
  6. For all other cells, increment their age by 1 (or just when they are candidates; they can increment locally each step).
  7. Move the token to j* (if j* ≠ i, the token moves along the edge; if j*=i, it stays).
- Repeat.

This uses only i and its direct neighbors: i can read p_j, r_j, a_j for j in N(i) (and its own). It doesn't need global max.

Why fair:
- The score combines urgency (p/r) and waiting time (a). A cell that has not been served for a long time has a growing age term. For any fixed finite set of cells that might be repeatedly chosen, their ages reset, so their scores are bounded. Any cell outside this set has age increasing without bound. Therefore, eventually its score exceeds all scores in the set. Since the graph is connected, the token cannot avoid crossing the boundary: when the token is at a boundary cell, the starved cell or an intermediate cell on the path will have higher score and be chosen. By induction, the token must eventually reach and serve the starved cell.
- Thus no cell can be starved forever. In the long run, every cell receives budget infinitely often.

Why cannot starve:
- Suppose cell c is never served. Then a_c → ∞. Consider the connected component of cells that are served infinitely often, containing the token's recurrent region. If c is not in it, there is an edge from a cell u in the region to a cell v outside (or on the path to c). Since v is not served infinitely often (or not at all), its age also grows unbounded. When the token is at u, v's score will eventually exceed u's and all other neighbors', so the token moves to v. Repeating along a path to c, the token eventually reaches c. Contradiction. Hence c must be served infinitely often.

We should be careful: If a cell is served sometimes, its age resets, but if it's not served infinitely often, its age grows between serves. The proof can be formalized with a finite set S of cells that are served infinitely often. If S is not all cells, there is a boundary edge (u,v) with u∈S, v∉S (or v leading to c). v's age grows unbounded because it is served finitely often. When token at u, eventually v's score > u's, so token moves to v. Then v is served at least once, contradiction? Actually v might be served finitely often. Once token moves to v, v gets served, resetting age. But then token might move back to S. v's age can reset, but since v is served finitely often, eventually it stops being served and its age grows. But if token moves to v, v is served, so v is in S? Wait, if token moves to v, v receives budget. If this happens infinitely often, v is served infinitely often, so v∈S. Since v∉S, this can only happen finitely often. But v's age grows unbounded, so eventually it must happen, contradiction. Thus S must include v. Therefore S is all cells. This is a standard argument.

We should also define the score. If p_i and r_i are such that p/r can be negative? Resistance positive, potential maybe non-negative. Age term positive. We can use \(s_j = \alpha \frac{p_j}{r_j} + a_j\) with α>0. Or simply \(s_j = p_j / r_j + \epsilon a_j\). The key is age grows unbounded. Even if p/r is unbounded? Potentials might be infinite? Assume finite. If p/r can change, the age term still ensures fairness as long as p/r is bounded for cells served infinitely often? If a cell's p/r grows unbounded even when served, it might dominate. But fairness is about no starvation; if a cell has huge potential, it may get more budget, but others still get some due to age. If p/r can grow unbounded for one cell despite frequent service, it might always win, starving others? If it's served, its p decreases, so it shouldn't grow unbounded. If new work arrives faster than served, it could. But then it's not starved; others might be. To guarantee no starvation, we need age term to eventually dominate any finite p/r. If p/r can be unbounded, no algorithm can guarantee fairness without bounding it. The problem likely assumes potentials are finite and decrease when served. We can state assumptions: potentials are finite and update so that a served cell's score does not increase without bound; or we can use only age for fairness and p/r as a bounded tie-breaker. For example, use \(s_j = a_j + \epsilon \frac{p_j}{r_j}\) with \(\epsilon\) small. Since a_j grows unbounded, it will eventually dominate any fixed p/r. If p/r can be unbounded, we can cap it or use it only to break ties among equal ages. To be safe: Define score \(s_j = (a_j, \frac{p_j}{r_j})\) lexicographically: first maximize waiting time, then potential/resistance. Then fairness is absolute: the cell with the largest waiting time among candidates is chosen. This ignores potential/resistance except as tie-breaker. But the problem says "given per-cell potential and resistance values", so we should use them. We can use a weighted sum with a sufficiently large age coefficient? But if p/r can be arbitrarily large, no fixed coefficient works. Lexicographic with age first guarantees no starvation but doesn't use p/r much. Alternatively, use \(s_j = a_j + \frac{p_j}{r_j}\) and assume p/r bounded. Or use \(s_j = a_j \cdot \frac{p_j}{r_j}\)? If p/r > 0, age grows, so eventually dominates. If p/r can be 0, then a cell with 0 potential never gets? But if potential is 0, it doesn't need budget. Fairness for cells that need it. We can define potential as non-negative demand; if a cell has 0 potential, it doesn't need budget. If it later gets potential, it will have age growing. Hmm.

Let's not overcomplicate. In typical scheduling, priority = potential/resistance + waiting_time. Waiting time grows unbounded, so eventually overcomes any fixed potential/resistance. If potential/resistance changes, we assume it is bounded or changes slowly. The question likely expects a simple explanation.

We can also mention that the algorithm is "minimal" because it only requires a single token, local score comparison, and an age counter. It does not need global coordination or a global max.

Let's consider if there is an even simpler local rule: "Each cell i computes a local urgency u_i = p_i / r_i. It sends a request to its neighbors if u_i is greater than all neighbors' u_i. The cell with the highest u_i among those that receive no higher-neighbor veto gets budget. Ties broken by ID. Fairness: after receiving, p_i decreases, so its urgency drops. If a cell is starved, its p_i increases, eventually it becomes a local maximum and gets budget." This is simpler but doesn't solve multiple local maxima. We can add a token to resolve. The token-based aging algorithm is more robust.

Let's craft the final answer. We need be clear and concise. The user asks: "Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

We should answer in a structured way:
- Define graph and variables.
- State the algorithm.
- Explain fairness/no starvation.
- Mention assumptions (connected finite graph, positive resistance, bounded potential or age dominates).

Let's write:

**Local aging token algorithm**

Let \(G=(V,E)\) be a finite connected cellular graph. For each cell \(i\):
- \(p_i\): potential (pending work)
- \(r_i > 0\): resistance (cost)
- \(a_i\): age = number of rounds since last served (initialized 0)

Define local score:
\[
s_i = \frac{p_i}{r_i} + \lambda a_i
\]
with \(\lambda > 0\). (Or lexicographic \((a_i, p_i/r_i)\) for a fully starvation-free version.)

Maintain a single token. Initially at any cell.

At each step, let \(i\) be the token's cell. Cell \(i\) looks at itself and its direct neighbors \(N(i)\). It computes \(s_j\) for all \(j \in \{i\} \cup N(i)\). It selects
\[
j^* = \arg\max_{j \in \{i\} \cup N(i)} s_j
\]
with ties broken by smallest fixed ID (or a fixed cyclic rotor).

Cell \(j^*\) receives the next unit of budget. Update \(p_{j^*}\) downward (or \(r_{j^*}\) upward) to reflect service; reset \(a_{j^*}=0\). All other cells increment their ages by 1. Move the token to \(j^*\) if not already there.

**Why local:** Only the current token cell and its immediate neighbors' \(p, r, a\) are inspected. No global max or global view is needed.

**Fairness / no starvation proof sketch:**
- The age term \(a\) increases without bound for any cell that is not served. For any cell that is served, its age resets.
- Suppose some cell \(c\) is starved forever. Then \(a_c \to \infty\). Consider the set \(S\) of cells that are served infinitely often. Since the graph is connected, if \(c \notin S\), there is a boundary edge from \(u \in S\) to \(v \notin S\) on a path to \(c\). Cell \(v\) is served only finitely often, so its age \(a_v\) also grows without bound. When the token is at \(u\), \(v\)'s score eventually exceeds \(u\)'s and all other neighbors' scores, so the token must move to \(v\). This makes \(v\) served, contradicting \(v \notin S\) (if it happens infinitely often) or at least it cannot happen only finitely often once \(a_v\) is large. By induction along a path to \(c\), the token must eventually reach and serve \(c\). Contradiction.
- Therefore every cell is served infinitely often. No cell can be starved forever.

We can also note: If potentials are fixed and not updated, the age term still guarantees fairness, but the algorithm may serve cells with low potential just because they have waited long. If you want service proportional to potential/resistance, use a bounded age bonus or a deficit round-robin. But the question asks fairness and no starvation, so aging is appropriate.

Let's ensure the proof is rigorous enough. The boundary argument: Let S be the set of cells that receive budget infinitely often. S is nonempty (token starts somewhere). If S ≠ V, since G connected, there exists an edge (u,v) with u∈S, v∉S. Since v∉S, it receives budget only finitely often, so after some time its age a_v grows by 1 every round. u receives budget infinitely often, so its age is bounded above? Actually, u's age resets whenever it receives, but between resets it can grow. Since u receives infinitely often, the maximum age between resets could be unbounded if the gaps between services grow. But the gaps might grow unbounded. However, we only need that u's score is eventually less than v's. u's p/r might be bounded (assuming bounded potential). u's age could also grow if gaps are long. But if u is not served for a long time, then token is elsewhere. But when token is at u, u is a candidate. If v's age grows, eventually v will exceed u. But what if token is never at u? u∈S means u is served infinitely often, so token is at u infinitely often. So at those times, u's age is 0 (just reset before? Actually when token at u, before selection, u's age is time since last served. If u was just served, age 0. If token arrives at u, u's age might be >0. But since u is served infinitely often, the time since last served at the moment token is at u could be bounded? Not necessarily. But we can consider the moment when token is at u and u is not served? Wait, if token is at u, u is a candidate. If v's score is higher, token moves to v and v gets served. So if u is served infinitely often but v is not, eventually when token is at u, v's score will be higher, so token moves to v, serving v. This would make v served infinitely often (since u is visited infinitely often and v's age grows again), contradiction. Thus v must be in S. So S = V.

We need to handle u's score. u's score = p_u/r_u + λ a_u. At the moment token is at u, a_u is the time since u was last served. Since u is served infinitely often, a_u could be large if u hasn't been served for a while. But v's age grows unbounded monotonically. u's age is reset whenever u is served. But when token is at u, if u is served, then u's age resets. If v's score is not higher, u may be served. But v's age keeps growing. Eventually, v's score will exceed u's score regardless of u's age? No, u's age could also be growing if u is not served. But u is served infinitely often, so its age is bounded by the maximum gap between visits to u. Since u is visited infinitely often, the sequence of gaps could be unbounded, so u's age could be unbounded. However, v's age grows every round. We need to compare at the times token is at u. If u's age at those times is unbounded, it might keep up with v? But v's age is always larger than the time since v was last served. Since v is served finitely often, after some time v is never served, so v's age equals global time minus last service. u's age at time t is t - last service of u. Since u is served infinitely often, last service of u can be close to t, so u's age can be small. But it could also be large if u hasn't been served for a while. However, if u hasn't been served for a while, then v's age is even larger (since v hasn't been served at all for longer). Actually, u's last service time is ≤ current time. v's last service time is fixed at some finite time T. For t > T, v's age = t - T. u's age = t - L_u, where L_u is the last time u was served. Since L_u ≥ T? Not necessarily. If u was served after T, then L_u > T, so u's age = t - L_u < t - T = v's age. So v's age > u's age. If u hasn't been served since before T, then L_u ≤ T, so u's age ≥ v's age. But u is served infinitely often, so eventually L_u > T. After that, v's age is always larger than u's age. Thus at any time after u's last service > T, v's age > u's age. So v's score will dominate u's (assuming p/r bounded). So eventually when token is at u, v's score is higher. Thus token moves to v. This makes v served infinitely often. Contradiction. So S=V.

This proof works if p/r is bounded. If p/r unbounded, we can use lexicographic age first, then p/r. Then age comparison alone ensures v wins. So to be fully rigorous, we can define score lexicographically: first maximize age \(a_j\), then maximize \(p_j/r_j\). Then fairness is absolute: a cell with larger age always wins. Since ages of unserved cells grow, they will eventually have the largest age among neighbors. This guarantees no starvation regardless of p/r. But then potential/resistance only break ties among cells with equal age. Is that acceptable? The problem says "given per-cell potential and resistance values" – we can use them as secondary criterion. But maybe they want them to be primary. We can use a weighted sum and state the assumption that p/r is bounded or that the age coefficient is chosen large enough. Or we can say: "Use score \(s_j = a_j + \epsilon \frac{p_j}{r_j}\) with \(0 < \epsilon < 1/\max(p/r)\)" but if p/r unbounded, no. Simpler: "Use lexicographic: prefer higher age; if ages equal, prefer higher potential/resistance." This is minimal and guarantees fairness. But does it "decide which cell receives next unit given potential and resistance"? Yes, it uses them as tie-breaker. But if ages are never equal, p/r never used. We can make age a "deficit" counter and p/r a weight: \(s_j = a_j \cdot r_j + p_j\)? Hmm.

Maybe we can use a "deficit round-robin" with weights derived from p/r. Each cell has a deficit that increases by weight when not served. At each step, choose neighbor with largest deficit. This is classic weighted fair queuing. The deficit grows unbounded for unserved cells, so no starvation. Potential/resistance determine the weight: e.g., weight \(w_j = p_j / r_j\). Deficit \(d_j\) increases by \(w_j\) each round it is not served. When served, \(d_j\) decreases by total weight. This uses potential/resistance and guarantees fairness. But the algorithm must use only current cell and neighbors. It can query neighbors' deficits. This is local.

Let's design a cleaner version:

- Each cell i has a deficit counter \(d_i\), initialized 0.
- Define weight \(w_i = p_i / r_i\) (or any positive function).
- At each step, token at i. For each j ∈ {i} ∪ N(i), compute \(s_j = d_j + w_j\)? Actually, standard deficit round-robin: choose the cell with the smallest deficit? Or largest? Let's define: Each cell accrues credit at rate \(w_j\). When it receives budget, its credit is reduced by the total weight of all candidates? That's complex. Simpler: Use score \(s_j = w_j + \alpha a_j\). This is fine.

Given the desired oververbosity 5, we can present the aging token algorithm with score \(s_j = p_j/r_j + \lambda a_j\), and note that for strict no-starvation, use age as a tie-breaker or ensure \(\lambda a_j\) eventually dominates. Then proof sketch.

Let's also address tie-breaking. Ties can be broken by fixed cell ID. This is local because the current cell knows the IDs of its neighbors? If IDs are global, but tie-breaking only among direct neighbors, so it's local. Or use a rotor to avoid ties.

We should mention that if the graph is not connected, no algorithm can reach disconnected components. So assume connected.

Let's write the final answer in a clear, skeptical tone: "Here is a rule that can be checked from the stated premises." We can say: "Assume a finite connected graph, positive resistances, and that receiving budget does not increase a cell's score without bound. Then..."

Maybe include pseudocode:

```
init a[i] = 0 for all i
token = arbitrary cell
loop:
    i = token
    candidates = {i} ∪ N(i)
    for j in candidates:
        s[j] = p[j]/r[j] + λ a[j]
    j* = argmax s[j] over candidates
    // tie: smallest id
    serve(j*)
    p[j*] = update(p[j*])   // e.g., p[j*] = max(0, p[j*]-c)
    a[j*] = 0
    for k in V \ {j*}: a[k] += 1   // or only increment when needed
    token = j*
```

Wait: The loop increments ages for all cells globally. But the rule must use only a cell and its direct neighbors. The token holder doesn't need to know all ages; each cell can maintain its own age locally by incrementing every round it is not served. The token holder queries neighbors' ages. That's local. The global increment is just a conceptual way to maintain age; each cell does it locally.

We should clarify: "No cell needs a global view. Each cell only stores its own \(a\), and when it is the token's current cell it reads \(a_j\) for \(j\) in its closed neighborhood."

Now, fairness proof:

- For any cell not served, \(a\) grows by 1 per round.
- Suppose cell c is never served. Consider the path from the token's recurrent region to c. Let u be the last cell on this path that is served infinitely often. Its neighbor v (toward c) is served finitely often. Then \(a_v \to \infty\). When the token is at u, v's score eventually exceeds u's and all other candidates, so the token moves to v. This serves v infinitely often (since u is visited infinitely often and v's age keeps resetting but then grows again), contradiction. Hence c must be served. This is a bit hand-wavy but acceptable.

We can phrase: "By induction along the path, every cell on the path is served infinitely often. Therefore c is served infinitely often."

Let's ensure we don't claim "cannot starve forever" without caveats. We can say: "Under the standard assumption that potentials/resistances are bounded or that the age term is given priority, no cell can starve forever." If we use lexicographic age first, we don't need bounded potentials. Let's define the algorithm with lexicographic score to be bulletproof:

Score for cell j: \(s_j = (a_j, p_j/r_j)\). Choose the candidate with the largest age. If ages tie, choose the one with largest potential/resistance. Ties further by ID.

This guarantees fairness absolutely. But does it use potential/resistance? Yes, as a tie-breaker. If we want to use them more, we can say: "If you want potential/resistance to influence decisions even when ages differ, use \(s_j = a_j + \epsilon \frac{p_j}{r_j}\) for some small \(\epsilon\) and assume \(p/r\) is bounded. For a fully starvation-proof version, make age the primary key." This is a good skeptical approach: we state the assumption.

Maybe the problem expects "potential and resistance" to be used in the priority. I'll present the weighted sum as the main rule, and mention the lexicographic variant for strict no-starvation. That should cover both.

Let's also consider if the graph is a cellular graph, each cell might only communicate with direct neighbors. The token moves along edges. The current cell can ask neighbors for their potential/resistance/age. That's local.

Let's write the final answer now. It should be not too long, but enough to explain.

We need answer the user's question directly. Let's structure:

1. Assumptions.
2. Algorithm.
3. Why local.
4. Fairness/no starvation proof.

Let's draft:

**Assumptions:** finite connected graph; \(r_i > 0\); \(p_i\) finite; a served cell's \(p_i\) is reduced (or at least its score does not grow without bound).

**Algorithm:**
- Each cell i keeps \(a_i \leftarrow 0\).
- Token at i.
- Compute \(s_j = p_j/r_j + \lambda a_j\) for \(j \in \{i\} \cup N(i)\).
- Choose \(j^*\) maximizing \(s_j\), tie by lowest ID.
- \(j^*\) gets next budget. Update \(p_{j^*}\), reset \(a_{j^*}=0\). All other cells increment \(a\) by 1. Token moves to \(j^*\).

**Why fair/no starvation:**
- A starved cell's age grows unbounded, so its score eventually exceeds any cell that is served regularly (because those reset their ages). Thus when the token is adjacent to it, it will be chosen. Since the graph is connected, the token cannot remain forever in a subset that excludes it; the boundary cell's age grows, forcing the token to cross. By induction, every cell is reached. Hence no cell is starved forever.

We can also mention: "If \(p/r\) can be unbounded, use lexicographic \((a_j, p_j/r_j)\) instead of the sum. Then age alone guarantees the same argument."

Let's include a small note on tie-breaking: "Ties are broken by a fixed rule (e.g., smallest cell ID or a cyclic rotor at the current cell) to keep it deterministic and local."

Let's finalize.

## answer

Assume the cellular graph is finite and connected. Each cell \(i\) has:

- \(p_i\): potential (pending work),
- \(r_i > 0\): resistance,
- \(a_i\): age, i.e. number of rounds since it last received budget.

A single token marks the current decision point. Initially the token is at any cell, and all \(a_i=0\).

### Minimal local rule

When the token is at cell \(i\):

1. Consider only \(i\) and its direct neighbors \(N(i)\).
2. For each candidate \(j \in \{i\}\cup N(i)\), compute
   \[
   s_j = \frac{p_j}{r_j} + \lambda a_j
   \]
   for some fixed \(\lambda>0\).  
   Higher \(s_j\) means “more deserving.”
3. Choose the candidate
   \[
   j^* = \arg\max_{j \in \{i\}\cup N(i)} s_j
   \]
   breaking ties by a fixed local rule, e.g. smallest cell ID.
4. Cell \(j^*\) receives the next unit of computation budget.
5. Update its potential \(p_{j^*}\) downward, or otherwise adjust it to reflect service. Reset \(a_{j^*}=0\).
6. Every other cell increments its age by 1.
7. Move the token to \(j^*\).

This uses only the current cell and its direct neighbors. No global maximum or global view is required.

For a fully starvation-proof variant, replace the weighted sum by the lexicographic score
\[
(a_j,\; p_j/r_j),
\]
i.e. prefer the oldest cell first, then use potential/resistance as a tie-breaker.

### Why it is fair

A cell that is not served has its age \(a_j\) increase without bound. A cell that is served regularly has its age reset. Therefore, eventually the age term of any starved cell dominates the scores of cells that are being served.

So if a cell is ignored for too long, it becomes locally unbeatable: when the token reaches any neighbor of it, that neighbor will prefer the starved cell.

### Why it cannot starve a cell forever

Suppose some cell \(c\) never receives budget. Then \(a_c \to \infty\).

Consider the set of cells that do receive budget infinitely often. Since the graph is connected, if \(c\) is outside that set, there is a boundary edge from an often-served cell \(u\) to a not-often-served cell \(v\) on a path toward \(c\). Cell \(v\)’s age also grows without bound. When the token is at \(u\), \(v\)’s score eventually exceeds \(u\)’s and all other local candidates, so the token must move to \(v\). Repeating along a path to \(c\), the token must eventually reach and serve \(c\).

Contradiction. Hence every cell is served infinitely often. No cell can be starved forever.
