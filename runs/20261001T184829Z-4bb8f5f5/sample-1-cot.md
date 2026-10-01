# sample 1 — lens: an engineer who wants the smallest mechanism that could work

## seed_requested
{"seed": 9199, "bits16": "0010001111101111", "source": "mothquantum/coin-toss-v1:1shot", "entropy_bits_true": 16, "job_ids": ["3847f1cd-4864-47eb-b712-b2cbebc3fb14", "006cf199-ae96-413f-8c33-227bb5519674", "e1b7b57b-4dfa-4692-9a54-757bf3694768", "6885857f-3680-4262-b1fe-554633364243", "1a9bbfec-2cb1-496d-89a9-c1753cae72f9", "14b08edb-5582-4450-87a8-d3a214d76035", "6181ac57-1947-476c-a6e9-58dcc5c83e99", "8dcacbdd-7792-4e10-95dd-bcf11e8f6a7b", "89481d5f-0726-432f-9987-008aebfdf5f1", "8886baae-e2e7-48f2-9d21-47efa8d4ac41", "c1737612-2e58-4fb2-aceb-4ddefa59403b", "6b16fc15-f587-4bdf-85eb-5a50753dd51e", "66ba2823-adc2-4f91-a38b-fabcaa70a163", "b3b3e8f8-5ce4-4e5d-acd4-3b632d3f58ba", "1b4342f2-781c-4e89-873c-043faab302de", "d5cc533a-175a-4f5a-a1fd-75efac74631d"]}

## chain-of-thought

We need answer. Need reason. User asks: "Lens: you are an engineer who wants the smallest mechanism that could work.

Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

We need craft answer. Need infer context? Cellular graph, per-cell potential and resistance, decide which cell receives next unit computation budget. Local algorithm using cell and direct neighbors. Need fairness and no starvation. Likely wants scheduler / arbitration / token? Need design minimal local rule. We need think.

We have graph cells, each has potential and resistance. Need decide which cell gets next unit. Only local info. This sounds like "cellular automaton" / "self-organizing" resource allocation? Potential maybe priority, resistance maybe threshold. Need choose cell. Minimal local algorithm maybe "each cell compares its potential to neighbors' potential, adjusted by resistance; if it has maximum local value, it takes token; if tied, use random/ID/round-robin". But no global view, cannot guarantee global max? Need fairness and starvation. If rule is local and asynchronous, can guarantee no starvation? Need carefully define.

Maybe problem is from "budget allocation in cellular graph" akin "Glauber dynamics" or "maximal independent set"? "Resistance" maybe edge resistance? Per-cell potential and resistance values. Need decide which cell receives next unit. Only cell and direct neighbors. Need minimal local algorithm.

Potential and resistance values: Maybe each cell has potential (desire for budget) and resistance (cost/difficulty to compute). Need fair scheduling among competing cells. Local rule could be: a cell can claim budget only if its "net potential" (potential - resistance) is greater than all neighbors' net potentials. If so, it gets budget. But if multiple local maxima? They are not adjacent, so all can? But only one unit next. Need global unique. Maybe use token passing: one "budget token" moves around graph. At each step, the cell holding token chooses among itself and neighbors the one with highest score, adjusted by resistance and anti-starvation counter. Token moves there; that cell gets budget. This uses only local neighborhood because token holder knows its neighbors. This is minimal and ensures no starvation if choose based on age/counter/round-robin. But "decides which cell receives next unit" could be from a controller? The rule must use only a cell and direct neighbors (no global view). We can define token holder performs local election. But then only token holder uses neighbors; other cells don't. Is that allowed? "uses only a cell and its direct neighbors" yes.

Need design minimal local algorithm. Could be: Each cell maintains a counter `age` or `last_served`. When a cell receives budget, it sets its own `age=0`, increments neighbors' ages? Wait direct neighbors only. Then next choice: cell with token checks neighbors; picks max score = potential - resistance + fairness bonus (age). The token holder can decide among itself and neighbors. This uses local adjacency. Fairness: older cells get increasing bonus, eventually outrank any fixed neighbor; since graph finite and path? But if token only moves to adjacent, can it reach all cells? If graph connected. Need no starvation. If graph not connected, only component of token reachable. Assume connected. Need ensure fairness: A cell not served for long has age increase (or debt). When token reaches its neighborhood, its high age ensures it gets selected over any neighbor that was served more recently. But what if token never reaches its neighborhood? Token moves step by step. If rule at each step chooses max score among current and neighbors, can token get stuck in a local region and never reach far cell? The age bonus can pull it out? Need analyze.

Potential and resistance values are per-cell. Score = potential - resistance + age_bonus. If an old cell is not adjacent to token, token must traverse path. The old cell's bonus doesn't affect intermediate decisions until token gets near. Could token keep cycling locally and never reach the old cell? Suppose local cycle with high scores. If all cells in component eventually age? Wait only cells served reset; unserved age increases. For any unserved cell, its age grows unbounded. But token decisions are local. To reach that cell, token must pass through neighbors. The immediate neighbor of unserved cell also has age maybe? If it hasn't been served either, its age grows. If it has been served, it may have lower age. But the unserved cell's high age only considered when token is at that cell or its neighbor. The neighbor, if being selected repeatedly? Let's model.

Token at current cell. It selects max among current and neighbors based on score. If an unserved cell U is adjacent to some V. If token ever at V or U, U's age bonus will be huge, so it will select U if U is neighbor of V (or itself if at U). Thus token reaches U once it reaches V. But could token never reach V? V might be far. We need prove token will eventually visit all cells. If token moves to neighbor with max score. There may be local maxima trap: token moves among a set S where each node's best neighbor is inside S, and boundary nodes not chosen because their scores (potential-resistance + age) are lower than internal nodes. But ages of nodes in S reset when served; boundary nodes not served age grows. Eventually boundary nodes' age bonuses become huge, so when token is at a node adjacent to boundary, it will choose boundary. But if boundary is not adjacent to any node in S? S is a set of visited/recurrent nodes. Its boundary are nodes adjacent to S. Since token moves within S, at some step it is at a node with neighbor outside S. That outside neighbor has age growing if not served; if it has been served before, it may reset but over time? Need consider if outside nodes are also served occasionally? If token never leaves S, outside never served, so age grows unbounded. Thus eventually boundary outside's score exceeds any inside node, so token leaves. If outside was served, then token had left. Therefore token eventually expands? This suggests no starvation if connected and age bonus unbounded and score includes unbounded fairness term for all unserved nodes.

But if potential/resistance are unbounded? Per-cell values fixed finite. Age bonus unbounded, so dominates eventually. But need handle if multiple cells with same age? Tie-break deterministic with IDs/round-robin. Fairness: each cell eventually served infinitely often? If token moves and ages reset on service. Could a cell be served then immediately not served for long while token in other region. But eventually its age grows and attracts token.

However, local rule using only direct neighbors and token: The token holder can compare its own score and neighbors' scores. It moves to selected cell. The selected cell receives budget. This is minimal. But is there a need to increment ages for all cells? Each cell can increment its own age each time step locally (or when not selected). Since each cell knows if it got budget? It can maintain local age counter; if not receives, increments. But if cells don't know global time? They can increment on each local clock tick? The token moves every step. Only token holder knows token. All cells can update age? In distributed algorithm, each cell can increment its age every round if not served. But if no global rounds, maybe when token visits? Hmm.

Alternative local rule without token: Each cell can compare its "score" to neighbors; if it is local maximum, it sends request? But only one gets budget. Need resolve conflicts. Token is simplest.

The question: "Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

Maybe they expect a local rule like: "Cell i can consume budget iff its potential > sum of neighbors' resistances" or "iff its potential/resistance ratio is greater than all neighbors" and then randomized for ties. But fairness? If rule always picks highest potential/resistance, low potential cells starve. To avoid starvation, need age or credit. The prompt mentions "per-cell potential and resistance values." Maybe resistance is used as threshold for neighbors. Could be from "cellular graph" where cells have potential and resistance; computation budget flows? Need decide which cell receives next unit. Maybe they want "local algorithm" similar to "gradient" or "maximal independent set" where each cell has potential and resistance. Potential might be "amount of pending work"; resistance "cost to communicate"? We need design fair.

Let's parse wording carefully: "Lens: you are an engineer who wants the smallest mechanism that could work.

Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

This sounds like they ask for algorithm. They mention "potential and resistance values" maybe each cell has potential and resistance. Need decide which cell receives next unit. Rule uses only cell and direct neighbors. Fair and no starvation. Could be inspired by "cellular automata local election" where each cell has "potential" and "resistance". Need maybe "minimum mechanism" like "compare potential to sum of neighbor resistances" to decide if it "fires". But fairness? Hmm.

Could be a known problem: "In a cellular graph, each cell has potential and resistance. A cell receives budget if its potential exceeds sum of resistance of neighbors? This is local fair queuing?" Let's explore.

Maybe potential represents accumulated deficit/credit and resistance represents how much it resists receiving budget? Or potential = desire, resistance = threshold. Need choose next unit. A local algorithm could be: each cell broadcasts its potential and resistance. A cell wins if its potential minus resistance is greater than all neighbors. If tie, use random backoff. This is local max. But if a cell has low potential, it may never win. To ensure no starvation, add aging: increase potential when not served, or decrease resistance. But potential/resistance are given? "given per-cell potential and resistance values" maybe static? If static, cannot guarantee fairness for arbitrary values unless rule ignores values sometimes. If static potential/resistance, a cell with always lower score would starve if deterministic. So need fairness mechanism independent of values, e.g., round-robin among neighbors using token.

Maybe "potential and resistance values" are dynamic? The prompt says "given per-cell potential and resistance values" maybe they are inputs. Need algorithm uses them. To be fair, maybe use "potential" as credit and "resistance" as cost; when cell receives budget, its potential decreases? Hmm.

Let's consider possible context. It might be from a paper or problem about "cellular graph" and "computation budget" allocation. "Potential" and "resistance" are terms in "cell graph" maybe each cell has "potential" (e.g., energy) and "resistance" (e.g., impedance). The next unit of computation budget goes to cell where "current flows" most? Local rule: choose neighbor with highest potential difference / resistance? Like electrical network? "Cellular graph" with potential and resistance values. Decide which cell receives next unit. Could be "token" moving along edges according to potential difference and resistance. Fairness? Hmm.

Maybe there is a known problem: "Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values." This resembles "self-organizing scheduling in grid" where each node has potential (urgency) and resistance (cost). A cell gets budget if it has no neighbor with higher "pressure" (potential/resistance). This is local. Fairness? Could use "anti-starvation" via potential aging. But question asks "Explain why the rule is fair and why it cannot starve a cell forever." So they want proof.

Maybe there is a specific minimal local algorithm: "At each step, each cell compares its potential to the sum of resistances of its neighbors. If its potential is greater than the sum, it can claim the budget. Otherwise, it forwards the token to the neighbor with the highest potential-to-resistance ratio." Not sure.

Let's search memory. There is a concept in distributed systems: "local fair scheduling" using "deficit round robin" on graph. Each node has a queue length (potential) and resistance (weight). Need select next packet from a node. Local algorithm: "If a node's potential exceeds the sum of neighbors' resistances, it fires and resets potential." This is like "self-stabilizing maximal independent set" or "graph coloring"? Potential/resistance values? Maybe from "Firefly synchronization"? Potential and resistance are used in "cellular automaton for load balancing" maybe.

Let's infer from terms: "cellular graph" not "cellular network"? "cell of a cellular graph" maybe vertices in a graph. "per-cell potential and resistance values" — potential and resistance are analogies to electrical circuits. "next unit of computation budget" — scheduling. "local algorithm" — only cell and direct neighbors. "fair" and "cannot starve a cell forever" — fairness and starvation.

Maybe they want a simple algorithm like:
- Each cell i maintains a counter `age_i`.
- Define score `s_i = potential_i / (resistance_i + 1) + age_i`.
- When a cell receives budget, it resets `age_i=0`; otherwise `age_i++`.
- The cell that receives budget is any cell i such that `s_i > s_j` for all neighbors j. If multiple such local maxima, they can't be adjacent. But how to choose one globally? If all local maxima decide to take budget simultaneously, multiple cells receive budget. But if only one unit, need global arbitration. Maybe use a token that travels to the local maximum in its neighborhood. The token holder compares itself and neighbors and moves to max score. That is local and selects one.

This token algorithm uses potential/resistance plus age. It is minimal. Fairness: token cannot get trapped in a subset because boundary cells' ages grow; eventually they become max and token leaves. Starvation: For any cell v, if it is never served, its age grows. Along a path from current token to v, consider the first unserved cell on path? Actually if v never served, all cells on path might be served. But v's age grows; when token reaches neighbor, v selected. Need prove token reaches neighbor eventually. Could use contradiction: Suppose token never visits v. Let S be set of cells visited infinitely often. Since finite, S nonempty. Token eventually stays in S? Actually if it leaves S, then new cells join. If v never visited, there is boundary edge from S to outside T. Boundary cells outside S are not visited infinitely often; if visited finitely, after last visit their age grows. Eventually when token is at adjacent node in S, boundary cell has larger age than any S cell, so token moves there, contradicting S. Thus token visits all cells infinitely often? Wait if S is set visited infinitely often, and outside finite visits, their ages grow unbounded. At a node in S adjacent to outside, the outside neighbor's score eventually dominates, so token leaves S. Contradiction. Thus no proper subset S of all cells can be the recurrent set; S must be all cells. This assumes graph connected and score unbounded in age. So every cell visited infinitely often. Thus no starvation.

But careful: Age bonus for outside cell grows only if it is not served. If it was served finitely, after last service, it increments. If algorithm increments age only when token is at a neighbor? We can define each cell increments age every step it does not receive budget. Since cells not holding token may not know steps? We can have token broadcast? Or simpler: The token holder maintains a timestamp/counter `t`; each cell remembers `last_served`? But local only. A cell can increment its age each time it is not selected in a local election. But if token not nearby, it may not participate. To guarantee, we can have each cell increment its age at each global tick, but that's not local? It is local: each cell increments its own counter on its own clock. But global synchronization may not exist. Alternatively, token carries a monotonically increasing step count, and when it visits a cell it updates that cell's `last_served`. But when comparing neighbors, the token holder needs neighbors' ages. It can ask them: each neighbor computes age as `current_token_time - last_served_neighbor`. The token holder knows current time. This uses only neighbor info. But if cell never visited, its last_served is old, so age huge. This is local. The token holder can query neighbors' potential, resistance, and last_served. It selects max score. Then increments time. The selected cell updates last_served = time. This avoids each cell needing global ticks. Nice.

Algorithm:
- There is a single token (budget) at some cell.
- Each cell stores: potential p_i, resistance r_i, last_served time L_i.
- At step t, token at cell c.
- For c and all neighbors v of c, compute score:
  `S_v = (p_v - r_v) + α (t - L_v)` or `p_v/(r_v+ε) + α age`.
  where α > max possible difference? Actually α can be 1, age grows.
- Choose v maximizing S_v; tie-break by deterministic ID order (or round-robin).
- Move token to v; v receives one budget; set L_v = t.
- t++.
- Repeat.

This uses only c and direct neighbors. But wait: To compute age of neighbor v, token holder needs L_v. That is info from neighbor. Allowed. It doesn't need global view. The token itself is global? A single token traverses graph; only one cell at a time has budget. Is token allowed? It's a minimal mechanism. The algorithm is local in decision: cell with token compares itself and neighbors. The token is like a mobile scheduler. It can reach any cell if connected. If graph not connected, cannot; assume connected.

Fairness proof:
- Each cell's age `t - L_v` increases by 1 each step it is not selected.
- When a cell is selected, its age resets to 0.
- For any fixed cell v, suppose it is selected only finitely often. Then after last selection, its age grows unbounded. Consider the set S of cells selected infinitely often. If v not in S, S is nonempty and not all cells. Since graph connected, there is an edge (a,b) with a in S, b outside S. b is selected finitely, so its age grows unbounded. When token is at a (infinitely often), b is among a's neighbors. For sufficiently large t, b's score exceeds every cell in S that a might compare (since their ages are bounded? Wait cells in S are selected infinitely often, but their ages between selections could be unbounded? Actually if a cell is selected infinitely often, its age at any time can be large if long gaps. Could be unbounded too. But S finite; individual ages can be unbounded if gaps between selections grow. But if a cell is selected infinitely often, its age is not reset at every step; age can grow arbitrarily between selections. So outside b's age may not necessarily dominate S cells if S cells also have huge ages. But S cells are selected infinitely often, so their age resets infinitely often. At any time, there may be some S cell with huge age. However, when token is at a, it compares a and its neighbors. The neighbor b outside S has age growing. If a or other S neighbors have age maybe also large. But b's age is monotonically increasing after last service. Since b is never served after time T, its age > t-T. For any S neighbor, it was served at least once after T? Not necessarily. But if it is in S, it is served infinitely often, so at time t, its age is t - last_served. The last_served for S neighbor could be very recent or old. We need show eventually when token at a, b's score is max. But if an S neighbor was just served, its age small. If not just served, its age could be large. But b's age is at least t-T. The maximum age among S neighbors could be close to t - (last service). Since S cells are served infinitely often, the maximum gap between services for a fixed finite set S? If S is finite, it's possible to have unbounded gaps for each cell while still infinitely often? Yes, e.g., service cell1 at times 2^n, cell2 at times 3^n, gaps unbounded. At time t, some S cell may have age O(t). So b's age not necessarily dominates. But if b is never served, its age t-T. An S cell's age ≤ t - last_service. If last_service could be 0, age ~t. So b's score could be similar. But with tie, not guaranteed. Need stronger fairness proof.

Actually if token recurrent set S, and outside b never served, b's age grows. When token at a∈S adjacent to b, b's score includes age t-L_b. If some S neighbor c has age t-L_c. Since c is served infinitely often, L_c can be arbitrarily close to t? But at the moment token at a, c may not have been served recently. However, if c's age is huge, then c itself might attract token away from a? But c is in S, so token may go to c. That doesn't help b. Could b be starved despite age growing because S cells also have growing ages? Let's construct? Suppose two cells a and b. Token alternates: at a, compare a and b. If a age large and b age large, tie? If b never served, b age grows from 0. a served at time 0, then not served for long, age grows. At time t, both ages t. Tie. If tie broken to a, a gets served, resets. Then at a, b age t+1, a age 0, so b selected. So b not starved. If there are multiple S neighbors with ages growing, tie might favor them. But eventually b age is at least max? Let's analyze.

Suppose b never served after T. At time t, age_b = t - T. For any S neighbor c, age_c = t - L_c. If L_c > T, then age_c < age_b. If L_c ≤ T, then c hasn't been served since before T, but c∈S means it will be served infinitely often, so eventually L_c > T. At any time after all S neighbors have been served at least once after T, their age_c < age_b. Thus b's age is larger than any S neighbor that has been served after T. What about a itself? a∈S, so eventually served after T, age_a < age_b. Thus b's score will dominate all S neighbors whenever token at a, after a has been served after T. Since a is served infinitely often, there will be times after T when token at a and a's last service > T. At that moment, b's age > age_a and > any S neighbor last service > T? Actually other S neighbors might not have been served after T yet, but eventually they will. Since S finite, after some time all S cells have been served at least once after T. Then any S neighbor's last service > T, so age < age_b. Thus b dominates. So token moves to b, contradiction. Thus b must be served infinitely often. This proof works if S is set of cells served infinitely often. For any outside b, eventually b's age exceeds all S cells' ages? Wait if S cells served after T, their last service > T, so age < b's age. Yes. So b's age bonus is larger than any S cell's age. Thus when token at neighbor in S, b chosen. So b enters S. Contradiction. Therefore S = all cells. Good.

But need ensure score function monotone in age and age bonus eventually dominates potential/resistance differences. We can define score = potential - resistance + age (or potential/(resistance+1)+age). Since potential/resistance fixed finite, for large age, age term dominates. But if we compare ages, b's age > S cells' ages, so even with potential/resistance differences, need age margin > max possible potential-resistance difference. But if b's age just one more than S, potential/resistance could favor S. However, if b is outside S, its age grows unbounded, while S cells' ages are reset infinitely often. At times when all S cells have been served after T, their ages could still be larger than b's? No, b's age = t - T. S cell age = t - L. If L > T, then age_S < age_b. The difference age_b - age_S = L - T. As t grows, L - T? L is the last service time of S cell, which can be arbitrarily close to t, so difference could be small. But b's age can be arbitrarily large. The potential-resistance difference is fixed. We need b's score > S score. We can use a strong aging term that grows faster? Actually age_b and age_S both grow with t, but age_b - age_S = L - T. L can be close to t, so difference could be small. But if S cell is served often, its age resets. At the moment token at a, if S neighbor c was served very recently, its age small. If not recently, its age could be large but then L is old. However, b's age = t - T. If L > T, then age_b > age_c? age_b - age_c = L - T. Since L > T, age_b > age_c by at least 1? Actually if L = T+1, age_b = t-T, age_c = t-T-1, so b age is 1 more. If potential-resistance favors c by >1, b might not win. But as time passes, L for c is the last service before current time. It could be T+1 and then c not served for long. But c∈S, so it will be served again. At the moment token at a, c might not be the neighbor? Let's refine.

We need prove b eventually selected. Suppose b never selected after T. Consider times when token at a (neighbor of b). a is in S, so visited infinitely often. At those times, compare b with neighbors. For each neighbor x in S, let L_x be last service before that time. Since x∈S, L_x eventually > T. But at a given time, L_x could be just > T, so age_b - age_x = L_x - T. This difference is at least 1, but could be small. Potential difference might make x score higher if age_x + p_x - r_x > age_b + p_b - r_b. But as time progresses, L_x for each x increases with each service. The minimum L_x over x in S at time t? Since S finite, each x is served infinitely often. For any fixed T, after some time, each x has been served at least once after T. But their last service times can vary. The difference age_b - age_x = L_x - T. If L_x = T+1, difference 1. If potential difference is 100, b won't win. But later, x may be served again, L_x increases, difference grows. However, at any time, some x might have been served recently, L_x close to t, so age_x small, difference age_b - age_x large? Wait if L_x close to t, age_x small, so b dominates. If L_x old, age_x large, but then L_x is not close to t. But age_b = t-T. If L_x old, age_x = t - L_x. Since L_x > T, age_x < age_b. The difference is L_x - T. If L_x is old but > T, difference could be large. The worst case for b is when L_x is just above T, difference small. But if x is not served after L_x for a long time, L_x remains just above T, difference age_b - age_x = L_x - T is constant small. So potential difference could still favor x. But x is in S, so it must be served again eventually. Its L_x will increase, making difference larger. However, at the moment token at a, x might have L_x just above T and not served recently, so its age is almost b's age. If potential favors x, b might not win. Could this persist? Suppose x is served at T+1, then not served for a long time while token cycles elsewhere. During that time, b's age and x's age both grow, difference constant 1. If potential favors x by 100, x wins whenever compared. But eventually x will be served again at time T+K, updating L_x. Then difference becomes K. If K > potential difference, b wins. But if x is served again, that means token left a to x, so b not selected. After x served, token may return to a. At that time, L_x = T+K, so age_b - age_x = K. If K > max potential diff, b wins. Since K can be arbitrarily large? Not necessarily; x might be served frequently, so K small. But if x is served frequently, its age is small when token at a? Actually if x served frequently, L_x is close to current time, so age_x small, so b's age is much larger. Wait, if x served frequently, at time t, L_x is close to t, so age_x = t - L_x is small. b age = t-T is large. Difference large. So b dominates. The only way x's age is close to b's is if x hasn't been served for a long time. But if x hasn't been served for a long time, then when it is eventually served, the gap K is large, and then b's advantage becomes large. But before that, x might win due to potential. However, x winning means x gets served, which updates L_x to large, making b's advantage large. Then b should win next time token at a. So b cannot be starved forever.

Let's formalize: For b to never be served, whenever token is at a, some S neighbor x must have score ≥ b. For each such x, its age must be close to b's age (within potential diff). That means x's last service L_x is not much larger than T. But since x is served infinitely often, eventually L_x becomes large. At that time, if token at a, b wins. If token not at a, eventually it returns to a. When it returns, L_x might have increased further if x was served again. In any case, L_x increases over time. Since x is served infinitely often, L_x → ∞. Then age_b - age_x = L_x - T → ∞. Thus eventually b dominates x. For all finite S neighbors, eventually each has L_x large enough. Then b dominates all. Thus b selected. This works if we consider a fixed time after all S neighbors have been served enough times so their last service L_x > T + M, where M > max potential diff. But wait, after that time, if x is served again, L_x becomes even larger. If x is not served, L_x remains > T+M. So at any time after all S neighbors have L_x > T+M, b's age > age_x + M. So b dominates. Thus b will be selected next time token at a. Contradiction. So b must be in S. Thus all cells in S. Good.

But is it possible S is not all cells but token never at a boundary? If graph connected and S proper, there is boundary edge a∈S, b∉S. Token visits a infinitely often by definition of S. So yes.

Thus token algorithm guarantees no starvation under connected graph and age bonus unbounded.

Fairness definition: Each cell gets budget infinitely often, and long-waiting cells get priority due to age. It is not necessarily equal rate, but no starvation. "Fair" could mean eventually everyone gets a turn; weighted by potential/resistance for efficiency when ages similar.

Need mention tie-breaking. If multiple cells have same score, deterministic tie-break by cell ID can cause bias? But with age, ties broken deterministically still no starvation because ages differ eventually? If ages tie exactly? Ages are integers, if b never served and x served at T+1, ages differ. If tie, use round-robin among tied. To be safe, tie-break by smallest ID or random. Random could starve with probability 0? Better deterministic tie-break plus age. For fairness proof, ties not a problem if age strictly increases for unserved; eventually b's age exceeds S cells, so no tie at top. If potential/resistance integers, age integer, eventually strict.

Minimal mechanism: A token moving to neighbor with max score. Does it need to compute score for all neighbors? Yes. Could be even simpler: token holder compares its own "pressure" to neighbors; if any neighbor has higher pressure, passes token to highest; else keeps. But if it keeps too long, others age. The score includes potential/resistance and age.

Potential and resistance: How combine? We need choose a score function. We can define:
`score_i = potential_i / (resistance_i + 1) + age_i`
or `score_i = potential_i - resistance_i + age_i`.
The problem says "given per-cell potential and resistance values." We can use `potential_i - resistance_i` as intrinsic urgency. Or `potential_i / (resistance_i + 1)` if resistance is cost to overcome. Which is more appropriate? Potential and resistance analogy: In electrical circuits, current ∝ potential difference / resistance. But here per-cell potential and resistance. To decide which cell receives budget, maybe higher potential and lower resistance is better. So score = potential / resistance. But if resistance zero, handle epsilon. For fairness, add age. We can say any monotone combination works; minimal is `score_i = potential_i - resistance_i + age_i` if values are comparable, or `potential_i/(resistance_i + ε) + age_i`. We can keep generic: define an intrinsic priority `q_i = f(potential_i, resistance_i)` monotone increasing in potential, decreasing in resistance. Then score = q_i + α age_i. The exact f is not crucial; use `q_i = potential_i - resistance_i` for simplicity. The key is aging.

Need answer likely expects "algorithm" not too detailed. But user asks "Design a minimal local algorithm... Explain why fair and no starvation." We should provide a concrete algorithm and proof.

Let's think of possible alternative: "Each cell with token checks neighbors. If its potential is greater than the sum of neighbor resistances, it takes budget; else it passes token to neighbor with max potential/resistance. To avoid starvation, if a cell hasn't received budget for T steps, it sets potential to infinity." But our token+age is robust.

Need ensure "rule must use only a cell and its direct neighbors (no global view)." Our algorithm uses a token. The token holder compares itself and direct neighbors. It doesn't need global view. But the token's movement over time is global? The decision is local. The token itself is a global resource? But the rule for next cell is local to token holder. If there is no global token, how does a cell know it's token holder? The token is the unit of computation budget. At any time, the unit is at some cell. That cell decides where to send it next based on local neighborhood. This is like a mobile token. This is minimal: one token, local comparisons.

Could there be an even smaller mechanism without token? For example, each cell independently decides if it gets budget based on local info, and conflicts resolved by random. But to guarantee only one cell gets budget, need some arbitration. Token is minimal.

Let's outline algorithm step-by-step:

Data per cell i:
- `p_i`: potential (real/integer)
- `r_i`: resistance (nonnegative)
- `L_i`: last time it received budget (initialized to -∞ or 0)
- unique ID for tie-breaking.

Global step counter t (or token carries time). Initially token at any cell.

At each step:
1. Token is at cell c. For each v in {c} ∪ N(c) (c and direct neighbors), compute:
   `age_v = t - L_v`
   `score_v = φ(p_v, r_v) + age_v`
   where `φ` is e.g. `p_v - r_v` or `p_v/(r_v+ε)`. (We can use `p_v - r_v`.)
2. Let v* = argmax score_v over this set. Break ties by `(score, age, ID)` or round-robin.
3. Move token to v*. v* receives one unit of computation budget. Set `L_{v*} = t`.
4. `t ← t+1`.

Only c needs to know p,r,L of itself and neighbors. Each neighbor can supply its own values when asked. No cell needs global list.

Fairness:
- The intrinsic part `φ(p_i,r_i)` is bounded (assuming finite fixed values). The age term grows without bound for any cell not recently served. So long-waiting cells eventually outrank any recently served cell.
- Token moves to the locally highest score. Because graph is connected, the token cannot stay forever in a proper subset. Suppose it did. Let S be cells served infinitely often. If S ≠ all vertices, take boundary edge (u∈S, v∉S). v is served only finitely often, so after its last service its age grows unbounded. u is visited infinitely often. Once v's age exceeds the maximum possible intrinsic advantage of any neighbor of u, v will have the highest score among u's neighborhood whenever token is at u. Thus token must move to v, contradiction. So S = all vertices.
- Therefore every cell is selected infinitely often; no cell is starved. Moreover, a cell's waiting time is bounded by something depending on graph size and potential/resistance differences? Actually with age, worst-case wait may depend on max intrinsic difference and graph diameter. But no starvation.

Need address "fair" maybe "weighted fair" because cells with higher potential/lower resistance get served more often when ages are similar. But aging ensures eventual service for all. If exact equal share desired, set φ=0 and use pure age/round-robin. With potential/resistance, it's weighted fairness.

Potential issue: The token holder only compares itself and neighbors. What if the global max score is not adjacent to token? The token moves step by step toward it. But if a cell far away has huge age, how does token know? It doesn't until token gets near. However, the age of intermediate cells also grows if they aren't served. The token will move toward high-age regions because local neighbors of current cell may have high age. But could it get stuck in a local maximum? The aging of all unserved cells breaks local maxima. The proof above handles.

Let's test with a cycle. Suppose three cells A,B,C. Scores intrinsic: A=100, B=0, C=0. Initially token at A. A score 100, B age 0, C not neighbor. A selected. L_A reset. Next at A: B age 1, score 1; A age 0+100=100. A selected again. B age 2... Eventually B age 101, score 101 > A 100. Token moves to B. Then at B, neighbors A and C. A age 1? Actually A just served at t=100, age at t=101 is 1+100=101. B age 0. C age 101? C never served, but C is neighbor of B? Yes. C score 101 > A 101? tie. Tie-break might pick C? If tie picks A, then A selected. But B just served, C age 102 next time. Eventually C gets. So no starvation. Good.

What if potential/resistance differences huge? Aging eventually overcomes.

Need be precise with `age = t - L_v`. If L_v initialized to 0, all ages grow. For a cell never served, age grows. For a cell served, resets to 0. This requires a global time `t`. But "no global view" — a global time is not a view of graph. But if strict no global anything, we can use local counters incremented by each cell every time it is not selected? But how does it know time if token not nearby? Alternative: Each cell maintains an integer `credit_i` that it increments every time it is asked by a neighbor? That might not be fair if token never nearby. Better to have token carry time. The token is the computation budget; it traverses graph. It can carry a counter. The token holder can compute age of neighbor as `token_time - neighbor.last_served`. This uses neighbor's local stored last_served. That is local. So global time is just a counter in the token, not global view. If the token is at c, it knows t. Neighbors store L_v. They don't need to know t except when updated. So it's local.

But if token moves, how do neighbors know their L_v? When token selects v, it tells v: set L_v = t. v stores it. Later, when token is at c and c is neighbor of v, c asks v for L_v. This is direct neighbor communication. Allowed.

Could there be multiple tokens? We want next unit of computation budget. There is one budget unit at a time. So one token.

Let's consider if graph is not connected. Then no algorithm using local info can reach disconnected components. We should state assume graph connected; otherwise restrict to token's connected component. If multiple components need budget, need one token per component or a global interconnect. The question likely assumes connected cellular graph.

Need mention "minimal" — one integer per cell (last_served) plus potential/resistance, one comparison per neighbor. No global coordination, no routing tables, no full graph.

Let's think if there is a more minimal rule: Token holder picks neighbor with max `potential - resistance + (t - last_served)`. That's it. If no neighbor has higher score than current, it stays (gets budget again). Actually the rule selects among current and neighbors. If current has max, it receives next unit again. That's allowed.

Fairness: "cannot starve a cell forever" — prove by contradiction with recurrent set.

Let's write proof more rigorously.

Let G = (V,E) connected. Let S be the set of cells that receive budget infinitely often. Suppose S ≠ V. Pick v ∈ V \ S. Since v not in S, it receives budget only finitely many times; let T_v be its last service time (or T_v=0 if never). Consider a path from some cell in S to v. There is an edge (u,w) with u∈S and w∉S. Actually w might not be v, but w∉S so w is served finitely often. Let T_w be its last service time. For all t > T_w, age_w(t) = t - T_w. Since u∈S, the token is at u infinitely often. When token at u, w is a neighbor. For any cell x in {u}∪N(u) that is in S, let L_x(t) be its last service time before t. Since x∈S, L_x(t) can be arbitrarily large, but also x is served infinitely often. We need show eventually w's score exceeds all x. For each x∈S∩({u}∪N(u)), after some time, L_x(t) > T_w + M where M is large enough to overcome max intrinsic difference. But L_x(t) is the last service time; it increases as x is served. Since x is served infinitely often, L_x(t) → ∞ as t → ∞? Not necessarily monotonically; L_x(t) is nondecreasing and increases infinitely often, so indeed L_x(t) → ∞. Thus for large t, L_x(t) > T_w + M. Then age_w(t) = t - T_w > t - L_x(t) + M = age_x(t) + M. So w's age exceeds x's age by M. With M > max_{y} |φ(y)|, w's score > x's score. For x∉S (other finite-served neighbors), their last service times are finite, so their ages also grow, but they are also outside S; they may compete with w. But w is one of them. For w to be selected, it must beat all neighbors. If another outside neighbor y has higher score, token moves to y, not w. But y is also outside S, so it will be served (contradicting S if y is served? Wait if y is outside S, it is served finitely often. If token moves to y, y receives budget, so its last service updates. But after its last service, it will never be served again. If token moves to y, that would be a service, so it can happen only finitely often. Eventually y's last service passes. But if token keeps moving among outside neighbors, they get served, contradicting they are outside S? Actually S is set of cells served infinitely often. If token moves to w infinitely often, then w∈S. So if w∉S, it can only be selected finitely many times. We assume w is not selected after some time. So when token at u, w must lose to some neighbor x. That x could be in S or outside. But outside neighbors are also served finitely often; after their last service, they also have growing ages. Could they beat w? If they are different, one of them might be selected, but that would be a service, so it can't happen after their last service. Thus eventually, when token at u, the winner must be in S (since outside neighbors are not served after their last service). So w must lose to an S neighbor. But we just argued w eventually beats all S neighbors. Contradiction. So w must be selected, entering S. This proves S=V.

Simpler: Suppose S proper. Pick boundary edge u∈S, w∉S. Since w∉S, it is selected only finitely many times. After its last selection, its age grows unbounded. When token is at u (infinitely often), w's score eventually exceeds that of every S cell in u's neighborhood, because those S cells are selected infinitely often and hence their last-service times grow unbounded. Therefore w would be selected, contradiction. This ignores other outside neighbors. But if another outside neighbor y is selected, then y enters S? Actually if y is selected infinitely often, it would be in S, contradiction to y outside. If y is selected finitely, eventually not selected. So eventually the only possible winners are S cells or w. w beats S cells, so w wins. Thus contradiction. Good.

Need be careful: "those S cells are selected infinitely often and hence their last-service times grow unbounded" — yes, L_x(t) → ∞. So w's age minus x's age = L_x(t) - T_w, which → ∞. Thus w's score eventually exceeds x's score. So w wins. Good.

This proof assumes M finite. If potential/resistance values are finite. If they are unbounded dynamic? The prompt says given per-cell values, likely finite. If potential/resistance can change arbitrarily, no guarantee. We can state assuming fixed or bounded.

Tie-breaking: If scores tie, use a deterministic tie-break that does not systematically favor S cells. But since w's score eventually strictly exceeds S cells by margin M, no tie with S cells. It may tie with other outside cells, but those are not in S and will eventually not be selected. If tie-breaking favors one outside cell, it gets selected finitely? Actually if it ties with w and tie-break always favors y, then y gets selected, updating its age. Then w's age remains larger, next time w strictly beats y. So no infinite starvation.

Let's also discuss "fairness" in terms of no starvation vs equal service. The algorithm provides eventual service to every cell; weighted by potential/resistance. If exact fairness desired, set φ=0. With φ, high-potential/low-resistance cells may get more budget, but aging ensures no cell waits forever.

Potential/resistance combination: We can say "Let `q_i = p_i - r_i` (or any bounded monotone priority). The exact combination is a design choice; use `q_i = p_i/(r_i+1)` if resistance is a cost." The algorithm's fairness depends only on q_i being bounded. So we can keep abstract.

Let's consider if resistance values could be infinite? Then q bounded? If infinite, score not finite. But assume finite.

Now, is the token allowed to "receive budget" at the cell it selects? The next unit of computation budget goes to v*. The token is the budget. After v* uses it, the token is at v* and then decides next. That's fine.

Let's write final answer in a structured way:

- Assumptions: connected graph, finite nonnegative resistance, bounded potential, one budget token.
- State variables: per cell p, r, last (last time served). Token carries time t.
- Rule:
  1. Token at c.
  2. For each v in {c}∪N(c), compute `score(v) = priority(p_v, r_v) + (t - last_v)`.
     Example: `priority = p_v - r_v` or `p_v/(r_v+ε)`.
  3. Choose v* with maximum score; tie-break by e.g. smallest ID or round-robin.
  4. Move token to v*; v* receives budget; set `last_{v*}=t`; `t++`.
- Only c and neighbors needed.

Why fair:
- When ages are comparable, higher potential/lower resistance wins, so it allocates according to urgency/cost.
- Aging is an explicit deficit/credit: every unserved step increases a cell's priority. Thus long-waiting cells eventually dominate.

Why no starvation:
- Let S be cells served infinitely often. Suppose S≠V. Since G connected, there is edge (u,w) with u∈S, w∉S. w is served finitely often; after its last service its age grows unbounded. u is visited infinitely often. Any neighbor x of u that is in S is served infinitely often, so its last-service time eventually becomes arbitrarily large. When token is at u, w's age eventually exceeds x's age by more than any fixed priority difference. Thus w's score eventually beats every S neighbor of u. Other neighbors outside S are served only finitely often, so they cannot keep winning forever. Hence w must eventually be selected when token is at u, contradiction. Therefore S=V. Every cell is served infinitely often, so no cell starves.
- If graph disconnected, apply per component with a token in each.

We can also mention bound: waiting time may be large but finite; it is bounded by something like O(|V| * (max priority difference + diameter))? Not necessary.

Let's consider if there is a flaw: The token at u compares itself and neighbors. w is a neighbor. If w's score beats S neighbors, but what if some other outside neighbor y has even higher score? Then y wins. y is outside S, so it is served finitely. But if y wins, it gets served, which is a service. If this happens infinitely often, y would be in S. So after finite time, no outside neighbor can win (except maybe w if it wins infinitely often, then w∈S). But we assume w∉S, so w cannot win infinitely often. If y wins infinitely often, y∈S, contradiction to y outside. So eventually the winner at u must be in S. But w beats all S neighbors. So w wins, contradiction. This is solid.

What if the token never at u after some time? u∈S means u is served infinitely often, so token is at u infinitely often (since to serve u, token moves to u; then it may leave). So yes.

What if w is not a neighbor of u? Pick boundary edge u∈S, w∉S. Yes.

Thus proof works.

Now, maybe the question expects "minimal local algorithm" without token? Could be they want "each cell independently checks if its potential exceeds sum of neighbor resistances; if so, it fires. To avoid starvation, when a cell hasn't fired for T, it increases potential." But our answer with token is acceptable? The prompt: "decides which cell of a cellular graph receives the next unit of computation budget" — a token moving is a natural mechanism. "The rule must use only a cell and its direct neighbors (no global view)." The token holder uses only direct neighbors. So yes.

Let's maybe phrase as "a token-based local election". This is minimal: one token, no global state.

Let's also address "potential and resistance values" in score. What if resistance is per-edge? The prompt says "per-cell potential and resistance values." So per-cell. We can use `p_i` and `r_i`. If resistance is cost, lower is better. Score `p_i - r_i + age_i`. If potential is like desire and resistance like cost, potential minus resistance is net benefit. If they are not on same scale, use `p_i/(r_i+1) + age_i`. We can state "any bounded monotone function of (p,r) works; for concreteness use `p_i - r_i`."

Let's consider if we need to "explain why fair" in terms of "local" not global. Fairness proof uses global notion S, but that's analysis, not algorithm. The algorithm itself doesn't use global view. That's fine.

Let's write final answer with maybe equations.

Potential issue: The token algorithm uses a global time `t`. If strict local only, can we avoid global time? The token carries `t`. Each cell stores `last_i`. When token at c, it asks neighbor v for `last_v`. It computes `t - last_v`. This is local. The token is the only carrier of `t`. No cell needs to know global graph. So okay.

Let's also mention initialization: `last_i = 0` or `-∞`. If initialized to 0, all cells have initial age. That's fine. Token starts anywhere. If some cells never visited, their age grows.

Let's define `N(c)` as direct neighbors.

Let's write pseudocode:

```
# Token at c, time t
candidates = {c} ∪ N(c)
for v in candidates:
    age[v] = t - last[v]
    score[v] = p[v] - r[v] + age[v]   # or p[v]/(r[v]+1) + age[v]
v_star = argmax(score[v], tie-break by v.id)
move token to v_star
last[v_star] = t
t = t + 1
```

Actually if v* = c, token stays. c receives budget again. That's allowed.

Tie-break: "smallest ID" could theoretically cause starvation if ages tie exactly? But ages are integers. If a cell w never served, its age grows. It will eventually exceed any other cell's age by at least 1. If potential difference is large, it may tie? Eventually exceeds by enough. So deterministic tie-break fine. If potential/resistance are real, still eventually age margin > difference. So strict.

Let's maybe include "α" multiplier: `score = q + α * age`. If q differences up to Δ, choose α > 0. α=1 if q bounded by integer. If q can be large, α can be 1 and age grows. Actually if q differences are up to D, age grows unbounded, so eventually age difference > D. No need α>1. But if q can be negative large, still.

Let's think about "resistance" maybe should be subtracted? If resistance is high, cell should be less likely to receive budget? Or resistance means it resists receiving? The prompt: "given per-cell potential and resistance values." Potential might be how much it wants/needs budget; resistance might be how much it resists? Usually higher potential means more deserving, higher resistance means less. So net = potential - resistance. Or if resistance is cost to compute, higher resistance means more expensive, so lower priority. Yes.

Could also be "potential" and "resistance" in a graph where a cell's potential is its current load? Then high potential might mean high need? Not sure. We can keep abstract.

Let's maybe mention "If resistance is meant as a weight (higher resistance should get more often), replace by potential + resistance; the fairness argument is unchanged as long as the intrinsic term is bounded."

Now, let's consider if there is a possible counterexample to no starvation with token+age. Suppose graph is a star. Center C, leaves L1, L2. Token at C. Scores: C has huge potential 1e9. Leaves age grow. Eventually L1 age > 1e9, token moves to L1. At L1, neighbors only C. C age = t - last_C. C was just served? Actually C served many times until L1 age > 1e9. At time T, C last served at T-1, age 1. C score = 1e9+1. L1 age = T. If T > 1e9, L1 score = T. L1 wins. Then token at L1. Next step, compare L1 and C. L1 just served, age 0, score 0. C age = 1? Wait C last served at T-1, now t=T+1, age=2, score 1e9+2. C wins. Token back to C. Then at C, L1 age=1, L2 age=T+1? L2 never served, age T+1. L2 wins. So leaves get served. No starvation. Good.

What if center has potential infinite? Then no fairness. But finite.

Now, maybe the algorithm should not let a cell receive budget if it just did? But it can. The age of others grows.

Let's also think about "fair" in context of "potential and resistance" maybe they want weighted fairness. Our algorithm gives weighted fairness: high potential/low resistance cells get more budget, but each gets some. If exact equal fairness required, ignore potential/resistance or use them only for tie-break. But the prompt says "given per-cell potential and resistance values", so they should influence.

Let's write final answer in a concise but complete way.

Potential final structure:

1. "Use a single mobile token (the next budget unit)."
2. Data and local rule.
3. Fairness/no-starvation proof.
4. Notes on assumptions.

Let's draft:

```
Assume G connected. Each cell i stores p_i, r_i, L_i (last time served). Token carries time t.

At time t, token at c:
  for v in {c} ∪ N(c):
      age_v = t - L_v
      score_v = (p_v - r_v) + age_v       # or p_v/(r_v+ε) + age_v
  v* = argmax score_v (tie: smallest ID / round-robin)
  move token to v*
  L_{v*} = t
  t <- t+1
```

"Only c and its direct neighbors are inspected."

Fairness:
- The intrinsic part is bounded. A cell not served since L has age t-L, which grows linearly. Therefore a long-waiting cell eventually outranks any cell that was served recently.
- Suppose some cell w is starved. Let S be set of cells served infinitely often. If w∉S, S≠V. Since G connected, pick edge u∈S, w'∉S. w' served finitely, so its age grows unbounded. u is visited infinitely often. Any neighbor of u in S is served infinitely often, so its last-service time eventually exceeds w'’s last service by more than any fixed priority difference. Thus w'’s score eventually beats all S neighbors of u. Other neighbors outside S are served only finitely, so they cannot keep winning forever. Hence w' must be selected when token is at u, contradiction. Therefore every cell is in S; every cell is served infinitely often. No starvation.

Wait in the proof, I used w' not w. Let's make it clear: Pick any w not in S. Boundary edge u∈S, w∉S. Then w is starved (served finitely). The proof shows w must be selected, contradiction. Thus no w outside S. So S=V.

"Fair" maybe "not necessarily equal rates, but no cell waits forever. If you want exact round-robin, set p-r=0; then it reduces to a local round-robin token."

Let's also mention "If graph is disconnected, put one token per connected component; local rule cannot cross missing edges."

Let's consider if the token can move to a neighbor that is not in S and then that neighbor gets served, so it enters S if served infinitely. But if it's served finitely, after its last service, it won't be selected. The proof handles.

Let's maybe include a small note on "resistance" combination: "If resistance is a cost, use p/(r+1); if it is a benefit, use p+r. The exact formula is not important; it only has to be bounded and monotone."

Now, is there any need to mention "potential" and "resistance" are per-cell, but the rule uses only cell and direct neighbors. Yes.

Let's think if there is a simpler local algorithm without token that might be expected. Could be "Each cell computes `pressure = potential / resistance`. If its pressure is greater than all neighbors, it gets budget. To avoid starvation, add a counter." But how to ensure only one cell? In a cellular graph, local maxima form an independent set. If all local maxima take budget, multiple cells get budget. If only one unit, you need a global token. The prompt says "decides which cell ... receives the next unit" singular. So token is appropriate.

Maybe they want "the rule must use only a cell and its direct neighbors" meaning the decision for a cell to receive budget can be made by the cell itself based on its neighbors. But if multiple local maxima, they could all receive? Not if only one unit. So a token is a minimal way to serialize. The token holder is a cell; it uses direct neighbors. That satisfies.

Let's consider if the token itself is a global entity, violating "no global view"? The token is local at one cell. The algorithm doesn't require any cell to see the whole graph. The token moves locally. This is fine.

Let's maybe mention "The token is just the unit of budget; it moves one edge per step."

Let's also consider if the score should include resistance of edges? The prompt says per-cell resistance. If resistance is per-cell, using `p_i - r_i` is fine. If resistance is like electrical resistance, current might be `(p_i - p_j)/r_ij`. But per-cell resistance values? Hmm.

Let's re-read: "given per-cell potential and resistance values." Could mean each cell has a potential and a resistance. In electrical networks, potential is at nodes, resistance is on edges. But it says per-cell resistance, so maybe each cell has a resistance value. We'll treat as per-cell.

Could there be a known "minimal local algorithm" called "randomized local greedy" where each cell has potential and resistance, and the rule is: cell i can take budget if `potential_i > sum_{j∈N(i)} resistance_j`. This is local and fair? Let's examine. If potential and resistance are static, a cell with low potential might never satisfy. But if potential increases when not served, then eventually. This is similar to our age. The rule "potential > sum of neighbor resistances" is a local threshold. It ensures no two adjacent cells both take? Actually if two adjacent cells both have high potential, both could satisfy, causing conflict. To avoid, use "if potential_i > max neighbor potential + resistance_i" etc. But fairness? Hmm.

Maybe the problem is from a specific context: "cellular graph" where each cell has "potential" and "resistance" values. "Computation budget" is a resource. "Design a minimal local algorithm that decides which cell receives the next unit." The phrase "potential and resistance" might be from a model of "self-stabilizing scheduling" where potential is like a counter and resistance is like a threshold. The algorithm might be "each cell i computes a score `potential_i / resistance_i`. If its score is higher than all neighbors, it fires and resets potential." This is like "cellular automaton" for maximal independent set. But fairness? If a cell has low score, it never fires. To avoid starvation, potential increases. The question asks "Explain why the rule is fair and why it cannot starve a cell forever." This suggests the algorithm should include an aging mechanism. So our answer is likely in line.

Let's maybe include both: "A token-based local election with aging." That is concrete.

Let's think about proof of no starvation more carefully. The token moves to max score among current and neighbors. Suppose S is set of cells served infinitely often. We want S=V. Suppose not. Pick u∈S and w∉S adjacent. w served finitely. Let T_w be last time w served. For any t > T_w, age_w(t) = t - T_w. Consider times when token at u. u is served infinitely often, so token at u infinitely often. Let x be any neighbor of u that is in S. Since x served infinitely often, its last service time L_x(t) → ∞. Thus age_x(t) = t - L_x(t). The difference age_w(t) - age_x(t) = L_x(t) - T_w → ∞. So eventually age_w - age_x > M, where M > max score difference from potential/resistance. Thus score_w > score_x. What about u itself? u∈S, so same. What about other neighbors y∉S? They are served finitely, so after their last service, they also have age growing. Could y have score > w? If y is selected, it gets served, contradicting y∉S if it happens infinitely. But it could be selected finitely. Eventually, after all neighbors outside S have had their last service, they cannot be selected again. But wait, if they are never selected again, how can their last service be defined? It's the last time they were selected. After that, they are not selected. So at times after all outside neighbors' last service, the winner at u cannot be outside S (except w? But w is outside S, so w also has a last service; after T_w, w is never selected by assumption). So the winner must be in S. But we just showed w beats all S neighbors. So w would be selected, contradiction. Therefore no such w. So S=V.

This proof assumes that if a cell is outside S, it is selected finitely, so there is a time after which it is never selected. That's true by definition of finitely many times. For all outside neighbors of u, there is a time after which none are selected. Then the token at u must select an S neighbor. But w beats them. Contradiction. Good.

Wait, what if w is selected after T_w? That contradicts T_w being last service. So if w is outside S, it is never selected after T_w. So when token at u after T_w, w is a candidate. If w beats all S neighbors, and all outside neighbors are not selected after their last service, then w must be selected. But that would be a service after T_w, contradiction. So w must not beat all S neighbors. But we showed it eventually does. Contradiction. Thus w cannot be outside S. So S=V.

This is rigorous.

Now, let's consider if the token can be at u when u is selected? The token at u means u is about to decide. If u selects itself, it receives budget. Then token remains at u. If it selects w, w receives budget. So u is served whenever token at u and selects itself. But u∈S means u is served infinitely often, so token at u infinitely often? Actually if u is served, token moves to u. It could be that u is served, then immediately moves away. But to be served again, token must return. So token at u infinitely often. Yes.

Now, let's write final answer with math notation.

Potential final answer:

```
Use a single token. At time t, token at c. For v ∈ {c} ∪ N(c):
    age(v) = t - last(v)
    score(v) = potential(v) - resistance(v) + age(v)
Pick v* = argmax score(v). Tie-break by ID.
Move token to v*. last(v*) = t. t++.
```

If resistance should be multiplicative: `score = potential/(resistance+ε) + age`. We can put in parentheses.

Fairness:
- The intrinsic term is bounded, so the age term eventually dominates. A cell that has waited since time L has age t-L. If it is not served, this grows without bound. Thus any cell can eventually outbid any neighbor that was served more recently.
- The token cannot be trapped in a proper subset. Suppose S is the set of cells served infinitely often. If S ≠ V, take an edge u∈S, w∉S. w is served only finitely, so after its last service its age grows. u is visited infinitely often. Any neighbor of u in S is served infinitely often, so its last-service time grows; eventually w's age exceeds it by more than the maximum possible potential-resistance advantage. Hence w would win the local election at u, a contradiction. Therefore S=V. Every cell is served infinitely often, so none starves.

Maybe mention "This is fair in the sense of eventual service; if you want equal frequency, set potential-resistance to 0."

Let's also mention "The only state added is a last-served timestamp per cell. No routing table or global view."

Let's consider if the question asks "Design a minimal local algorithm" — maybe they want pseudocode. We'll provide.

Let's also mention "If graph is disconnected, the rule works per connected component; a single token cannot reach other components, so either assume connected or use one token per component."

Now, let's think if there is any other interpretation. Could "cellular graph" mean a graph where each cell is a vertex and edges connect to neighbors. "Potential and resistance values" maybe each cell has a potential (like voltage) and resistance (like resistance to accepting budget). The next unit of computation budget might be given to the cell with highest "current" from neighbors? A local rule could be: cell i receives budget if its potential minus sum of neighbor potentials divided by resistance is maximal. But fairness? Not.

Our answer is general enough.

Let's maybe include a note: "The rule is local because the token holder only queries its direct neighbors for their p, r, and last-served values. It does not need to know the graph outside that neighborhood."

Now, let's write final answer in a polished way.

Potential final:

```
Algorithm (token election with aging)
Assume G connected. Let token be the next budget unit. Each cell i stores p_i, r_i, L_i. Token carries time t.

At each step:
1. Token at c.
2. For each v in {c} ∪ N(c):
      age_v = t - L_v
      score_v = p_v - r_v + age_v   # or p_v/(r_v+ε) + age_v
3. v* = argmax score_v; tie-break by v.id.
4. Move token to v*. v* receives budget. L_{v*} = t. t++.
```

Then proof.

Let's ensure no ambiguity in "resistance": If higher resistance should reduce priority, `- r_v` is correct. If resistance is a weight (higher means more deserving), use `+ r_v`. The fairness proof only needs bounded intrinsic term. We can say "use your preferred monotone score."

Let's also mention "potential and resistance values" are used in `score`. If they are static, the intrinsic term is bounded. If they change, assume bounded for fairness.

Let's consider if "potential" and "resistance" might be used to determine edge weights? The prompt says per-cell, so fine.

Now, let's maybe include a short example? Not necessary. Desired oververbosity 5. We can keep concise but complete.

Let's also address "fair" could be interpreted as "no cell starves" and "long-waiting cells get priority". We'll define.

Let's write final answer now.

## answer

Assume the cellular graph is connected. Use a single mobile **token** as the next unit of computation budget. The token moves from cell to cell; whichever cell the token selects receives the budget.

### Minimal local rule

Each cell \(i\) stores:

- \(p_i\): potential
- \(r_i\): resistance
- \(L_i\): last time it received the budget

The token carries a time counter \(t\).

At each step, suppose the token is at cell \(c\). It looks only at \(c\) and its direct neighbors \(N(c)\). For every candidate \(v \in \{c\}\cup N(c)\), compute

\[
\operatorname{score}(v)= p_v - r_v + (t-L_v)
\]

or, if resistance is meant as a cost to divide by,

\[
\operatorname{score}(v)= \frac{p_v}{r_v+\varepsilon} + (t-L_v).
\]

Then:

1. Pick \(v^\* =
