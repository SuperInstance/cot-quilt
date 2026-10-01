# sample 1 — lens: an engineer who wants the smallest mechanism that could work

## seed_requested
{"seed": 25780, "bits16": "0110010010110100", "source": "mothquantum/coin-toss-v1:1shot", "entropy_bits_true": 16, "job_ids": ["d388d133-27b3-4b84-9c21-6d4c12bc528d", "aa6a628f-7234-416e-8d9a-8d97fc34bb1b", "f29c1aba-11f3-4784-b355-5ae3a8c28506", "10f71e2b-01a6-4446-8fd0-35e9cceafebe", "a5faa6dc-588a-4330-8f06-64b193ee7c25", "176ef730-adb3-4e90-8d7c-893f05ad84f3", "f72d17ef-bf02-4869-8374-6c789cb1ee06", "7cd0245a-9a73-4aec-8595-737e41bcbe7e", "9c3c1bdd-b7e3-4767-9fd7-3f91d645fa4e", "73edb70e-dd52-4791-a693-e3aaa2d1458b", "d8e9db98-cc77-4b30-93ea-babf6ebd0e84", "bcae73ea-748f-445f-9c87-5fd880f6c5ab", "3765c41d-c84c-48ad-a0f6-3c21059cf57c", "1ff43127-c1fb-455a-987f-cae0f71ffdf4", "c5ae3b70-9c1b-4d71-9af5-302fe25b35b9", "3cd56a9f-35fa-43b2-b725-5a87eae51d06"]}

## chain-of-thought

We need answer. Need parse. User asks: "Lens: you are an engineer who wants the smallest mechanism that could work.

Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

We need craft response. Need design minimal local algorithm. Need infer context? Cellular graph, cells have potential and resistance. Decide which cell receives next unit computation budget. Local rule only cell + direct neighbors. Fair, no starvation. Need likely from distributed scheduling? We can propose local election/token? "Smallest mechanism that could work." Need maybe use potential/resistance to choose among neighborhoods. Need ensure global one winner? If only local info, can we decide which cell of entire graph gets next budget without global view? That's impossible if each cell independently decides and only neighbors, unless budget token passes locally and eventually? Need clarify. The prompt asks "Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

Maybe from "cellular graph" and "potential/resistance" sounds like "self-organizing scheduling using electric network / random walk"? Need decide which cell receives next computation budget. We can use local token circulating. At each step, the cell currently holding the token chooses among itself and neighbors based on potential/resistance? It can only use local info. Need fairness/no starvation.

Let's identify possible desired algorithm. There is cellular graph (nodes/cells) with per-cell potential (maybe ability/need) and resistance (cost). Need allocate next unit computation budget. Minimal local algorithm: At each cell, compute weight = potential / resistance? Or resistance to receiving? Then send token to neighbor with max weight? But if always max local, may starve low potential. Need fairness.

Could use "random walk with probabilities proportional to potential / resistance" local. The token holder moves to itself or neighbor with probability based on local potential/resistance. This uses only local values. Fair and no starvation? A finite irreducible random walk on connected graph visits every cell infinitely often with probability 1, regardless of biases positive. If probabilities >0 for all edges/self, no starvation. But does it decide "which cell receives next unit"? Yes, token location gets budget. Need include potential/resistance. But if probabilities can be zero, starvation possible. Ensure positive minimum.

However, prompt says "given per-cell potential and resistance values." Maybe potential and resistance values are like "potential" and "resistance" in electrical network; current flows from high potential to low through resistance. The cell receiving next budget might be chosen by current? Hmm.

Let's read wording carefully: "Lens: you are an engineer who wants the smallest mechanism that could work.

Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

This might be a hypothetical in AI agent? They want algorithm for "cellular graph" maybe "cellular automaton" with potential and resistance. "next unit of computation budget" maybe in "neural cellular automata" or "morphogenesis"? Need answer in engineering lens. We can propose minimal local algorithm. Need maybe "token passing / random walk" is smallest. Use potential/resistance as edge weights to bias token. Fairness via positive probability and ergodicity. No global view.

Need explain fairness and starvation. Need maybe define fairness as each cell eventually receives budget (not necessarily equal). If want equal long-run fairness, random walk may not be uniform if biased; but if we choose weights by potential/resistance, fairness can mean high potential/low resistance get more. Starvation: if all transition probabilities remain strictly positive and graph strongly connected, each cell has positive probability of being reached from every other. A finite irreducible Markov chain is recurrent: with probability 1 each cell is visited infinitely often. If deterministic? Need randomness. If randomness not allowed, token might cycle deterministic and maybe skip? If we include self-loop and deterministic max, could starve. So minimal mechanism likely requires randomness. But "smallest mechanism" maybe can use deterministic local comparison with "age" or "last service" to avoid starvation? But per-cell potential/resistance only. Need use only cell and neighbors. If deterministic and local, can we guarantee no starvation globally? With local info only and no memory? It can be impossible to ensure global fairness. But with token and memory, maybe can implement round-robin? But if token only at one cell, each cell can know last received? Direct neighbors? Hmm.

Question: "given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view)." It asks design a minimal local algorithm. It might expect "randomized local token: at each step, current cell selects itself or a neighbor with probability proportional to potential/resistance, ensuring positive. This uses local info. Fair because positive probability, connected graph -> irreducible Markov chain -> visits all infinitely often, no starvation." That seems plausible.

Need maybe mention if graph not connected, each component separately; no cross-component fairness unless multiple tokens. If connected.

Need define algorithm clearly:

State: a single token representing the next unit of budget. Initially token at any cell. At each scheduling round:
1. Token-holder i observes itself and neighbors N(i) (indices, p_j, r_j).
2. Compute local weight for each j in {i}∪N(i):
   w_j = max(ε, p_j / r_j) maybe potential/resistance. Or if resistance means higher resistance should get less, use p_j/(r_j+ε). If potential is "need/desire", resistance is "cost/reluctance", choose more potential and less resistance.
3. Normalize probabilities q_j = w_j / Σ_{k∈{i}∪N(i)} w_k.
4. Draw j ~ q. Send token to j. Cell j receives the next unit of computation budget.

Need ensure self included. Direct neighbors only. If no self, random walk on graph with positive edges. Including self helps avoid unnecessary movement but not necessary. Need positive floor ε to avoid zero weights. If p_j>0 or r_j finite. Use max(w, ε) to ensure q_j>0 for all neighbors and self. If p=0 or r=∞, still small chance. Or if some cells should never get? But fairness asks no starvation.

Why fair? The token process is an irreducible Markov chain on finite connected graph because q_{i→j}>0 whenever j=i or j∈N(i). Since graph connected and self-loops positive, states communicate. Therefore stationary distribution exists. Long-run fraction of budget to cell j is proportional to some stationary distribution. If want exact formula? For random walk with transition q_{i→j} = w_j / W_i, stationary π_j ∝ w_j * ? Wait transition from i to j depends on w_j / sum_{k∈N(i)∪{i}} w_k. This is not symmetric due denominator W_i. Stationary distribution not simply w_j. Let's derive. If transition P_{ij}=w_j / W_i for j∈N(i)∪{i}, W_i=Σ_{k∈N(i)∪{i}} w_k. This is a random walk with target weights. Stationary π satisfies π_j = Σ_i π_i w_j / W_i = w_j Σ_i π_i / W_i. Let C = Σ_i π_i / W_i. Then π_j = C w_j. Normalize C = 1/Σ_k w_k. So π_j = w_j / Σ_k w_k. Nice! Because P_{ij}=w_j/W_i, detailed? Check π_i P_{ij}= (w_i/Z)(w_j/W_i). π_j P_{ji}= (w_j/Z)(w_i/W_j). Not equal unless W_i. But stationarity works? π_j = Σ_i π_i P_{ij}=Σ_i (w_i/Z)(w_j/W_i)= (w_j/Z)Σ_i w_i/W_i. Need Σ_i w_i/W_i =1? Not generally. Wait W_i = sum over neighbors incl self of w_k. Σ_i w_i/W_i not 1. So my formula wrong. Let's solve: π_j = w_j Σ_i π_i / W_i. Let C = Σ_i π_i / W_i. Then π_j = C w_j. Then C = Σ_i C w_i / W_i => if C>0, 1 = Σ_i w_i/W_i. Not generally. So no stationary of that form unless condition. Actually P_{ij}=w_j/W_i is not generally reversible? Let's test two nodes: w1=1,w2=9. W1=10, W2=10. P12=0.9, P21=0.1, self P11=0.1, P22=0.9. Stationary π1 = π1*0.1 + π2*0.1? Wait P21= w1/W2=0.1. π1=0.1π1+0.1π2 => 0.9π1=0.1π2 => π2=9π1, so π∝w. Here Σ w_i/W_i=1/10+9/10=1 yes. For general graph? Let's derive stationarity condition.

P_{ij}=w_j/W_i for j in N(i)∪i.
Stationary: π_j = w_j Σ_{i: j∈N(i)∪i} π_i/W_i.
If π_j ∝ w_j then need 1/Z? π_j=w_j/Z => w_j/Z = w_j Σ_i (w_i/Z)/W_i => 1 = Σ_i w_i/W_i. Not true. So not simply.

But fairness/no starvation doesn't require exact stationary. Irreducibility and positive self loops enough for positive recurrent, all states visited infinitely often. Long-run frequencies are stationary distribution, not necessarily proportional to potential/resistance, but biased.

If we want weighting by potential/resistance in a principled way, use Metropolis-Hastings or edge weights. But minimal? Maybe use random walk with target weights and accept/reject? Need only local. To get stationary ∝ w_i, we can use Metropolis-Hastings: current i proposes neighbor j uniformly; accept with min(1, w_j/w_i). Then stationary ∝ w_i. But uses only local. However potential/resistance as target? Could define w_i = potential_i / resistance_i. At each step, token at i:
- choose uniformly among i and neighbors.
- if chosen j=i, stay.
- else accept move to j with probability min(1, w_j/w_i); otherwise stay.
This uses i and j only; w_j known by neighbor? It uses cell and direct neighbor. It yields stationary distribution proportional to w. Fairness? Positive if w>0 and graph connected. No starvation. But acceptance may reject if w_j low; still positive? If w_j=0, never move to it, starvation. Need epsilon.

But simpler: choose among neighbors with probability proportional to w_j and self. It uses only local. It is irreducible if all q>0. It will visit all infinitely often, but long-run distribution not simple. Fairness maybe "each cell gets service eventually" not "proportional". The prompt asks "given per-cell potential and resistance values" likely expects using them in rule. Could say use w = potential/(resistance+ε) as unnormalized desirability. Then local probabilistic token. That's minimal.

Need maybe mention "resistance" maybe edge resistance? The wording: "given per-cell potential and resistance values." Per-cell potential and resistance. Could be like each cell has potential (how much it wants computation) and resistance (threshold?). A local algorithm could be "choose neighbor with highest potential/resistance among self and neighbors, but with random exploration." Hmm.

Maybe there is known concept: "cellular graph" with "potential and resistance" might refer to "current flow" in "graph-based scheduling"? The rule might be: cell i computes its "pressure" V_i = potential_i / resistance_i. The next budget goes to the cell with maximum local pressure in its neighborhood? But that would require global max? Actually if each cell compares local, no global winner. Could use "if my potential is greater than all neighbors, I take budget" but multiple local maxima. Need global.

Maybe "local algorithm decides which cell receives next unit" could be distributed: each cell checks if it is the "best" among itself and neighbors? But if multiple local maxima, no unique. Need tie-break. Maybe token-based.

Let's think of "smallest mechanism that could work" in context of "cellular graph" and "potential and resistance values" maybe from a paper about "self-organizing computation budget allocation" where cells have potential and resistance, and algorithm should be local and fair. They ask from "Lens: you are an engineer who wants smallest mechanism that could work." Might be from "AI alignment? agent engine?" They want design a minimal local algorithm for "attention allocation" in "cellular automaton"? Hmm.

Could answer: Use a single token and local random walk. It is the smallest because only one bit of global state (token location) and each cell needs only neighbor values. It can be implemented without global coordination. Fairness via positive probability to every neighbor and self. No starvation because finite connected graph and irreducible Markov chain.

Need maybe include "if deterministic fairness required, add a last-served timestamp/age." But the prompt says given per-cell potential and resistance. If potential/resistance can be arbitrary, maybe fairness means "potential" maybe priority? "cannot starve a cell forever" maybe need guarantee. A purely greedy local rule can starve. To guarantee no starvation, must include randomization or aging. The "smallest" might be "randomized local election" because randomness provides fair exploration without global memory. But if potential/resistance values are static and can make a cell very low, random with positive floor ensures no starvation. If no randomness, need extra state (age) per cell. But prompt asks given potential and resistance, no mention randomness allowed. We can use resistance as "if a cell hasn't received for long, potential increases"? Hmm.

Let's propose algorithm with local aging to be deterministic fair? Let's explore.

We need decide which cell receives next unit. Only local view. If all cells know their own potential and resistance, and neighbors' values. Could implement token passing where token holder chooses neighbor/self. To avoid starvation, we can use "deficit round robin" locally? But without global queue, how to ensure every cell eventually? A token can move along a spanning tree? But finding spanning tree requires global? Could do random walk.

If deterministic token passing with local rule based solely on potential/resistance, can it starve? Suppose token at high potential cell, it always stays (if own potential/resistance best), then low cells never served. To prevent, need rule that sometimes moves away. Without randomness, need memory/age. But memory per cell (last served) may be local? The token holder can compare neighbors' "time since last service" if neighbors store it. Since token holder only sees direct neighbors, it can choose neighbor with oldest last service? This is like local round-robin on graph. Does it guarantee no starvation? Let's analyze.

Algorithm: Each cell has a counter/age since last service. Token holder i inspects itself and neighbors, chooses the one with largest age (or weighted by potential/resistance) and sends token there; the chosen cell resets age. Only local info (neighbors' ages). Does this guarantee no starvation on connected graph? Not necessarily? Let's test. Token holder chooses max age among closed neighborhood. It could get trapped in local region ignoring far cells if ages of far cells not visible. Example path 1-2-3-4. Suppose token at 2, neighbors 1 and 3. If 1 has age 100, 3 age 0, 2 age 0, chooses 1. At 1, neighbors 2 age 0, self age 0 (reset? actually 1 just served resets to 0). Then at 1, sees 2 age 0, self 0, chooses maybe 2. At 2, sees 1 age 0, 3 age 1 maybe, chooses 3. So can propagate. But could starve if high potential/resistance biases. If pure age max, it's like token moves to oldest in neighborhood. Does every node get served infinitely often? Consider path with token at middle. It will move to older side. But far nodes ages increase; eventually their age may exceed local? Actually far node 4 not neighbor of 2 until token moves to 3. At 3, sees 4 age increasing, so may choose 4. Seems maybe yes? But not guaranteed on general graph? Let's explore.

If token at i and chooses max age among closed neighborhood, the selected node's age is at least i's age? Wait i's age reset at last service. If i just served, age 0. Its neighbors not served since maybe have positive ages. It picks max neighbor. Then at neighbor, its age reset to 0, and i age becomes 1. Then it sees i age 1 and its other neighbors. It might bounce between i and neighbor if i's age grows? Example edge 1-2. Token at 1, ages: 1=0,2=0. Tie pick 2. At 2, ages:2=0,1=1. Pick 1. At 1, ages:1=0,2=1. Pick 2. So alternates. On path, it can move.

But consider star graph: center 0 connected to leaves. Token at center. Ages all 0. Tie pick a leaf. At leaf, self 0, center age 1. Center > leaf, so pick center. At center, self 0, all leaves ages: chosen leaf 1, others 0. Pick chosen leaf again (age 1). So center and one leaf alternate forever, other leaves starve. Ah! Because center only sees direct neighbors; unchosen leaves age increases but not visible from center while token at leaf? Wait at leaf, it sees center only, not other leaves. Token at leaf chooses center. At center, it sees all leaves. The previously chosen leaf has age 1, other leaves have age? They haven't been served, their ages also increase. Let's track with global time. At time 0 all age 0. Token center. Tie pick leaf A. A served at t=1, age A=0. At t=2 token center? Let's simulate properly with ages increment each time step? Need define age: time since last service. If each step one cell served, before service ages increase by 1 for all not served? Let's use counters since last service. At t=0 all 0. Step1 center? Token at center, choose max age among center and leaves. All 0, tie center maybe. If center served, center age=0, leaves age increase to1. Token stays center. Next step, max age among center (0) and leaves (1) -> pick a leaf. Step2 leaf A served, A=0. Others leaves B,C age become2? Center age becomes1. Token at A. Step3 A sees self 0, center 1 -> pick center. Center served, center=0. Leaves B,C age become3, A becomes1. Token at center. Step4 center sees leaves: A=1, B=3, C=3. It picks B or C. So other leaves not starve. Ah because their ages are visible from center and have grown. In my earlier I forgot ages increment. So max-age local may not starve. But is it guaranteed? Need analyze.

Algorithm: Token at current cell i. At each round, all cells' age increments; then i chooses j ∈ {i}∪N(i) with maximum age (tie-break). j gets service, age_j=0, token moves to j. Does every cell get served infinitely often in connected graph? This is like "local oldest in neighborhood" token. Is it fair? Let's test star with many leaves. It will rotate through leaves because at center, unchosen leaves have higher ages than chosen leaf. So yes.

But consider path 1-2-3-4. Token at 2. Ages: 1=100, 2=0,3=0,4=100. At 2, sees 1 and3, picks 1. Then token at 1, sees 2 age? 2 just not served? After step, 2 age becomes1, 1=0. At 1, max self0 vs 2=1 -> picks 2. Then at 2, ages: 1=1,2=0,3=1? (3 not served and age increment each step), 4=102. Sees 1 and3, picks 3 (tie maybe). Token at 3, sees 2=1,4=102, picks 4. So propagates. It seems local oldest can propagate to far cells? But can it get stuck bouncing between two nodes while far nodes age, but not visible? Suppose path 1-2-3-4-5. Token at 2, far 5 age huge. At 2 sees 1 and3. If 3 age less than 1, picks 1. At 1, sees 2, picks 2. At 2, 1 age low, 3 age maybe increases. Eventually 3 age exceeds 1, so moves to 3. Then from 3 can move to 4 if 4 age high. So yes.

But is there a counterexample where a node never gets token because its neighbor always has higher age from recently served? Let's formalize. In a connected graph, for any node v not served, its age increases monotonically. If token never reaches v, then along a path from token region to v, there is a boundary edge (a,b) where a is in served set S, b outside. At a, when token is at a, b's age is increasing and eventually exceeds all nodes in S? But a may not be current when b age high. However token visits a infinitely often? If S finite and token stays in S, some nodes in S served infinitely often. For boundary a in S, b age grows. When token at a, it compares b with neighbors in S. If b age > all, it would move to b. But maybe token at a only at times before b age becomes high? Since S served infinitely often, a may be served infinitely often? Not necessarily; S could have a subset. But if S is closed under local oldest rule, for token to never leave S, every boundary node a in S must never be current when outside neighbor age exceeds current max. But outside ages grow unbounded. If a is visited infinitely often, eventually it will leave. If a not visited, then S's token is in smaller subset. Eventually boundary of that subset. By finite induction, must leave. Thus no starvation? This is plausible.

But the prompt specifically mentions "potential and resistance values". A local oldest-age with weights potential/resistance could combine. Minimal? Need maybe use potential/resistance to decide max priority = age * potential / resistance? But if weights can be zero, starvation? We can floor.

The question: "Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

Maybe they expect "local greedy with aging" because fairness and no starvation are key. They mention potential and resistance values, not random. A local algorithm can use "potential" and "resistance" to compute priority. To avoid starvation, include "age" or "deficit" as potential? But the given per-cell potential maybe already incorporates need? Hmm.

Let's parse "potential and resistance values" perhaps analogous to "voltage and resistance" in electrical circuits. If cells have potential and resistance, current flows from high potential to low through resistance. The next computation budget might go to cell with highest "potential difference" divided by resistance? Local rule: each cell asks neighbors; if its potential is higher than all neighbors, it draws current? But that's local maxima. Fairness? Not guaranteed.

Maybe they want "minimal local algorithm" like "random walk where transition probability is proportional to potential/resistance". This is simple and directly uses both values. Fairness/no starvation via irreducible Markov chain. This is likely answer.

Need decide final answer. Could present one algorithm and mention variants. Since user asks "Design a minimal local algorithm..." We can propose randomized token. It is minimal. Need explain fairness/no starvation. Maybe include deterministic aging as optional if randomness not allowed. But final should be crisp.

Maybe we can combine: Use a single token; at each step, holder chooses among itself and direct neighbors with probability proportional to w = potential/(resistance+ε). This uses only local info. Fairness: positive probability for every closed-neighborhood move; connected graph -> irreducible Markov chain; each state recurrent; no starvation. It also respects potential/resistance by biasing service. If you need exact proportionality, use Metropolis-Hastings acceptance, but not necessary. We can mention if you want deterministic, add an aging counter as tie-breaker; but the minimal stochastic rule already guarantees no starvation. However, if potential/resistance can be zero, add ε floor. If graph disconnected, run one token per component or no algorithm can cross components locally.

Need be careful: "fair" might mean equal treatment? Our algorithm biases by potential/resistance, so not equal. But fairness can mean "no cell starves" and "long-run service proportional to desirability". If they demand equal fairness, set w=1 (pure random walk) but then ignores potential/resistance. To include values, fairness means each cell has nonzero chance, high potential/low resistance gets more service. We can say "If by fair you mean equal, use w=1; if fair means no starvation and weighted by need, use w."

Need maybe prove no starvation more rigorously. Let's formulate:

Let G=(V,E) be finite connected. Token state X_t ∈ V. At each step, from i choose j ∈ C(i) = {i}∪N(i) with probability
p_{ij} = w_j / Σ_{k∈C(i)} w_k, where w_j = max(ε, p_j/(r_j+ε)).
Because ε>0, p_{ij}>0 for every j∈C(i). Since G connected and self-loop at i is allowed, the Markov chain is irreducible: from any i to any j there is a path, and each edge along path has positive probability. The state space is finite, so the chain is positive recurrent. Therefore every state j is visited infinitely often almost surely. Thus no cell is starved forever. Long-run frequency is the stationary distribution π of P; it is nonzero for every cell. Potential/resistance values bias π. We can mention if want exact desired weights, use Metropolis-Hastings:
- current i, pick candidate j uniformly from closed neighborhood.
- accept j with probability min(1, w_j/w_i); else stay.
Then stationary π_j ∝ w_j, using only i and j. But this is slightly more complex. The minimal is direct weighted choice.

Need answer "smallest mechanism that could work" maybe mention resources: one token (one node ID), each cell stores its p,r and can read neighbors. No global queues, no global max, no spanning tree. The algorithm is O(deg(i)) per decision.

Need include pseudocode:

```
At token holder i:
  C = {i} ∪ neighbors(i)
  for j in C:
      w[j] = max(ε, potential[j] / (resistance[j] + ε))
  W = sum(w[j])
  r = random(0,1)
  cumulative = 0
  for j in C:
      cumulative += w[j]/W
      if r < cumulative: send token to j; service j; break
```

If deterministic random? Need note "random source can be local; no global view."

Could also say "If no randomness is allowed, add an age counter a_j (time since last service). When at i, choose j in C maximizing a_j * w_j (or a_j if you want equal fairness). Reset a_j=0 and increment others. This also uses only local info and prevents starvation, but requires per-cell memory and is not as minimal as the stochastic token." But do we need? The prompt says "smallest mechanism" maybe stochastic is smaller. But "cannot starve forever" with probability 1, not deterministic. If they require deterministic guarantee, maybe aging. The phrase "cannot starve a cell forever" might imply absolute guarantee. A randomized algorithm can theoretically starve a cell forever? In an infinite sequence, probability zero. But "cannot" could be probabilistic. To be safe, mention both: minimal stochastic has almost-sure no starvation; if you need deterministic, add a local age tie-breaker. But the question asks "Explain why... cannot starve a cell forever." Probabilistic "with probability 1" might be acceptable.

Let's examine if a direct weighted random walk with positive probabilities can have a state with zero stationary distribution? No, irreducible finite chain -> all stationary positive. So no.

Need maybe address "resistance" sign. If resistance is cost, use w = potential / resistance. If resistance is conductance (1/resistance), then w = potential * resistance. We can define clearly: "assuming higher potential means more deserving and higher resistance means less deserving." If opposite, invert.

Potential issue: The algorithm decides "which cell receives next unit" but if token moves, the cell that receives is the destination. The current cell may also receive if self-loop. That's fine.

Need maybe mention "only a cell and its direct neighbors" satisfied: at current token holder i, it reads p_j,r_j for j∈N(i) and itself. It doesn't need to know other cells. The random draw can be done at i; neighbor doesn't need global.

What about "cellular graph" maybe cells are synchronous? If no token, how does a cell know it's current? The token is the only extra state. That's minimal. The rule uses local neighborhood.

Need maybe include "graph connected" assumption. If graph not connected, no local rule can transfer budget between components; fairness per component. The question says cellular graph maybe connected. We can state "Assuming connected; otherwise apply per component."

Need maybe include "fairness" definition. We can say "Fairness here means no permanent starvation; not equal allocation. The weighted random walk allocates service in long-run proportion to a stationary distribution that is positive on all cells. If you want equal long-run service, set all weights equal; if you want proportional to p/r, use Metropolis-Hastings."

Need maybe discuss exact stationary for direct weighted choice? Not necessary. But if we claim "long-run service proportional to p/r", that's false for simple weighted choice. We should avoid false claim. We can say "biased by p/r; if you require exact proportionality, use MH." Let's decide whether to include MH. The prompt asks "given per-cell potential and resistance values" maybe they expect rule uses them. Simple weighted choice uses them and biases. Fairness no starvation. That's enough. But if I say "fair" maybe they might expect "more potential/less resistance gets proportionally more". Hmm.

Let's derive exact stationary for simple weighted choice? Could maybe be proportional to w_i * ? Let's find formula. P_{ij}=w_j/W_i for j∈C(i). This is a random walk on graph with transition rates? It's the "random walk with non-symmetric weights" where from i to j probability proportional to w_j. Stationary distribution π satisfies π_j = w_j Σ_{i∈C(j)} π_i/W_i. This is not simply w_j. But it is positive. If we want exact desired stationary π_j ∝ w_j, we can use Metropolis-Hastings. Let's consider if MH is minimal enough. It requires current i and candidate j. The proposal can be uniform among self and neighbors. Acceptance min(1, w_j/w_i). This uses local info. It gives stationary π_j ∝ w_j. Fairness: if w_j>0 for all, irreducible. No starvation. This might better fit "given potential/resistance": service frequency proportional to potential/resistance. But "smallest mechanism" maybe direct weighted choice is simpler. MH adds accept/reject but ensures correct weights. Which one is "minimal"? The direct weighted choice is smaller. The prompt doesn't specify exact proportion, just "given values" and "fair". So direct weighted is fine.

Could also use weighted choice with self-loop and positive floor. It's minimal.

Need maybe mention "if resistance can be zero, potential zero, use ε to keep positive." If w_j=0, transition probability zero to that cell; if graph still connected through other nodes? If a cell has w=0, it can never be chosen as destination, so starves. Thus floor w_j≥ε. If potential zero means no need, but fairness says cannot starve, so give minimum service. If resistance infinite, floor.

Need maybe mention "if potential/resistance change, recompute at each step; local values only."

Let's craft final answer with sections:

1. Assumptions: finite connected cellular graph, one token, p_i≥0, r_i>0, ε>0.
2. Algorithm:
   - Token at i.
   - Let C(i)={i}∪N(i).
   - For each j∈C(i), w_j = max(ε, p_j/(r_j+ε)).
   - Choose j with probability w_j / Σ_{k∈C(i)} w_k.
   - Move token to j; j gets budget.
3. Why local/minimal: only token holder computes, O(deg), reads self/neighbors. No global coordinator.
4. Fairness/no starvation proof:
   - Transition probabilities positive for all j in C(i).
   - Since graph connected, from any cell to any other there's positive probability path (including self loops allowed).
   - Thus Markov chain irreducible on finite V. Irreducible finite Markov chain is positive recurrent; every state visited infinitely often with probability 1.
   - So no cell can be starved forever. Long-run frequency is stationary π>0; weights bias it toward high p/low r. If exact proportionality desired, use MH accept min(1,w_j/w_i) (optional note).
5. If deterministic requirement: add age counter and choose max age*weight; reset chosen age. But not necessary.

Need maybe answer "fair" explicitly: "Fair = every cell has nonzero chance and positive stationary probability; high potential/low resistance gets more budget in expectation, but low cells still get minimum ε." If "fair" means equal, set w=1.

Let's consider if there is any subtle issue: The algorithm uses only current cell and direct neighbors. But to compute w_j for neighbor j, current cell needs neighbor's potential and resistance. The rule says "use only a cell and its direct neighbors"—yes, current cell can read direct neighbors' values. It doesn't need values of neighbors' neighbors. The random choice uses sum over C(i), which is local. Good.

Could a cell be starved forever in a random process? The event that it never appears after some time has probability zero in an irreducible finite Markov chain. But there are infinite sequences where it doesn't, probability zero. In engineering, "cannot starve" often means almost surely. We can phrase "with probability 1" and "in any finite interval there is a positive probability; over infinite time the probability of never visiting is zero." If they need deterministic, add age.

Need maybe mention "if graph disconnected, no local rule can move token between components; run one token per component." The prompt says cellular graph, likely connected.

Need maybe include pseudocode in final. Desired oververbosity 5, so moderate detail. We can include equations.

Let's think if there is another interpretation: "potential and resistance values" might be used to compute "effective conductance" and choose cell with highest "current" from neighbors? Maybe algorithm: Each cell computes a score S_i = potential_i / resistance_i. If S_i > all neighbors' S_j, then it claims next budget. But multiple local maxima. To ensure fairness, use random backoff? Hmm.

Maybe there is a known "local algorithm" called "biased random walk on graph" for fair scheduling. The phrase "cellular graph" and "potential/resistance" might be from "cell potential and resistance" in "Cellular Automata for load balancing"? Could be "minimal local algorithm" like "each cell with highest potential/resistance among neighborhood takes budget, then sets potential to zero; resistance increases; eventually others get it." But no global view.

Let's search memory: There is a concept in "graph cellular automata" for "self-organizing criticality"? Potential and resistance values? Maybe from "Nephew's question"? The user asks in an abstract way. They want a design. We can answer generally.

Maybe they want "use a token ring around cells; at each step, the token moves to neighbor with highest potential/resistance product, but if no cell, ..." Hmm.

Let's consider deterministic local algorithm to guarantee no starvation without randomness. The "smallest mechanism" could be "token + local age priorities." It uses potential and resistance to compute priority. Does it require only direct neighbors? Yes. Let's analyze if it actually guarantees no starvation. If yes, we can present that as a deterministic alternative. It might be more robust to "cannot starve forever" (deterministic). The prompt says "given per-cell potential and resistance values" not "random." Maybe they want a deterministic rule. Let's explore deterministic local oldest algorithm more thoroughly and see if it can guarantee no starvation for any connected graph and weights. It might be a nice answer.

Algorithm D:
- One token. Each cell j maintains an age a_j (number of rounds since last served).
- At each round, token at i. All cells' ages increment (or ages since last service).
- Compute priority q_j = a_j * w_j for j ∈ {i}∪N(i), where w_j = potential_j / resistance_j (or max ε).
- Token moves to j maximizing q_j. If tie, use fixed local tie-break (e.g., smallest ID).
- j receives budget; set a_j = 0; token at j.
Does this guarantee no starvation? Need prove or find counterexample. We need be careful. With weights, a low-weight cell might have age grow but priority may still be lower than high-weight neighbor. If weights fixed and low cell has w=0.1, high neighbor w=10. The high neighbor might be served frequently, resetting age; low cell age grows. Eventually a_low * 0.1 > a_high * 10? But if high is served often, its age may be small. Low age grows unbounded if starved. So eventually low priority exceeds high if low not served. Thus weight doesn't prevent eventual service. But consider token only compares direct neighbors, not all cells. The boundary argument still works: if a cell v never served, its age grows. Along path from token region S to v, there is boundary a in S with neighbor b outside. When token at a, b's priority grows unbounded. Other nodes in C(a) have bounded ages? Actually if they are served infinitely often, their age resets, so age is bounded? In a finite recurrent subset, ages of served nodes are bounded by maximum time between services, which could be unbounded if service intervals grow, but if they are served infinitely often, age resets infinitely often; maximum age between resets could grow? It could be unbounded if intervals grow. But b's age grows monotonically. However other nodes in C(a) may also have growing ages if not served for long. If token never leaves S, all nodes in S that are not served have growing ages too. But eventually one boundary node's outside neighbor priority may be highest? Need prove.

Consider a star graph with center high weight, leaves low. Token at center. It chooses max a_j*w_j. If center has high weight, it may serve center often. Leaves age grow. Eventually a_leaf*low > a_center*high? But center age resets when served. If center not served, its age grows too. The rule will alternate based on ages. It should eventually serve leaves because their ages grow. But could one leaf starve while another leaf served? At center, all leaves visible; the one with highest priority gets served. If one leaf is never served, its age grows, so eventually it will have highest priority among leaves. Thus no leaf starves. In general, when token at a node, it can see all its neighbors. If a neighbor is starved, its age grows, so eventually it will win when token visits that node. But token might not visit the node adjacent to starved cell? If the starved cell's neighbor is visited infinitely often, then yes. If not, move boundary. Finite graph -> eventually.

What if a node has w=0? Then priority always 0, never served. So need floor ε>0.

What if graph has multiple local maxima? Token moves to max priority. It may bounce. But ages ensure propagation. I think deterministic aging local algorithm guarantees no starvation if graph connected and w_j>0. This might be a stronger answer. But the prompt says "minimal local algorithm" maybe adding age counters is not minimal. However it only uses direct neighbors and no global view. It uses per-cell potential/resistance plus age. But the question didn't mention age as given. It says "given per-cell potential and resistance values." It asks design algorithm. We can introduce age as part of algorithm. The algorithm's rule uses only cell and direct neighbors (including their age). That's allowed? "must use only a cell and its direct neighbors" means can use values at those cells. It doesn't say no extra state. But "smallest mechanism" maybe wants minimal extra state. A single token plus age counters is more than token alone. But deterministic guarantee.

Which is more appropriate? Let's read: "Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

They mention "per-cell potential and resistance values" as inputs. If we introduce age, we are using additional state. But fairness/no starvation often requires either randomness or aging. They might expect "use potential/resistance to compute priority; if a cell hasn't been served, its potential increases (or resistance decreases), so eventually it wins." But they said given potential and resistance, maybe these already encode need. Hmm.

Maybe "potential" is like "desire/need" and "resistance" is like "threshold". A cell with low potential and high resistance might starve. To prevent starvation, we can increase potential over time (leaky bucket) or decrease resistance. That's local. The algorithm: each cell has a "deficit" counter; potential accumulates when not served. Then local token chooses among neighbors the cell with highest potential/resistance. This is like aging. Fair.

Let's consider if the prompt is from an interview or puzzle. They ask "Lens: you are an engineer who wants the smallest mechanism that could work." That suggests they want a simple mechanism, maybe "random walk" because it's the smallest. The phrase "Lens" maybe from a framework for problem solving. They want "minimal local algorithm." The smallest mechanism that could work for fair budget allocation is a random walk token. It uses only local info. It cannot starve due to probability. That is elegant.

Need decide final. We can include both: "The minimal stochastic mechanism is..." and "If you require deterministic, the same idea with an age counter..." This covers bases. The final answer can be moderate length. The user asked "Design a minimal local algorithm..." So I can present the stochastic one as main, and mention deterministic variant in a note. That should satisfy.

Need maybe ensure "fair" and "cannot starve" explanation for stochastic. Also mention if potential/resistance can make probabilities zero, floor. Good.

Let's craft final answer:

```
Assume finite connected graph G=(V,E). Keep one token; its location is the only global state. At token holder i:
  C(i) = {i} ∪ N(i)
  w_j = max(ε, potential_j / (resistance_j + ε))
  choose j in C(i) with probability w_j / Σ_{k∈C(i)} w_k
  send token to j; j receives budget.
```

Why local: i only needs p_i,r_i and p_j,r_j for j∈N(i). No global max.

Fairness/no starvation:
- Since ε>0, every allowed transition i→j has positive probability.
- G connected => from any i to any j there is a path of positive-probability moves; including self. Markov chain irreducible.
- Finite irreducible chain is positive recurrent; every state is visited infinitely often with probability 1. Thus no cell is starved forever.
- Long-run share is stationary π>0; high potential/low resistance increases weight, so allocation is biased toward them, but low cells keep a positive minimum. If exact proportionality to w is desired, use MH acceptance min(1,w_j/w_i).

If deterministic:
```
Each cell keeps age a_j. Token at i chooses j in C(i) maximizing a_j w_j; reset a_j=0; increment others.
```
Since a starved cell's age grows without bound, it eventually beats any bounded/reset neighbor; finite connected graph -> no permanent starvation. But this is not as minimal as token random walk.

Need maybe avoid saying "any bounded/reset neighbor" if weights positive. If weights positive and ages grow, yes.

Let's maybe not overcomplicate with deterministic variant unless as a final note. The desired oververbosity 5. We can include note at end.

Need ensure "fair" not misconstrued. I can say "Fair in the starvation-free sense. If fairness means equal long-run service, set w_j=1; then the walk is uniform random and every cell appears equally in the limit." Actually uniform random walk on regular graph gives equal. On irregular graph, simple random walk stationary ∝ degree. If choose self-loop and neighbors uniformly, stationary not equal. To get equal, use MH with w=1 and uniform proposal? With w=1, MH always accepts, proposal uniform over closed neighborhood, stationary not equal on irregular. To get equal, need design target uniform. But not needed. We can say "Fair = no starvation; if you want equal shares, use an age counter/round-robin." Hmm.

Maybe phrase: "It is fair in the weak sense that every cell gets positive probability and positive stationary mass. The weights make it not equal; that is intentional because potential/resistance express priority." Good.

Let's consider if the algorithm "decides which cell receives next unit" but the current cell could be chosen multiple times. If potential high, yes.

Potential issue: The rule uses neighbor's potential/resistance. But if graph is large, a cell cannot read all neighbors? It can read direct neighbors. Fine.

Could there be a problem with "resistance" if it's per-edge, not per-cell? The prompt says per-cell potential and resistance. We assume per-cell. If resistance is edge, adjust weight for edge j: w_j = potential_j / resistance(i,j). But same idea. We can mention "if resistance is edge resistance, use potential_j/(resistance_{i,j}+ε)." Maybe not necessary.

Let's maybe include a short proof of irreducibility: For any i,j, since G connected, there is path i=v0,v1,...,vk=j. At each step vt→v_{t+1} is either self or neighbor, so probability positive. Product >0. Thus P^k_{ij}>0. Finite state -> irreducible. By Markov chain theorem, all states recurrent. Therefore no starvation.

Need maybe mention "almost surely" because random. "Cannot starve forever" = probability 0 of never visiting.

Let's write final in a structured way.

Potential final:

```
Use a single circulating token.

Algorithm (token at i):
  C = {i} ∪ {v : v adjacent to i}
  For each v∈C:
      w_v = max(ε, potential_v / (resistance_v + ε))
  Choose v∈C with probability w_v / Σ_{u∈C} w_u.
  Move token to v; v gets the next budget.
```

Then explanations.

If deterministic note:
```
If randomness is forbidden, add an age counter a_v. At i, choose v∈C maximizing a_v w_v. Reset a_v=0 for chosen, increment others. A starved cell’s a_v grows, so eventually its priority exceeds any neighbor that is being reset; the same boundary argument on a finite connected graph prevents a closed subset from trapping the token forever.
```
This is a nice addition.

Need ensure final answer doesn't confuse with two algorithms. The user asked design one. I can present main algorithm and then "If you need deterministic..." as optional. That's okay.

Let's also mention "minimal" in that it needs only one token and local randomness. No global view, no global max, no spanning tree.

Let's produce final. 

## answer

Use the smallest thing that can carry global allocation without global knowledge: **one circulating token**. The cell holding the token is the only global state; every decision is made locally by that cell.

Assume the cellular graph is connected. If it is disconnected, run one token per component.

## Algorithm

When the token is at cell \(i\):

1. Look only at \(i\) and its direct neighbors:
   \[
   C(i)=\{i\}\cup N(i).
   \]
2. Define a local desirability weight for each \(j\in C(i)\):
   \[
   w_j=\max\left(\varepsilon,\frac{\text{potential}_j}{\text{resistance}_j+\varepsilon}\right),
   \]
   where \(\varepsilon>0\) is a tiny floor so no cell ever has zero probability.
3. Choose \(j\in C(i)\) with probability
   \[
   \Pr(j)=\frac{w_j}{\sum_{k\in C(i)} w_k}.
   \]
4. Send the token to \(j\). Cell \(j\) receives the next unit of computation budget.

This uses only the current cell and its direct neighbors. It needs no global maximum, no global queue, and no central coordinator.

## Why it is fair

The rule gives every cell in the closed neighborhood a positive probability of being chosen. A cell with higher potential or lower resistance gets chosen more often, so the allocation is biased toward cells that “want” or “deserve” budget more. But no cell is ever given zero probability.

If you want strict proportional-to-weight fairness, use a Metropolis–Hastings acceptance step instead:
- propose a neighbor/self uniformly,
- accept a move to \(j\) with probability \(\min(1,w_j/w_i)\),
- otherwise stay.

That also uses only local information and has stationary distribution proportional to \(w_j\).

## Why it cannot starve a cell forever

Because \(\varepsilon>0\), every allowed move from \(i\) to any \(j\in\{i\}\cup N(i)\) has positive probability.

Since the graph is connected, from any cell you can reach any other cell by a finite path of positive-probability moves. Therefore the token’s location is an **irreducible Markov chain** on a finite state space.

For a finite irreducible Markov chain:
- every state is visited infinitely often with probability 1,
- every state has positive stationary probability.

So no cell can be permanently skipped. It may receive less budget if its potential is low or resistance is high, but it will receive budget infinitely often.

If randomness is forbidden, add one local age counter per cell. At the token holder, choose the neighbor/self maximizing \(\text{age}\cdot w\). Reset the chosen cell’s age to zero and increment the others. A starved cell’s age grows without bound, so eventually it wins locally; on a finite connected graph, the token cannot remain trapped forever in a proper subregion. But the randomized token rule is the smaller mechanism.
