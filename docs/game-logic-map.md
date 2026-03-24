# Game Logic Map

## Overview

The Choice is a linear moral dilemma game with 6 scenario stages. Each stage presents binary choices that update four philosophical scoring axes. At the end, scores determine three prediction outcomes (science, society, art) and a final moral profile quadrant.

## Scoring Axes

| Variable | Philosophy | Incremented When Player... |
|----------|-----------|---------------------------|
| `U` | Utilitarianism / Consequentialism | Chooses outcomes-based reasoning |
| `D` | Deontology | Chooses duty/rules-based reasoning |
| `L` | Libertarianism | Prioritizes individual freedom |
| `S` | Social Contract | Prioritizes collective agreements |

All start at `0`. Choices throughout the game increment these by `+1` or `+2`.

---

## Stage-by-Stage Logic

### Stage 0: Language Selection

```
Start → player clicks English or Russian
  → $Lang = "en" | "ru"
  → routes to English or Russian branch
```

All subsequent logic is identical between branches; Russian passages have an `ru` suffix.

### Stage 1: Trolley Problem (Optional Tutorial)

The player may choose to do the trolley tutorial or skip directly to the yacht scenario.

**Trolley Choice 1** — Classic trolley problem: pull the lever?
- Pull the lever → `$trolley1 = "pull"`, `$U += 1`
- Don't pull → `$trolley1 = "stay"`, `$D += 1`

**Trolley Choice 2** — Fat man variant: push the man?
- Push → `$trolley2 = "push"`, `$U += 1`
- Don't push → `$trolley2 = "stay"`, `$D += 1`

After tutorial (or skip) → `tutorial_complete` event → proceed to Yacht.

### Stage 2: Yacht / Rezeda Scenario (19th Century Survival)

A survival-at-sea scenario inspired by the real case of the Mignonette. The crew faces starvation.

**Yacht Choice 1** — Agree to cannibalism to survive?
- Agree (eat the cabin boy) → `$yacht1 = "agree"`, `$U += 2`
- Refuse → `$yacht1 = "refuse"`, `$D += 2`

**Yacht Choice 2** — Should the survivors be punished?
- No punishment (they survived) → `$yacht2 = "no"`, `$U += 1`
- Yes punishment (murder is wrong) → `$yacht2 = "yes"`, `$D += 1`

After completion → `$dot1Color = "green"` → moral reflection passages → `stage1_complete` event → `$dot2Color = "green"`.

### Stage 3: Factory Scenario (Ford Pinto Dilemma)

A cost-benefit analysis dilemma: fix a known lethal defect at high cost, or accept statistical deaths?

**Factory Choice 1** — Recall the cars (high cost) or accept the risk?
- Accept risk (cost-benefit) → `$factory1 = "accept"`, `$U += 2`
- Recall (protect lives) → `$factory1 = "recall"`, `$D += 2`

**Factory Choice 2** — Should the executive be punished?
- No (rational decision) → `$factory2 = "no"`, `$U += 1`
- Yes (negligent homicide) → `$factory2 = "yes"`, `$D += 1`

After completion → `stage2_complete` event → `$dot3Color = "green"`.

### Stage 4: Deontology — Lying Scenarios (Kant)

Exploring Kant's categorical imperative through scenarios about lying.

**Lies Choice 1** — Is it ever okay to lie?
- Yes (consequences matter) → `$lies1 = "yes"`, `$U += 1`
- No (lying is always wrong) → `$lies1 = "no"`, `$D += 1`

**Lies Choice 2** — Lie to a murderer to save a friend?
- Lie (save the friend) → `$lies2 = "lie"`, `$U += 1`, `$S += 1`
- Tell truth (duty) → `$lies2 = "truth"`, `$D += 1`, `$L += 1`

After completion → `stage3_complete` event → `$dot4Color = "green"`.

### Stage 5: Libertarian — Taxation & Rights

Individual rights vs collective responsibility.

**Liberty Choice 1** — Should taxation be mandatory?
- No (taxation is theft) → `$liberty1 = "no"`, `$L += 2`
- Yes (social responsibility) → `$liberty1 = "yes"`, `$S += 2`

**Liberty Choice 2** — Mandatory charity or voluntary?
- Voluntary only → `$liberty2 = "voluntary"`, `$L += 2`
- Mandatory (society needs it) → `$liberty2 = "mandatory"`, `$S += 2`

After completion → `stage4_complete` event → `$dot5Color = "green"`.

### Stage 6: Privacy — Surveillance & Torture

Individual privacy vs collective security.

**Privacy Choice 1** — Mass surveillance to prevent terrorism?
- Yes (security first) → `$privacy1 = "yes"`, `$S += 2`
- No (privacy is sacred) → `$privacy1 = "no"`, `$L += 2`

**Privacy Choice 2** — Torture one person to save many?
- Yes (the math works) → `$privacy2 = "yes"`, `$U += 1`, `$S += 1`
- No (inherent rights) → `$privacy2 = "no"`, `$D += 1`, `$L += 1`

After completion → `stage5_complete` event.

---

## Result Computation

Computed at the end of the privacy stage (passage `privacy9` / `privacyru9`):

### Science Prediction

```
if U < 3  → science = 0  (poor)
if U > 5  → science = 2  (good)
else      → science = 1  (average)
```

### Society Prediction

```
if L > 5  → society = 0  (poor)
if S > 5  → society = 2  (good)
else      → society = 1  (average)
```

### Art Prediction

```
if U > 4  → art = 0  (poor)
if D > 5  → art = 2  (good)
else      → art = 1  (average)
```

### Result Routing

**Science routing** (from `endgame2` / `endgameru2`):
```
if U < 2  → sciencepoor
if U > 5  → sciencegood
else      → scienceaverage
```

**Society routing** (from science result passages):
```
if L > 5  → societypoor
if S > 6  → societygood
else      → societyaverage
```

**Art routing** (from society result passages):
```
if U > 5  → artpoor
if D > 6  → artgood
else      → artaverage
```

---

## Final Moral Profile

Computed in `endgame3` / `endgameru3`:

```
if U >= D AND L >= S → "Consequentialism + Libertarianism"
if U < D  AND L < S  → "Deontology + Social Contract"
if U < D  AND L >= S → "Deontology + Libertarianism"
else (U >= D, L < S) → "Consequentialism + Social Contract"
```

### Moral Profile Graph

The result is plotted on a 2D graph:

```
X axis: Deontology (left, 0%) ←→ Consequentialism (right, 100%)
Y axis: Social Contract (top, 0%) ←→ Libertarianism (bottom, 100%)

xRatio = (U + D == 0) ? 0.5 : U / (U + D)
yRatio = (L + S == 0) ? 0.5 : L / (L + S)

xPercentage = xRatio * 100
yPercentage = yRatio * 100
```

The dot is placed at `(xPercentage, yPercentage)` on the graph, showing the player's philosophical position.

---

## Progress Dot Updates

| Dot | Turns Green When | Event Fired |
|-----|-----------------|-------------|
| dot1 | Player enters yacht scenario | — |
| dot2 | Yacht + moral section complete | `stage1_complete` |
| dot3 | Factory section complete | `stage2_complete` |
| dot4 | Deontology section complete | `stage3_complete` |
| dot5 | Libertarian section complete OR final calculation | `stage4_complete` |

---

## Important Edge Cases

1. **Trolley is optional** — players can skip directly to yacht. If skipped, `$trolley1` and `$trolley2` remain `"no"` and no U/D points are added from that section.
2. **Score ties** — `U >= D` uses greater-than-or-equal, so ties favor consequentialism/libertarianism.
3. **Zero scores** — if both axes are 0, graph ratio defaults to `0.5` (center).
4. **Result thresholds differ** — the computation thresholds (`privacy9`) and routing thresholds (`endgame2`, science/society/art passages) use slightly different cutoff values.
