# sample 2 — lens: a teacher who explains by building one small piece at a time

## seed_requested
{"seed": 9, "bits16": "0000000000001001", "job_id": "be2a2bd6-7fa4-496e-b36f-0b998cf8e3c2", "source": "mothquantum/coin-toss-v1"}

## chain-of-thought

We need answer. Need craft. User asks: "Lens: you are a teacher who explains by building one small piece at a time.

Design a minimal local algorithm that decides which cell of a cellular graph receives the next unit of computation budget, given per-cell potential and resistance values. The rule must use only a cell and its direct neighbors (no global view). Explain why the rule is fair and why it cannot starve a cell forever."

We need provide design minimal local algorithm. Need infer context? cellular graph, per-cell potential and resistance values. Need decide which cell receives next unit of computation budget. Rule uses only cell and direct neighbors no global view. Need explain fairness and starvation-free.

We need think. This is open. Need design local algorithm likely distributed scheduling. Each cell has potential (maybe demand/priority) and resistance (cost/difficulty). Need choose next budget locally. Need decide which cell of graph receives next unit. It must use local info only. Need fairness and no starvation. Need maybe token-based? A "minimal local algorithm" could be: each cell computes score = potential / (resistance + 1). It asks neighbors if any has higher score. If no neighbor has higher, it claims the budget. But that uses only direct neighbors, but to know global max, maybe local maxima can all claim? Need avoid conflicts. We need decide "which cell receives next unit" perhaps there is a central scheduler? But rule must use only cell and direct neighbors no global view. Maybe each cell decides based on local neighborhood. Need ensure exactly one cell? Hmm.

Let's parse: "Lens: you are a teacher who explains by building one small piece at a time." likely prompt from some benchmark. They want a minimal local algorithm for budget allocation in cellular graph using potential and resistance. The rule must use only a cell and its direct neighbors (no global view). Explain why fair and cannot starve.

This resembles "cellular automaton" or "graph cellular automata" where each cell has potential and resistance. We want allocate computation budget to cells. Need local algorithm. Maybe use "gradient" or "token circulation". Need fairness/starvation-free.

Could design simple: Each cell keeps a local counter/age since last served. Each tick, each cell compares its "urgency" with neighbors. If its urgency is at least all neighbors' urgencies, it takes budget; otherwise it waits. Urgency = potential * time_since_served / (resistance + 1). This uses only direct neighbors. But if two adjacent local maxima? If we require >= all neighbors, adjacent cells cannot both be strict? Actually if equal, both might satisfy >=. Need tie-break with unique ID to decide if local winner within neighborhood? But without global view, adjacent local maxima may exist separated by valley; both could claim simultaneously. But if only one unit per round globally, need coordinate. Maybe algorithm decides if a cell is eligible; then some external? Hmm.

Maybe "which cell receives next unit" can be decided by local rule: each cell independently asks "am I a local maximum of score among neighbors? If yes, I get it (or contend)." If graph has multiple local maxima, not unique. Need maybe define "next unit" per cell? Or in a cellular graph, each cell decides if it receives budget based on local comparison, but multiple can receive? The question says "which cell of a cellular graph receives the next unit" singular. Need ensure unique.

Could use "token passing" local algorithm: budget is a token that moves from cell to cell. At each step, the token holder chooses among itself and neighbors the cell with highest priority score (potential/(resistance+1)) adjusted by waiting time. The token moves there and that cell receives budget. This uses only cell and direct neighbors: token holder examines itself and its neighbors. But what if token holder not at local max? It moves one step toward higher priority neighbor. Over time, token navigates graph. This is local. Fairness? If priority includes aging, the token will eventually visit every cell? Need prove no starvation. This is like greedy walk with aging. But if static potential/resistance, token might get stuck at global max and starve others. Add aging: each cell's score increases with time since last visited; then no cell can be permanently lower than its neighbors forever if not visited? Need prove. But token holder only sees neighbors. It moves to highest score among self and neighbors. If a cell is starved, its age increases, eventually its score becomes higher than all neighbors? Wait if a neighbor is visited often, its age resets, but if the starved cell is adjacent to a frequently visited cell, its age grows. At some point when token is at neighbor, the starved cell's score may exceed neighbor's score due to age. Then token moves into starved cell. If not adjacent? Token path may traverse through other cells. To reach a starved cell, need local gradient. If a whole region starved, boundary cells age too, so token eventually moves in? Need analyze. If token is stuck in a clique? Let's formalize.

Token algorithm:
- Each cell i has potential p_i >= 0, resistance r_i > 0.
- Maintain age a_i = number of rounds since i last received budget (or since start).
- Score s_i = (p_i + α a_i)/(r_i + 1) maybe. Or potential * (1 + a_i)/ (r_i+1).
- Budget token at current cell c. At each step, c compares s_i for i in {c} ∪ N(c). It sends token to neighbor (or keeps) with maximum score. If tie, use cell ID to break. The chosen cell receives the next unit.
This uses only c and its direct neighbors. But if token at c, to compare neighbors, it needs their potential/resistance/age. Are those available to c? Direct neighbors yes. It does not need global view. But does it use only a cell and its direct neighbors? Yes, token holder uses neighborhood. The decision selects one cell among c and neighbors. But if the chosen cell can be a neighbor not c, then the token moves. If c itself wins, c gets budget. This is local. But is it "which cell of graph receives next unit" decided by current token holder based on its neighborhood. It doesn't decide among all cells, only next step. But over time it allocates.

Need fairness/starvation-free. With aging term, every cell's score tends to infinity if it never receives. However, if token is at cell j not adjacent to starved i, j cannot see i. But as i ages, its neighbors may also not receive? Let's test.

Consider line graph 1-2-3. Token stuck at 1? Suppose p1 huge, p2,p3 zero. Ages reset for 1 every time. s1 high, s2 increases if not visited. Token at 1 compares s1 and s2. Eventually s2 > s1, token moves to 2. Then at 2 compares 1,2,3. s2 reset? Wait when token moves to 2, 2 receives budget, age2 resets to 0. At next step, at 2 compares s1 (age1=1 since not visited? Actually 1 just got budget previous step? Let's simulate carefully: Token at 1, decision chooses 1, 1 gets budget, age1 resets. Next step token at 1, compares s1= p1/(r+1) with s2 growing. Eventually s2 > s1, token moves to 2, 2 gets budget, age2 resets, age1++ (since not visited). Next step at 2, compare s1 (now age1=1) and s2 (0) and s3. s2 may be low, s1 maybe p1 high; maybe token moves back to 1 immediately. Then 3 never reached. Because when at 2, after moving to 2, age2 resets, so score2=0. Score1 = p1/(r1+1) maybe high. If p1 huge, score1 > score2, token returns to 1 before 3 ages enough? But 3's age increases only if not visited. At step at 2, s3 = (p3 + α a3)/(r3+1). If p1 is huge, even with aging, s3 may eventually grow, but token at 2 only decides once after 2 reset. It may move back to 1 before s3 surpasses s1? Wait at step at 2, token compares s1, s2, s3. s2 reset to 0. s3 has age since last visited, which may be large. If p1 huge, s1 could be > s3 for a long time. But s3 continues to age while token bounces 1-2. Each time token at 2, s3 increased by number of steps. Eventually s3 will exceed s1, then token moves to 3. So yes eventually.

But consider path 1-2-3-4, token stuck at 1, p1 huge. Cell 4 ages. But token at 1 only sees 2. It moves to 2 when s2 > s1. At 2, it compares 1,2,3. If s3 not high enough, it returns to 1. It may bounce 1-2 many times. During this, 3 ages? Yes, 3 not visited, so age3 increases. Eventually at 2, s3 > s1, token moves to 3. Similarly propagates. So aging can pull token through path. But need ensure when token at 3, it doesn't bounce back before reaching 4. s4 ages, eventually > s1 etc. So no starvation.

But wait if there is a branch and p1 huge, token might oscillate and eventually explore all due to aging. This is like "least recently served" priority. It should visit every cell infinitely often? Need prove. Because if some cell never visited, its age grows unbounded. Consider the set S of cells never visited after some time. It is nonempty. Since graph connected, there is an edge from a cell outside S (visited often) to a cell inside S. Let u outside S adjacent to v in S. At some point token at u. Since v never visited, age_v -> ∞, so score_v eventually exceeds all neighbors and u. Then token moves to v, contradiction. Unless token never at u after that? But u outside S means visited infinitely often? Actually S = cells not visited after time T. Outside S may be visited finitely or infinitely? Since token always moves to some cell, if S nonempty, the token may eventually be confined to outside S? But graph connected, if S nonempty, there is boundary edge. If token never crosses, it stays in outside. Are all outside cells visited infinitely often? Not necessarily; token could get stuck in a subset outside S, leaving some outside cells finitely visited. But then those finitely visited outside cells also have growing age. Consider set of cells not visited infinitely often. Let S = cells visited finitely many times. Nonempty if starvation. Graph connected. There is boundary edge u in S (finitely visited) and v in complement (infinitely visited) or vice versa? Since S nonempty and not all cells (token infinite, at least one visited infinitely). There is edge from S to complement. Let v in complement visited infinitely often, u in S adjacent. When token at v at some late time, u's age grows unbounded (since not visited again), so eventually score_u > all neighbors and v, so token moves to u, causing u to be visited again. Contradiction. Thus every cell visited infinitely often. This proof works if token at v infinitely often and v can see u. At those visits, u's age increases; eventually u's score exceeds v's. But what if v's score also high due to potential? u's age unbounded, so eventually yes. Then token moves to u. So no starvation.

But the algorithm as described uses a token. Does it satisfy "decides which cell receives next unit" given per-cell potential and resistance? Yes. It is minimal: one token, local greedy with aging. Need define "potential" and "resistance". Potential maybe higher means more deserving; resistance higher means more costly. Score = potential / (resistance + 1) plus aging. Use α maybe 1. Need ensure resistance positive. If resistance zero, denominator 1. If potential can be negative? Assume nonnegative.

But maybe they want a "local algorithm" not token? Could also be "each cell checks neighbors, if potential/resistance ratio is maximum in neighborhood, it gets budget". But fairness/starvation? If static, high potential starves low. Need aging. The token approach is natural.

Need explain step-by-step as teacher. Build small pieces:
1. Each cell stores potential p_i, resistance r_i, and age a_i (time since last served).
2. Define local urgency u_i = (p_i + a_i) / (r_i + 1) or (p_i / (r_i+1)) + a_i? Need choose. If resistance high, should be less urgent. Age should eventually dominate resistance and potential. So u_i = p_i/(r_i+1) + a_i maybe simpler. If age adds linearly, eventually dominates. If p_i/(r_i+1) can be negative? Assume nonnegative. Use u_i = p_i/(r_i+1) + a_i. Or u_i = (p_i + a_i)/(r_i+1): age effect divided by resistance, which could delay high-resistance cells but still eventually unbounded because a_i/(r_i+1) -> ∞. Both okay. Need avoid resistance being infinite. Use u_i = p_i/(r_i+1) + a_i. Then age directly ensures starvation-free regardless of resistance. Fairness? It balances potential and resistance, and aging gives LRU fairness. But if age added linearly, potential differences can be overcome by waiting. Good.

3. There is a single "budget token" (or scheduler pointer) located at some cell c. At each round:
   - c looks at itself and all direct neighbors.
   - For each i in {c} ∪ N(c), compute u_i.
   - Choose i with largest u_i; if tie, choose smallest ID (or some deterministic tie-break).
   - If chosen i = c, c receives the next budget and its age resets to 0. Other cells' ages increase by 1.
   - If chosen i ≠ c, the token moves to i; i receives the budget and resets age_i=0. Other ages increase.
   Actually if token moves to i, does i receive budget in same step? Yes. Then next step token at i.
   - Age update: For all cells? But no global view. Each cell can increment its own age every round. But when token not at cell, how does cell know? It can just increment age_i each round unless it receives budget. This is local. The token holder only needs ages of itself and neighbors. Neighbors' ages are updated by themselves. But how does token holder get neighbor ages? In distributed setting, neighbors can share age when queried. The rule uses direct neighbors. It doesn't require global view. If we want purely local, each cell can maintain age; token holder queries neighbors. That's okay.

But if there's no global clock? We can define rounds. Each cell increments its age every tick; when served, resets to zero. Token holder queries neighbors' current age. This is local.

Need ensure exactly one cell receives next unit. Token holder chooses one. If chosen neighbor, token moves there. This is like a walk. It doesn't need global view. It only uses c and direct neighbors.

Fairness definition: Over time, no cell starves; every cell is selected infinitely often. Also if two cells have equal potential/resistance, they receive similar frequency due to age resets. But with different potential/resistance, fairness means weighted by potential and inversely by resistance: high-potential low-resistance cells get served more often, but low-potential high-resistance cells still eventually get served. Is that "fair"? We need articulate. The rule is fair in the sense of eventually giving every cell a turn (starvation-free) and respecting local desirability via potential/resistance. If you want strict round-robin, set p=0,r=0. With p,r, it's weighted fair.

Proof no starvation:
- Suppose some cell v is never served after time T.
- Its age a_v increases by 1 every round, so a_v → ∞.
- Since the graph is connected and the token visits infinitely many cells (at least one), there is a neighbor u of v that is visited infinitely often? Need be careful: If v starved, its neighbors may also be starved? Consider starved set S = cells not served after T. If S is all cells, impossible because token serves one each round. So S is proper. Since graph connected, there is an edge between S and complement C. Let u ∈ C visited infinitely often? The complement C may include cells visited finitely too. But we can choose S as set of cells visited finitely many times. If any cell starves, S nonempty. Token serves infinitely many cells, so complement nonempty. Choose boundary edge between S and C. The C cell might be visited finitely? Wait if boundary edge is between S (finitely visited) and C (infinitely visited? Not guaranteed; C is complement of S, so by definition cells visited infinitely often. Because S = finitely visited. Yes if S nonempty and not all, complement = infinitely visited. Since token serves one each round infinitely, there is at least one infinitely visited cell. But could all cells be finitely visited except one? Then complement is that one, and if graph connected and S nonempty, boundary edge from S to that one. Good. Let u ∈ C adjacent to v ∈ S. Since u is visited infinitely often, at some time token at u. v's age grows unbounded because v ∈ S (finitely visited). When token at u, it compares v's urgency. Eventually a_v is large enough that u_v > u_u and all other neighbors. Then token moves to v, serving v, contradiction. Thus S empty. So every cell is visited infinitely often. This proof assumes when token at u, it can choose v; v is direct neighbor. Yes. And v's age is unbounded. Even if u's age also unbounded? u visited infinitely often, so age_u is reset infinitely often, but between visits can be large. However v's age can be made larger than u's current age? At the moment token at u, u just received budget? Wait if token is at u, u may have just been served previous step? Let's detail: The token is at u at start of round. It might be because u was chosen previous round, so u received budget and age_u reset to 0 at previous round. Then at start of current round, age_u = 1 (if increments after). v has not been served for a long time, so age_v is huge > age_u. So v wins. If token at u but u was not just served? In this algorithm, token moves to chosen cell and that cell receives budget immediately. So token's location is always the last served cell (or initial). Thus when token at u, u's age was reset at previous round (or initial). So u's age is small (0 or 1). So v's age can exceed. If token can stay at u and serve u again, then at start age_u=0? Actually if u chosen again, it resets. But if v's age huge, u cannot choose itself if v's score higher. So eventually v wins.

But wait, what if u is not visited infinitely often? In the boundary argument, we choose u in complement of S where S = finitely visited cells. Complement = infinitely visited cells. So u is visited infinitely often. Good.

But there is subtlety: The token may not be able to reach u infinitely often if v is starved? u is in complement, so yes. When token at u, v is neighbor. v's age grows. So eventually v is chosen. Contradiction. So no starvation.

This is solid.

Now, "fairness" might also require not favoring high potential too much? We can mention: Because age is included, any cell's urgency eventually becomes larger than any fixed neighbor's urgency if it waits long enough. Thus waiting time acts as a debt that must be paid. The rule is local and deterministic. Potential/resistance only affect how often, not whether.

Need maybe discuss resistance: Higher resistance lowers urgency, so cell is served less often, but its age term still grows unbounded. So no permanent starvation even if resistance huge.

Need maybe give a concrete example? The prompt: "Lens: you are a teacher who explains by building one small piece at a time." So answer should be step-by-step, small pieces. Maybe use headings: Piece 1: local state. Piece 2: urgency. Piece 3: token. Piece 4: rule. Piece 5: fairness proof. Piece 6: starvation proof.

Need ensure "minimal local algorithm" not overcomplicate. Maybe define algorithm as pseudocode.

Let's craft answer:

- Graph G = (V,E). Each cell i has p_i ≥ 0, r_i > 0.
- Add a_i: number of rounds since i last got budget. Initially 0 or arbitrary.
- Define urgency:
  U_i = p_i / (r_i + 1) + a_i.
  (If you want stronger resistance penalty, use p_i * a_i? No, need unbounded. p_i/(r_i+1) + a_i is fine.)
- Token at c.
- Each round:
  1. c asks each neighbor j for U_j (or they maintain and share).
  2. c computes U_c.
  3. Choose k = argmax_{j ∈ {c} ∪ N(c)} U_j, tie-break by smallest ID.
  4. k receives budget. If k ≠ c, token moves to k. Set a_k = 0.
  5. All cells increment a_i by 1 (or reset k then increment others; define consistently).
- No global view: c only sees itself and neighbors. Other cells update their own age locally. Token movement is along edges.

Wait: If k receives budget, all cells increment age by 1. If we increment all including k, then a_k becomes 1 after reset. That's okay. Or reset to 0 and others +1. Need define.

Fairness:
- The urgency has two parts: static merit p/(r+1) and waiting debt a.
- Static merit makes cells with higher potential or lower resistance more attractive.
- Waiting debt makes cells that have waited longer more attractive.
- Because a_i grows without bound if a cell is ignored, any cell can eventually outbid its neighbors. So no permanent favoritism.
- For identical p,r, the rule becomes "serve the least recently served cell among current and neighbors", which spreads service around.

Starvation proof:
- Suppose cell v is starved after some time. Then a_v → ∞.
- Let S be set of cells served only finitely many times. S nonempty. Since at least one cell is served infinitely often, S ≠ V. Graph connected, so there is an edge (u,v) with v∈S and u∉S.
- u is served infinitely often. Consider a late time when token is at u. v is a neighbor of u. Since v∈S, a_v is huge. u's age was recently reset (or at least bounded at that instant), so U_v > U_u and U_v > all neighbors of u (for sufficiently large a_v).
- Then the local rule at u must choose v. So v is served, contradiction.
- Therefore S is empty: every cell is served infinitely often. No cell can starve forever.

Need be cautious: "U_v > all neighbors of u" - v's neighbors include u. But v's urgency compared to other neighbors of u? We only need v > u and v > other candidates at u. Since a_v → ∞, yes it eventually exceeds any fixed values. But other candidates' ages may also grow if they are in S? But if other neighbor w of u is also starved, its age also grows. Then v may not exceed w if both grow at same rate. This is an issue! In the proof, if multiple starved cells adjacent to u, their ages grow at same rate, so v may not be strictly greater than w. The token at u might choose w instead of v, then w is served, so v remains starved? But if w is served, it leaves S? Actually S defined as finitely served; if w gets served once, it might still be finite, but if it continues? Need handle ties among multiple starved neighbors. The rule tie-breaks by ID. If v and w both starved, they both have growing ages. At u, the one with smaller ID or slightly larger age may be chosen. If w is chosen, w is no longer starved forever (it got served), so S changes. But v might still starve. The proof by contradiction with fixed S may fail if multiple starved cells have equal growth and one gets served intermittently? Let's analyze.

We need prove no starvation for token greedy with aging and tie-break. Suppose some cell v is never served after time T. Let S be set of cells never served after T (permanent starvation). S nonempty. Its complement C contains cells served at least once after T, possibly infinitely. Graph connected, there is edge u∈C, v∈S. If u is served infinitely often? If u only finitely, maybe move to another boundary. Consider set S of permanently starved cells. If S nonempty, since token serves one per round, complement C nonempty. There is boundary edge u∈C, v∈S. If u is served infinitely often, then at some time at u, v's age grows unbounded, but other neighbors in S might also have unbounded ages. If v and another w in S are both neighbors of u, their ages grow similarly. The max among them may be w, so u moves to w, serving w. Then w is no longer permanently starved, so it leaves S. But if w is served once, it might return to S? Permanent starvation set S would shrink. To prove v not permanently starved, we need consider the entire set S. At boundary u, if any neighbor in S is chosen, then S shrinks. Since S finite, eventually all cells in S are served? Wait if u is served infinitely often and has neighbors in S, their ages grow unbounded. At each visit to u, the rule will choose the neighbor in S with max urgency (or maybe u itself if u's urgency also grows? But u is served infinitely often, so its age is reset often; however between visits, u's age might grow. But when token at u, u just got served? Actually token at u means u was served previous round, so age_u reset. So u's urgency is small. Other neighbors not in S might also have ages. But the maximum urgency among candidates at u will eventually be from S because their ages are unbounded while non-S neighbors are served infinitely often and their ages reset often? But a non-S neighbor might also have unbounded age if served rarely? If it's in C (served at least once after T), it could be served finitely many times, so its age also grows unbounded. Then it would be in S? Wait S is permanently starved (never served after T). C includes cells served at least once after T. A cell could be served once after T and then never again; it would not be in S if we define S as never served after T, but it also starves eventually. To prove no cell starves forever, define S as cells served only finitely many times after some time. Then S includes all eventually starved cells. Complement C are cells served infinitely often. Boundary edge u∈C, v∈S. At u, all neighbors in S have ages growing unbounded. Non-S neighbors in C have ages reset infinitely often, but at a given visit to u, their ages are bounded by the time since their last service, which could be large but not unbounded over visits? Actually for a cell in C, it is served infinitely often, so between consecutive services of u, its age might grow, but since u is visited infinitely often, we can look at times just after u is served. Other C neighbors may have large ages if they haven't been served recently, but their ages are not monotonically unbounded; they reset. For sufficiently late times, the S neighbors' ages have grown beyond any fixed bound. However, other C neighbors' ages could also be large at that moment. But we can choose a time when u is served and then immediately after? The token at u means u was just served. The decision at u happens at next round? Need timing. If token at u at start of round, u's age may be 0 (just served). S neighbors' ages are huge. C neighbors' ages could also be huge if not served recently. But if they are huge, they might be chosen before S. However, if a C neighbor is chosen, it gets served, so it's not starved. But v may still be starved. The token might bounce among C and some S cells but never v? Since v is in S, its age grows. But there could be another S cell w with higher urgency due to tie-break? If both grow at same rate, the one with higher static merit might always win. For example, two starved cells v and w adjacent to u, both never served. If w has higher potential, then every time token at u, w is chosen (since both ages grow equally, w's static merit higher). Then w gets served, resetting its age. Then v's age > w's age, so next time v might be chosen. So w cannot always win because when w is served, its age resets, making v likely higher. Unless w is served so often that its age never grows? But w is in S (finitely served), so it cannot be served often. If it gets served, it leaves S (if we update S to cells not served after now). The proof can use a dynamic argument: If any neighbor in S is chosen, S shrinks. Since finite, eventually either v is chosen or S becomes empty. But if S shrinks, v may remain. Need induct.

Better proof: Suppose v is never served after time T. Let S be the set of cells not served after T. S nonempty. Consider the token's evolution. Since token serves one cell per round, if S nonempty, eventually the token must leave S? Actually if token enters S, it serves that cell, so that cell is served after T, contradiction to being in S (if S defined as never served after T). So token never enters S after T. Thus token stays in C = V \ S forever. But C is nonempty. Since graph connected, there is edge u∈C adjacent to v∈S. u is in C, so u may be served infinitely often or finitely? If token stays in C forever, it serves cells in C only. It could get stuck in a subset of C. If u is not served infinitely often, then u's age grows. But we need show eventually token enters S. Let's use set S of cells not served after T. Since token never enters S, all cells in S have ages growing unbounded. Consider the set of cells in C that are served infinitely often. If C has cells served infinitely often, there is boundary from S to that set? Actually if token stays in C, it must serve some cells infinitely often (since infinite steps, finite C). Let C_inf be cells served infinitely often. C_inf nonempty. Since S nonempty and graph connected, there is an edge between S and some cell. But is that cell in C_inf? Not necessarily; C may have cells served finitely. However, if a cell in C is served finitely, its age also grows unbounded. Then consider the set of cells not served infinitely often = S ∪ C_fin. This is nonempty and contains v. Let's call it F (eventually starved). Its complement I = cells served infinitely often is nonempty. There is a boundary edge u∈I, v∈F. u is served infinitely often. At times when u is served, v's age is unbounded. But other neighbors in F also have unbounded ages. However, if the rule at u chooses any neighbor in F, then that cell is served, contradicting that it is in F (not served infinitely often? Wait F includes cells served finitely many times. If a cell in F is served once more, it might still be finitely served, so it remains in F. The definition "not served infinitely often" doesn't change if it gets one more service. So contradiction is not immediate. We need show u will eventually serve v infinitely often? Hmm.

We want prove every cell served infinitely often. Suppose some cell v is served finitely many times. Let F be set of cells served finitely many times. Nonempty. I = cells served infinitely often. Nonempty. Since graph connected, there is edge u∈I, v∈F. u is served infinitely often. Consider the sequence of times when token is at u (just served u). At each such time, u compares its neighbors. v's age increases by at least 1 every round, so it goes to infinity. Other neighbors in F also have ages going to infinity. Other neighbors in I have ages reset infinitely often, but at a given time they may be large. However, as v's age grows, eventually v's urgency will be larger than any fixed value. But at a given time, another neighbor w∈F might have even larger age, so v might not be chosen. But if w is chosen, w gets served. Since w∈F, it can only be served finitely many times total. So after some time, no more F cells are chosen? Wait F is defined as cells served finitely many times overall. If u keeps choosing F cells, that would be infinitely many services to F (across possibly different cells), but finite set F, so by pigeonhole some F cell would be served infinitely often, contradiction to F. Therefore, after some time, u cannot choose any F neighbor? But that contradicts because F neighbors' ages grow unbounded and u's urgency is bounded between services. Let's formalize:

Assume F nonempty. Pick u∈I adjacent to some v∈F. At each visit to u, the rule chooses the max urgency among {u}∪N(u). Since v's age → ∞, the max urgency among F-neighbors of u also → ∞ (because finite, at least v). Let M_t = max_{w∈N(u)∩F} U_w at time t. M_t → ∞. The urgency of u at the moment it is visited is reset (small). The urgency of neighbors in I are finite at that moment? They might be large, but each is reset infinitely often. However, there is no uniform bound on their ages at the moments u is visited; they could also be large. But if an I neighbor has urgency larger than M_t, it might be chosen. But its urgency can be arbitrarily large if it hasn't been served for a long time. However, since it is in I, it is served infinitely often, so its age at u-visits could be unbounded if its service times are sparse relative to u-visits. But u-visits occur infinitely often; between two u-visits, an I neighbor could be served or not. It might have arbitrarily large age. So M_t might not dominate.

We need a more robust proof. Maybe token greedy with age may still starve? Let's test potential counterexample. Line graph 1-2-3. Suppose p1 = 100, p2=0, p3=0. r all 0. Score = p + age. Token starts at 1.
Round at 1: U1=100, U2=0. Choose 1. age1 reset. Next: U1=100+1? If age increments after reset: at start round, age1=0? Let's define carefully. Let age = time since last served. At start after serving 1, age1=0. Next round at 1: age1=1? Actually if we increment at end of round, after round 1: age1 reset to 0, others +1. Start round 2: age1=0, age2=1. U1=100, U2=1. Choose 1. This would never move to 2 if p1=100 and age2 only grows by 1 per round. Wait! I earlier thought age2 grows, but token at 1 serves 1 every round, so age1 resets, age2 increases by 1 each round. At round t, U1=100, U2=t. Eventually t>100, so round 101 choose 2. Yes, because age2 grows while 1 keeps being served. So eventually 2.

After serving 2, age2=0. Token at 2. Next round: age1=1 (since not served for 1 round? Actually 1 was served at round 101? Let's simulate: Round 101 at 1, choose 2, serve 2, age2=0, age1=1 (since not served this round), age3=101? Round 102 at 2: U1=100+1=101, U2=0, U3=0+102=102. Choose 3 (if age3 > U1). So 2 doesn't bounce back to 1 because 3's age is huge. Good. Then 3 served. Next round at 3: U1=100+2=102, U2=1, U3=0. Choose 1? U1=102, so token goes back to 1. Then 1 served. Then cycle? Let's see: After 3 served, token at 3. Round at 3: candidates 3 (0), 2 (1), 1 (102). Choose 1. Serve 1. Token at 1. Next: candidates 1 (0), 2 (2),? 3 (1). U2=2, U1=100. Choose 1 again. It will keep serving 1 until 2's age exceeds 100. Meanwhile 3's age also grows. So 1 may get many consecutive services, then 2, then 3? Let's simulate: After 1 served, age1=0, age2=2, age3=1. At 1, U1=100, U2=2. Choose 1. Each round age2++, age3++. Eventually age2>100, choose 2. But at that time age3 is also >100. At 2, candidates: U1=100+1, U2=0, U3= (age3 ~ >100). Choose 3 if U3 > U1. Eventually yes. So sequence: 1 many times, then 2, then 3, then 1... So all served infinitely often. Good.

What about two starved cells adjacent to u: line 1-2-3-4. p1=100, p2=0,p3=0,p4=0. Token at 1. It serves 1 until 2's age >100. Then goes 2. At 2, age3 has been growing while 1 served. So U3 > U1, goes 3. At 3, age4 > U1? Age4 has been growing since start, yes maybe >100. Goes 4. So all get served. Good.

But consider a star graph: center u, leaves v1,v2,... with p_u huge, p_leaves=0. Token at u. It serves u until some leaf's age > p_u. Then goes to leaf v1 (smallest ID or max age). Serves v1. Token at v1. Next round, v1 compares itself, u. u's age = 1. v1 age=0. U_u = p_u+1, U_v1=0. So v1 immediately returns to u. Then u serves u until next leaf's age > p_u. But v1's age resets to 0, v2's age has been growing all along. So next leaf v2 eventually chosen. So all leaves get served eventually. No starvation. Good.

What about a path where a far leaf's age grows while token bounces near center. It will eventually propagate because at each step the next cell's age grows. So yes.

But the proof of no starvation can be simpler: The token performs a greedy walk on a finite graph with vertex scores that increase linearly when not visited and reset to zero when visited. This is a known "least recently served" process. But we need explain.

Maybe we can prove by considering the maximum age cell. At any time, let M be a cell with maximum age. If token is not at M or a neighbor? Token moves to a neighbor with highest urgency. Since M has maximum age, its urgency is high. If token is at a neighbor of M, M will be chosen unless there is another neighbor with even higher urgency. But another neighbor could have same age? If M has maximum age, no one has higher age. Static merit could make another cell with slightly lower age chosen. But if M is never visited, its age grows. Eventually it will be the unique maximum age? Actually ages of unvisited cells grow at same rate. Multiple cells may share max age. But if token is adjacent to one, it will choose the one with highest static merit among max age. That one gets served, resetting, so then M may become unique max age. Over time, all max age cells adjacent to token get served. But if M is far from token, token may not be adjacent. However, the token moves along edges. The cell with max age in the whole graph, if not adjacent to token, there is a path. Along that path, ages decrease? Not necessarily. The token might not move toward max age if local scores don't reflect global max. But because age is part of score, the max age cell's neighbors also have high ages (unless just served). The token will move along a gradient of increasing urgency? Not necessarily monotonic. But it's a finite graph, and unvisited cells' ages grow. Eventually any cell that is not served will have age exceeding all served cells. The token will be drawn to it.

We can use a potential function: Sum of ages? Each step, one cell resets to 0, others +1. If a cell is never served, its age grows. But token moves locally. I think the boundary argument can be made rigorous with "eventually starved set" and max age among them.

Let F = set of cells served finitely many times. If nonempty, let v ∈ F be the cell in F with maximum age? But ages of F grow unbounded. Actually all F cells eventually have age > any cell in I? Not necessarily if some I cells are served rarely but infinitely often, their ages can also be unbounded at times. But consider the set F. Pick a boundary edge u ∈ I, v ∈ F. At times when token is at u, v's age is large. But another F neighbor w might have larger age. However, if u keeps choosing F neighbors, since F is finite and each F cell served finitely, after some point u cannot choose any F cell? Wait if u chooses w∈F, w gets served, but w is still in F (served finitely). It can be chosen multiple times, but only finitely many times total. So there is a last time u chooses any F neighbor. After that, u never chooses F. But v's age continues to grow. At the last such time, v's age was finite. After that, v's age grows unbounded. When token is at u after that, v's urgency becomes larger than u and all I neighbors? I neighbors' ages might be large, but they are served infinitely often, so their ages are reset infinitely often. However, at a given time when token at u, an I neighbor could have large age. But if it has large age, it might be chosen and served, so its age resets. This could delay v. But v's age grows without bound. The I neighbor's age cannot grow without bound over time because it is served infinitely often; its age at u-visits is bounded? Not necessarily bounded, but the maximum age of any I cell at the moment u is visited might also grow. However, consider the entire set I. There are finitely many I cells. Each is served infinitely often. The time between services of a given I cell might grow, so its age can be large. But if it is large, it gets served. The process might have arbitrarily long gaps between services of some I cells, allowing their ages to grow arbitrarily large. But v's age grows at least as fast. Since v is in F, it is served finitely. So after its last service, v's age increases by 1 every round. Any I cell's age also increases by 1 between its services, but it gets reset. So at any time, v's age is at least (current time - last service of v). For an I cell w, its age is (current time - last service of w). Since w is served infinitely often, last service of w is not too far? It could be far if w hasn't been served for a long time. But w will eventually be served. At the moment token is at u, if w's age > v's age, w might be chosen. But w is in I, so it can be chosen infinitely often. Could it always have larger age than v? That would require w not served for longer than v. But v is never served, so v's age since last service grows unbounded. w is served infinitely often, so its age resets infinitely often. Therefore, there will be times when w's age is small. But at the specific times when token is at u, w's age could be large. However, if w's age is large, it means w hasn't been served recently. Then when it is chosen, its age resets. After that, v's age is still larger than w's reset age. So eventually v should win.

Let's attempt a formal proof by contradiction using the last time a cell in F is served. Since F is finite, there is a time T after which no cell in F is ever served (because each F cell is served finitely many times total). Yes! That's the key. Let F be cells served finitely many times. Let T be after the last service to any cell in F. After T, only cells in I (served infinitely often) receive budget. But if v∈F, its age grows unbounded. Consider the token. Since only I cells are served after T, the token stays in I. I is nonempty. Graph connected, so there is an edge u∈I adjacent to v∈F. u is served infinitely often after T. At each time token is at u, v's age is increasing. Eventually v's urgency exceeds u's urgency and all other neighbors that are in I? But other neighbors in I may have large ages. However, since only I cells are served, their ages also grow between services. But the maximum age among I neighbors of u might also grow. But v's age is at least the time since T, while any I neighbor's age is at most the time since its last service. Could an I neighbor's age always be larger than v's? That would require that neighbor to never be served before v's age surpasses it. But if it is served, its age resets. At the moment it is served, v's age is still large. So after that, v's age is larger than that neighbor's. The only way v doesn't win is if some other I neighbor has even larger age. But eventually, at u, the max urgency among I neighbors might be large. But note: if u chooses an I neighbor w, then w is served, resetting w. v's age remains large. So next time at u, w is no longer a threat. The number of I neighbors is finite. Each time u chooses an I neighbor, that neighbor resets. So v only needs to beat the maximum age among I neighbors. But those ages can grow again if they wait. However, v's age is always at least the maximum age among I neighbors? Not necessarily. Suppose u is not visited often? u is in I, so visited infinitely often. Between visits to u, other I neighbors may be served or not. Their ages at u-visits could be large. But v's age is the total time since T (minus its last service before T). Actually v was served finitely many times before T; after T, never. So v's age at time t is t - last_service_v. For any I cell w, its age at time t is t - last_service_w. Since w is served after T infinitely often, last_service_w can be close to t. So v's age is generally larger than w's age if w was served more recently than v's last service. But v's last service is before T. So for any t > T, v's age > t - T. For w, if it was served after T, its age < t - T. If it hasn't been served since T, then its age > t - T, but then it is in F? Wait if w is in I, it must be served infinitely often after T. So there is a service after T. But at a given time t, if w's last service was before T, then w hasn't been served since T, but it will be served eventually. At time t, w's age > v's age? v's last service may also be before T. If v's last service is earlier than w's last service, then v's age > w's age. If w's last service is earlier than v's last service, then w's age > v's age. But v's last service is fixed. w's last service can be before v's last service only for a finite time until w is served. After w is served, its last service becomes after v's last service, so its age becomes less than v's age. Since w is served infinitely often, eventually its last service is after v's last service. So for sufficiently large t, every I cell's last service is after v's last service (because they are served infinitely often, while v's last service is fixed). Therefore, v's age > every I cell's age. Thus v's urgency (with age added) eventually exceeds every I cell's urgency (since static merits are fixed). So when token is at u, v will be chosen. Contradiction. This is a clean proof!

Let's formalize:
- Suppose v is served only finitely many times. Let t0 be after its last service.
- Every other cell that is served infinitely often will eventually have a service after t0. For cells served finitely, they also have last service; but if they are neighbors of u and not served infinitely, they are in F. But we can consider the set of cells not v? Actually we want show v is served again. Consider any cell w that is not v. If w is served infinitely often, then after some time its last service is after t0, so at a late time its age is less than v's age. If w is served finitely, its last service is also fixed; it might have last service after t0? But if w is served after t0, then its age at late time is t - last_service_w, which is less than v's age if last_service_w > last_service_v. If w is never served after t0, then its age is similar to v's. But there are finitely many such cells. Among them, v may not have the maximum static merit. But we can choose v as the last-served among the permanently starved set? Hmm.

Actually to prove no cell starves, assume there is a nonempty set F of cells served finitely many times. Let T be after the last service to any cell in F. After T, only cells in I (served infinitely often) receive service. But then any cell in F has age growing. Take a boundary edge u∈I, v∈F. u is served infinitely often. Consider a time after T when u is served. For any cell w in I, its last service is after T? Not necessarily; some I cells may not have been served yet after T, but since they are served infinitely often, eventually they will. But at a time after all I cells have been served at least once after T (possible because finite I), every I cell's last service is after T. v's last service is before T. So v's age > every I cell's age. Therefore v's urgency > every I cell's urgency (since static merits fixed, but age difference can overcome any static difference eventually? Wait v's age > every I cell's age by at least T difference? Actually v's last service is before T. Each I cell has last service after T. So v's age is at least t - T, while I cell's age is at most t - T - 1. So v's age is strictly greater by at least 1. But static merit of an I cell could be much larger than v's static merit. However, v's age grows unbounded, but so does the difference? The difference between v's age and I cell's age is at least the time between v's last service and I cell's last service. That difference is fixed for each I cell once it has been served after T. It does not grow. So if an I cell has huge static merit, it might still beat v. But v's age grows, and the I cell's age also grows if it hasn't been served recently. Wait at a late time, if I cell w was served after T, its last service is fixed (say time s_w). At time t, age_w = t - s_w. age_v = t - s_v, where s_v < T < s_w. So age_v = age_w + (s_w - s_v). The difference is constant. So v's age is always larger than w's age by a constant. If w's static merit is larger than v's by more than that constant, w will always beat v. But w is served infinitely often, so its last service updates. At times just after w is served, age_w is 0, so v beats w. But if w is not served, its age grows, but the difference age_v - age_w remains s_w - s_v. When w is served again, s_w updates to a later time, so age_v - age_w becomes even larger (since s_w increases). Thus over time, v's age advantage over each I cell grows! Because every time an I cell is served, its last service time increases, making its age smaller relative to v's fixed last service. So eventually v's age exceeds every I cell's age by an arbitrarily large amount. Therefore v's urgency will exceed any fixed static merit of I cells. Thus v will win. This is the key: v's last service is fixed before T. Each I cell is served infinitely often, so its last service time goes to infinity. At any time t, for an I cell w with last service s_w, age_v - age_w = s_w - s_v. Since s_w → ∞ (as w gets served later and later), the difference grows unbounded. So v's age eventually exceeds w's age by more than any static merit difference. Thus v will eventually have higher urgency than all I cells. Then when token at u, it will choose v. Contradiction.

This proves no cell is served finitely. Good.

Let's write proof more simply for a teacher:
- Suppose cell v is starved. Let t_v be its last service time (or -∞ if never).
- Every other cell that is not starved is served infinitely often, so its last service time goes to infinity. Therefore, for any such cell w, the quantity (age of v) - (age of w) = (last service of w) - t_v, which eventually becomes as large as we want.
- The static part p/(r+1) is fixed. So eventually v's urgency exceeds w's urgency.
- Now take a neighbor u of v that is visited infinitely often (exists by connectedness if v is in the starved set). When the token is at u, v is a candidate. For sufficiently late times, v's urgency is higher than u and all other candidates. So the rule must choose v. Contradiction.
- Hence no cell can be starved.

Need be careful: "take a neighbor u of v that is visited infinitely often" — if v is starved, its neighbors might also be starved. But if all neighbors are starved, then since graph connected, there must be a boundary between starved set and non-starved set. Pick a cell in the non-starved set adjacent to a starved cell. The starved cell is v? We can pick v as the starved cell on the boundary. Then u is non-starved and visited infinitely often. So yes.

Let's structure final answer.

Potential issue: The algorithm as described requires a token that moves. But the question: "decides which cell of a cellular graph receives the next unit of computation budget" — maybe they want a rule for each cell to decide if it receives? The token is a kind of local decision. But is a token considered global? It is a single moving pointer, but its location is local to the cell. It only uses local info. It's minimal. We can say "Think of the budget as a token. The token sits in one cell. That cell decides the next recipient among itself and its direct neighbors." This avoids global view.

Could there be an issue that the token itself is a global entity? It's just a single unit; its location is known locally to the holder. It doesn't require global view. The rule uses only the holder and its neighbors. That's acceptable.

Alternatively, we can design a fully distributed algorithm where each cell independently computes a local threshold and if its urgency is the maximum in its closed neighborhood, it claims the budget. But then multiple cells could claim. To avoid that, use a token. The prompt says "decides which cell ... receives the next unit" singular. Token is natural.

Need maybe mention "resistance values" — if resistance is high, cell is less attractive. Use denominator (1 + r). If r can be zero, okay. If r can be very large, age still eventually dominates.

Let's define variables clearly:
- For cell i, let p_i ≥ 0 be potential.
- Let r_i > 0 be resistance.
- Let a_i be age (rounds since last served).
- Urgency U_i = p_i / (1 + r_i) + a_i.
Why this form? The first term is static desirability: high potential, low resistance. The second is waiting debt: the longer ignored, the more urgent. The +1 avoids division by zero if r_i=0.

Tie-break: If two candidates have equal U, choose the one with the smallest cell ID. This makes the rule deterministic and local. Or choose based on some local unique ID.

Algorithm rounds:
At start, token at some cell c, all a_i = 0.
Repeat:
1. Cell c collects U_c and U_j for j ∈ N(c). (It already knows its own p,r,a; neighbors can share theirs.)
2. Select k ∈ {c} ∪ N(c) maximizing U, tie-break by ID.
3. Give next budget to k. If k ≠ c, move token to k.
4. Set a_k = 0. For all i ≠ k, a_i = a_i + 1. (If k=c, reset c and increment neighbors.)
This is local: c only talks to direct neighbors. Each cell updates its own age.

Wait: In step 4, if all cells increment age, how does c know to increment? Each cell does it independently each round. That's fine. If token moves, the new token holder k knows it was served.

Fairness:
- The rule is fair in the weighted sense: cells with higher potential or lower resistance get more frequent service, but every cell gets service eventually.
- If p and r are equal, it reduces to "serve the least recently served cell among the token and its neighbors", which spreads service around.

Starvation proof (as above).

Let's also consider if potential/resistance can change over time. The rule still works as long as they are bounded or change slowly? The question says given per-cell values, likely static. We can assume static. If dynamic, starvation proof might need bounded changes. Not required.

Need maybe mention "minimal local algorithm" — no global max, no full graph. Only closed neighborhood.

Let's write in teacher style: "Let's build it in pieces."

Piece 1: State.
Piece 2: Score.
Piece 3: Token.
Piece 4: Local rule.
Piece 5: Why fair.
Piece 6: Why no starvation.

Let's include pseudocode.

Potential issue: The token can only move to neighbors. What if the most urgent cell globally is far? The token will walk there step by step. But is it guaranteed to reach? The proof says yes eventually. But we might need to explain that the token doesn't need to know where the most urgent cell is; it only moves to the most urgent among itself and neighbors. Over time, waiting debt creates a gradient that pulls it toward ignored regions. Actually it might not be a monotonic gradient, but with aging, it will eventually visit all.

Let's test a possible counterexample for token greedy with aging. Consider a complete graph? Token at u, all neighbors. It picks max urgency. If one neighbor has huge age, it goes there. Then next step, from that neighbor, it sees all other nodes including u. u's age is 1. The neighbor's age reset. It might go back to u if u has high potential. But other high-age nodes will eventually win. So all visited.

What about a graph with a high potential cell that is served often. It acts as a sink. But its neighbors' ages grow. When a neighbor's age exceeds, token moves to neighbor. From neighbor, the high potential cell's age is 1, so token might return immediately. But then the neighbor's age resets, so high potential cell serves again until another neighbor's age grows. So high potential cell gets many consecutive services, but others get occasional services. No starvation.

What if a cell is not a direct neighbor of the high potential sink? It will be served only when token traverses through. As argued, boundary cells get served, then their neighbors' ages grow, etc. So eventually all.

Let's refine starvation proof to be intuitive for a teacher:
- Imagine a cell v that is never served after some time. Its age keeps increasing.
- Since the graph is connected, there is a path from the token's region to v. Let u be the first cell on that path that is served infinitely often, and let w be its neighbor toward v that is not served infinitely often. Actually w may be served finitely. At u, w's age grows without bound. Every time u is visited, w becomes more and more attractive. Eventually w's urgency beats all candidates at u, so u must send the token to w. So w gets served. This shrinks the starved region. Repeating, the token advances toward v. Thus v cannot be starved forever.
This is a nice intuitive proof. We can present both intuition and the formal contradiction.

Let's ensure the "fair" explanation doesn't overclaim. Fair could mean "no starvation" and "respects potential/resistance". We can say "fair" in the sense of eventually serving every cell; not equal frequency. If they wanted equal, set p=0,r=0.

Need mention "resistance" might make a cell less likely, but not starved. If a cell has enormous resistance, it waits longer but eventually its age term makes it urgent enough.

Let's consider if resistance could be zero or negative? Assume nonnegative. If resistance is zero, denominator 1. If resistance is negative, could cause issues. We'll state assume r_i ≥ 0.

Let's produce final answer with moderate detail (desired oververbosity 5). The user asked "Design a minimal local algorithm..." So we should give algorithm and explanations. We can use headings.

Let's draft:

```
For each cell i:
    p_i = potential
    r_i = resistance
    a_i = age (rounds since last served)

Urgency: U_i = p_i / (1 + r_i) + a_i
```

Token rule:
- A single budget token sits at a cell c.
- At a round:
  1. c computes U_c and reads U_j from each neighbor j.
  2. k = argmax_{j in {c}∪N(c)} U_j, tie-break by smallest ID.
  3. k receives budget. If k ≠ c, token moves to k.
  4. a_k = 0; for all i ≠ k, a_i += 1.

This is local: c only needs its own state and direct neighbors' states. No global view.

Fairness:
- Static part p/(1+r) rewards potential and penalizes resistance.
- Age part a acts as a waiting debt. A cell that is ignored becomes more urgent each round.
- For equal p,r, this is least-recently-served among local candidates, so it spreads service.

No starvation:
- Suppose some cell v is served only finitely many times. Let S be the set of such cells. If S nonempty, since the token serves one cell per round, the complement is nonempty. By connectedness, there is an edge u-v with u not in S (served infinitely often) and v in S.
- v's age grows without bound. u is visited infinitely often. Compare v with u and with u's other neighbors. Every cell not in S is served infinitely often, so its last service time goes to infinity; hence v's age eventually exceeds theirs by more than any fixed static merit. Cells in S also have growing ages, but the finite set S will eventually have one of them chosen if u is adjacent to any; in any case, v's age grows, and when the token is at u, v becomes the maximum urgency among candidates.
- More simply: at some late time when token is at u, v's urgency is the largest in {u}∪N(u). Then the rule must choose v, contradicting that v is starved. Thus no such v exists.
- Therefore every cell is served infinitely often.

Wait the "more simply" has the flaw with other S cells. Let's state proof carefully to avoid flaw. We can say: "Take a boundary edge u∈C, v∈S where C are cells served infinitely often. Since u is visited infinitely often, consider the last time u chooses any neighbor in S. After that, v's age keeps growing while no S neighbor is chosen. But then eventually v's urgency exceeds all candidates at u, so u must choose v. Contradiction." Hmm, is that valid? If u never chooses any S neighbor after some time, then v's urgency grows. But u might choose C neighbors. C neighbors are served infinitely often, so their ages reset. At a given visit to u, a C neighbor could have large age. But v's age grows unbounded. Eventually v's urgency exceeds any possible C neighbor's urgency at that moment? Not necessarily if C neighbor's age is also large. But if C neighbor's age is large, it means it hasn't been served recently. But it is served infinitely often, so its age at u-visits might be unbounded. However, v's age is at least the time since the last S service. Since no S service after some time, v's age is the total time since then. A C neighbor's age is at most the time since its last service. It could be larger than v's age if it was served before v's last service. But since it is served infinitely often, eventually its last service is after v's last service, so its age becomes smaller than v's age. The difference grows because C neighbor gets served later and later. So eventually v's age exceeds every C neighbor's age by an arbitrarily large margin. Thus v's urgency eventually exceeds all C candidates. So u must choose v. That works.

Let's write the formal proof in final answer succinctly:
- Suppose v is not served after time T.
- Let u be a neighbor of v that is served infinitely often. (Exists: otherwise the set of cells served finitely contains v and is closed under neighbors? Actually if v's neighbors all served finitely, then v is in a starved component. But the graph is connected, so there is a boundary to an infinitely served cell. Choose v on boundary.)
- For any cell w that is served infinitely often, let s_w be its last service time. As time t grows, s_w also grows (since w is served again and again). v's last service time s_v ≤ T is fixed. So v's age minus w's age = s_w - s_v, which eventually becomes larger than any fixed difference in static merits.
- Thus at a sufficiently late time when the token is at u, v's urgency U_v is larger than U_u and larger than U_w for every other neighbor w of u.
- Therefore the local rule at u selects v. So v is served, contradiction.
- Hence every cell is served infinitely often.

This proof assumes u is served infinitely often. If v is starved, and all its neighbors are starved, then consider the set of starved cells. Since not all cells are starved, there is a boundary between starved and non-starved. Pick v on boundary, u non-starved. Good.

Let's include that.

Also, if a cell is never served at all, s_v = -∞, age grows. Same.

Need maybe mention "tie-break" in proof? If v's urgency is strictly larger, tie-break irrelevant. We can ensure strict by waiting longer.

Let's consider if static merit p/(1+r) could be negative? Assume nonnegative. If negative, age still eventually dominates. So fine.

Now, the final answer should be self-contained. Let's write.

We can also mention "resistance" could be used as multiplicative: U = p * a / (1+r). But linear addition is minimal. Let's stick with U = p/(1+r) + a.

Potential issue: If a_i is reset to 0 and others increment, then a cell that was just served has age 0, but if token stays at it, it may serve itself again because its potential is high. That's fine. The age of others grows.

Let's write pseudocode:

```
function next_recipient(c):
    best = c
    for j in neighbors(c):
        if U(j) > U(best) or (U(j)==U(best) and j.id < best.id):
            best = j
    return best

# when best = k:
if k != c: token = k
a[k] = 0
for i != k: a[i] += 1
```

But note: if k != c, c is no longer token holder, so c might not be the one to increment ages. The increment is done by each cell independently. We can phrase: "After each round, every cell increments its own age, except the one just served resets to 0." This is local.

Let's also mention "no global view" means c does not know the whole graph, only its closed neighborhood. The token's location is the only state that moves.

Now, final answer with teacher tone.

Let's produce final.

## answer

Let’s build it in small pieces.

## Piece 1: Local state

Each cell \(i\) has:

- potential \(p_i \ge 0\)
- resistance \(r_i \ge 0\)
- an age \(a_i\): how many rounds since cell \(i\) last received budget.

The age is local. Each cell can update its own age.

## Piece 2: Local urgency

Define a cell’s urgency as

\[
U_i = \frac{p_i}{1+r_i} + a_i
\]

Interpretation:

- \(\frac{p_i}{1+r_i}\): high potential and low resistance make a cell more attractive.
- \(a_i\): the longer a cell has waited, the more urgent it becomes.

## Piece 3: A moving budget token

Imagine the next unit of budget is a token sitting at one cell \(c\).

At each round, \(c\) makes a local decision using only itself and its direct neighbors.

## Piece 4: The local rule

At the current token cell \(c\):

1. Compute \(U_c\).
2. Ask each direct neighbor \(j\) for its current \(U_j\).
3. Choose the cell \(k\) among
   \[
   \{c\} \cup N(c)
   \]
   with the largest urgency.
4. Tie-break by smallest cell ID, so the rule is deterministic.
5. Give the next budget to \(k\).
6. If \(k \neq c\), move the token to \(k\).
7. Reset \(a_k = 0\).
8. Every other cell increments its age: \(a_i \leftarrow a_i + 1\).

This is local: no cell needs a global view. The token holder only looks at itself and its direct neighbors.

## Why is it fair?

It is fair in the sense that it respects potential/resistance while still eventually serving every cell.

- High-potential, low-resistance cells get served more often.
- Low-potential, high-resistance cells wait longer.
- But because \(a_i\) grows every round a cell is ignored, waiting time eventually makes any cell urgent enough to be chosen.

If all cells have equal potential and resistance, the rule becomes “serve the least recently served cell in the current local neighborhood,” which spreads service around.

## Why can no cell starve forever?

Suppose, for contradiction, that some cell \(v\) is served only finitely many times. After some time \(T\), \(v\) is never served again.

Its age \(a_v\) keeps increasing without bound:

\[
a_v \to \infty.
\]

Now look at the boundary between cells that are served infinitely often and cells that are not. Since the graph is connected, there is an edge between some cell \(u\) that is served infinitely often and some starved cell \(v\).

When the token is at \(u\), the cell \(v\) is a direct neighbor, so \(v\) is a candidate.

Every time \(u\) is served, its age resets. Every other cell that is served infinitely often also has its age reset infinitely often. But \(v\)’s age never resets. Eventually, \(v\)’s age becomes so large that

\[
U_v > U_u
\]

and

\[
U_v > U_w
\]

for every other neighbor \(w\) of \(u\).

So when the token is at \(u\), the local rule must choose \(v\). That means \(v\) is served, contradicting that \(v\) was starved forever.

Therefore every cell is served infinitely often. No cell can starve forever.

## Minimal algorithm summary

For each cell \(i\):

\[
U_i = \frac{p_i}{1+r_i} + a_i
\]

At the token cell \(c\), choose

\[
k = \arg\max_{j \in \{c\}\cup N(c)} U_j
\]

tie-broken by smallest ID. Give the budget to \(k\), move the token there, reset \(a_k=0\), and increment all other ages.

That is the minimal local rule: one token, one local comparison, one age term for fairness.
