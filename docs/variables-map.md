# Variables Map

## Scoring Variables

| Variable | Type | Init | Description | Updated In | Read In |
|----------|------|------|-------------|-----------|---------|
| `$U` | number | `0` | Utilitarianism / Consequentialism score | trolley, yacht, factory, lies, privacy choices | privacy9, endgame2, endgame3, graph calc, sheets submission |
| `$D` | number | `0` | Deontology score | trolley, yacht, factory, lies, privacy choices | privacy9, endgame3, graph calc, sheets submission |
| `$L` | number | `0` | Libertarianism score | lies, liberty, privacy choices | privacy9, endgame3, society routing, graph calc, sheets submission |
| `$S` | number | `0` | Social Contract score | lies, liberty, privacy choices | privacy9, endgame3, society routing, graph calc, sheets submission |

### Score Increments by Passage

| Passage | Choice A | Score Change | Choice B | Score Change |
|---------|----------|-------------|----------|-------------|
| Trolley 1 | Pull lever | U+1 | Don't pull | D+1 |
| Trolley 2 | Push man | U+1 | Don't push | D+1 |
| Yacht 1 | Agree (eat) | U+2 | Refuse | D+2 |
| Yacht 2 | No punishment | U+1 | Yes punishment | D+1 |
| Factory 1 | Accept risk | U+2 | Recall | D+2 |
| Factory 2 | No punishment | U+1 | Yes punishment | D+1 |
| Lies 1 | Yes (okay to lie) | U+1 | No (never lie) | D+1 |
| Lies 2 | Lie (save friend) | U+1, S+1 | Truth (duty) | D+1, L+1 |
| Liberty 1 | No tax | L+2 | Yes tax | S+2 |
| Liberty 2 | Voluntary | L+2 | Mandatory | S+2 |
| Privacy 1 | Yes surveillance | S+2 | No surveillance | L+2 |
| Privacy 2 | Yes torture | U+1, S+1 | No torture | D+1, L+1 |

### Maximum Possible Scores

| Variable | Max | From |
|----------|-----|------|
| U | 10 | trolley(2) + yacht(3) + factory(3) + lies(2) + privacy(1) — but depends on which choices, actual max ~8 |
| D | 10 | same distribution mirrored |
| L | 7 | lies(1) + liberty(4) + privacy(3) — actual max ~7 |
| S | 7 | lies(1) + liberty(4) + privacy(3) — actual max ~7 |

Note: U and D are mutually exclusive per choice (picking one means not picking the other). Same for L and S. The theoretical max for U is if every U-incrementing choice is selected.

---

## Per-Choice Tracking Variables

These record which option the player selected, used for the Google Sheets submission.

| Variable | Type | Init | Possible Values | Set In |
|----------|------|------|----------------|--------|
| `$trolley1` | string | `"no"` | `"no"`, `"pull"`, `"stay"` | Trolley choice 1 |
| `$trolley2` | string | `"no"` | `"no"`, `"push"`, `"stay"` | Trolley choice 2 |
| `$yacht1` | string | `"no"` | `"no"`, `"agree"`, `"refuse"` | Yacht choice 1 |
| `$yacht2` | string | `"no"` | `"no"`, `"no_punish"`, `"yes_punish"` | Yacht choice 2 |
| `$factory1` | string | `"no"` | `"no"`, `"accept"`, `"recall"` | Factory choice 1 |
| `$factory2` | string | `"no"` | `"no"`, `"no_punish"`, `"yes_punish"` | Factory choice 2 |
| `$lies1` | string | `"no"` | `"no"`, `"yes"`, `"no_lie"` | Lies choice 1 |
| `$lies2` | string | `"no"` | `"no"`, `"lie"`, `"truth"` | Lies choice 2 |
| `$liberty1` | string | `"no"` | `"no"`, `"no_tax"`, `"yes_tax"` | Liberty choice 1 |
| `$liberty2` | string | `"no"` | `"no"`, `"voluntary"`, `"mandatory"` | Liberty choice 2 |
| `$privacy1` | string | `"no"` | `"no"`, `"yes_surv"`, `"no_surv"` | Privacy choice 1 |
| `$privacy2` | string | `"no"` | `"no"`, `"yes_torture"`, `"no_torture"` | Privacy choice 2 |

Note: `"no"` is the default — it means the player hasn't reached that choice yet (or skipped the trolley section).

---

## Result Variables

| Variable | Type | Init | Values | Computed In | Read In |
|----------|------|------|--------|------------|---------|
| `$science` | number | `0` | `0` (poor), `1` (average), `2` (good) | privacy9 / privacyru9 | endgame2, sheets submission |
| `$society` | number | `0` | `0` (poor), `1` (average), `2` (good) | privacy9 / privacyru9 | science passages, sheets submission |
| `$art` | number | `0` | `0` (poor), `1` (average), `2` (good) | privacy9 / privacyru9 | society passages, sheets submission |

---

## UI State Variables

| Variable | Type | Init | Description | Updated In | Read In |
|----------|------|------|-------------|-----------|---------|
| `$dot1Color` | string | `"gray"` | Progress dot 1 color | Entering yacht scenario | Footer rendering |
| `$dot2Color` | string | `"gray"` | Progress dot 2 color | After yacht+moral complete | Footer rendering |
| `$dot3Color` | string | `"gray"` | Progress dot 3 color | After factory complete | Footer rendering |
| `$dot4Color` | string | `"gray"` | Progress dot 4 color | After deontology complete | Footer rendering |
| `$dot5Color` | string | `"gray"` | Progress dot 5 color | After libertarian / final calc | Footer rendering |
| `$Lang` | string | `"no"` | Selected language | Language selection | All passage routing, sheets submission |
| `$soundOn` | boolean | `false` | Background music state | Sound toggle button | Audio playback logic |
| `$started` | number | `0` | Whether game has started | Start passage | Start passage display logic |

---

## Derived / Computed Values (Not Stored)

These are calculated on-the-fly for the result graph and are not persisted as Twine variables:

| Value | Formula | Used In |
|-------|---------|---------|
| `xRatio` | `(U+D == 0) ? 0.5 : U/(U+D)` | Graph X position |
| `yRatio` | `(L+S == 0) ? 0.5 : L/(L+S)` | Graph Y position |
| `xPercentage` | `xRatio * 100` | Graph X coordinate |
| `yPercentage` | `yRatio * 100` | Graph Y coordinate |
| `country` | fetched from ipapi.co | Sheets submission |
| `deviceType` | regex on user agent | Sheets submission |
| `os` | parsed from user agent | Sheets submission |
| `timestamp` | `new Date()` at submission time | Sheets submission |

---

## Variable Lifecycle

```
StoryInit
  └─ All variables initialized to defaults
      │
      ├─ Language Selection
      │   └─ $Lang = "en" | "ru"
      │
      ├─ Trolley (optional)
      │   ├─ $trolley1 updated, U or D +1
      │   └─ $trolley2 updated, U or D +1
      │
      ├─ Yacht
      │   ├─ $yacht1 updated, U or D +2
      │   ├─ $yacht2 updated, U or D +1
      │   └─ $dot1Color = "green"
      │
      ├─ Moral Reflection (no variable changes)
      │   └─ $dot2Color = "green"
      │
      ├─ Factory
      │   ├─ $factory1 updated, U or D +2
      │   ├─ $factory2 updated, U or D +1
      │   └─ $dot3Color = "green"
      │
      ├─ Deontology / Lies
      │   ├─ $lies1 updated, U or D +1
      │   ├─ $lies2 updated, U+S or D+L
      │   └─ $dot4Color = "green"
      │
      ├─ Libertarian
      │   ├─ $liberty1 updated, L or S +2
      │   ├─ $liberty2 updated, L or S +2
      │   └─ $dot5Color = "green"
      │
      ├─ Privacy
      │   ├─ $privacy1 updated, S or L +2
      │   ├─ $privacy2 updated, U+S or D+L
      │   └─ $science, $society, $art computed
      │
      └─ Endgame
          ├─ Routing based on U, D, L, S thresholds
          ├─ Graph computed from U, D, L, S
          ├─ Final moral type determined
          └─ Results submitted to Google Sheets
```

---

## React Migration Notes

In the React implementation, these map to:

- **Scoring variables** (`U`, `D`, `L`, `S`) → a single `scores` state object or Zustand store slice
- **Per-choice variables** → a `choices` record keyed by choice ID
- **Result variables** → derived/computed from scores (can be pure functions, not state)
- **UI variables** → component-level state or a separate UI store slice
- **Dot colors** → derived from game progress (which stage the player is on), not stored separately
- **Lang** → i18n context or store value
- **soundOn** → local UI state or persisted preference
