# Passage Flow

## Notation

- `→` = automatic transition (player clicks "continue" or equivalent)
- `[A | B]` = player choice between A and B
- `(event)` = analytics event fired
- `{var}` = variable update
- Passages in **bold** are key decision points
- Russian branch mirrors English exactly with `ru` suffix (see localization-map.md)

---

## Complete English Flow

### Entry

```
Start
  (game_start)
  {$started = 1}
  → Language Selection
      [English | Russian]
      {$Lang = "en" | "ru"}
      (choice_made: choose_language)
```

### Intro & Optional Tutorial

```
English
  → [Do tutorial | Skip to story]
  
  IF tutorial:
    → Trolley
        "5 people on track, lever diverts to 1 person"
        → **trolley choice 1**
            [Pull lever → {$trolley1="pull", $U+=1}
            |Don't pull → {$trolley1="stay", $D+=1}]
        → trolley2
            "Push fat man to stop trolley?"
            → **trolley choice 2**
                [Push → {$trolley2="push", $U+=1}
                |Don't push → {$trolley2="stay", $D+=1}]
            → trolley3 → trolley4 → trolley5
            (tutorial_complete)
            → Rezeda
  
  IF skip:
    → Rezeda
```

### Stage 1: Yacht / Rezeda Scenario

```
Rezeda
  {$dot1Color = "green"}
  → Rezeda2
      "19th century, stranded at sea..."
      → keep waiting / catch fish
          → nothing (no food found)
              → What options
                  → [refuse | agree]
                  
                  IF refuse:
                      → **yacht choice 1: refuse**
                          {$yacht1="refuse", $D+=2}
                  IF agree:
                      → **yacht choice 1: agree**
                          {$yacht1="agree", $U+=2}
                  
                  → yacht continuation passages
                      → **yacht choice 2: should survivors be punished?**
                          [No → {$yacht2="no", $U+=1}
                          |Yes → {$yacht2="yes", $D+=1}]
                      
                      → What's next?
```

### Moral Reflection (No Choices)

```
What's next?
  → moral
      "Let me tell you about moral philosophy..."
      → moral2
          "Two main approaches..."
          → What are they?
              "Consequentialism: outcomes matter"
              → And what's the second one?
                  "Deontology: rules matter"
                  → Interesting
                      → ready1
                      {$dot2Color = "green"}
                      (stage1_complete)
```

### Stage 2: Factory Scenario

```
ready1
  → factory
      "Ford Pinto case: $11 fix per car vs statistical deaths"
      → Great!
          → factory2
              → **factory choice 1: recall or accept risk?**
                  [Accept risk → {$factory1="accept", $U+=2}
                  |Recall cars → {$factory1="recall", $D+=2}]
              
              → factory continuation
                  → **factory choice 2: punish the executive?**
                      [No → {$factory2="no", $U+=1}
                      |Yes → {$factory2="yes", $D+=1}]
                  
                  → factory3 / factory4
                      {$dot3Color = "green"}
                      (stage2_complete)
                      → Utilitarism
```

### Utilitarianism Exposition (No Choices)

```
Utilitarism
  → utilitarism2 → utilitarism3
      "Greatest good for greatest number..."
      → Deontology
```

### Stage 3: Deontology / Lying Scenarios

```
Deontology
  → deontology2 → deontology3
      "Kant's categorical imperative..."
      → deontology4
          → **lies choice 1: is it ever okay to lie?**
              [Yes → {$lies1="yes", $U+=1}
              |No → {$lies1="no", $D+=1}]
          
          → deontology5 → deontology6 → deontology7
              → **lies choice 2: lie to murderer to save friend?**
                  [Lie → {$lies2="lie", $U+=1, $S+=1}
                  |Truth → {$lies2="truth", $D+=1, $L+=1}]
              
              → deontology8 → deontology9 / deontology10
                  {$dot4Color = "green"}
                  (stage3_complete)
                  → Libertarian
```

### Stage 4: Libertarian Scenarios

```
Libertarian
  → libertarian2 → libertarian3
      "Individual rights, taxation debate..."
      → **liberty choice 1: mandatory taxation?**
          [No (theft) → {$liberty1="no", $L+=2}
          |Yes (duty) → {$liberty1="yes", $S+=2}]
      
      → libertarian continuation
          → **liberty choice 2: mandatory or voluntary charity?**
              [Voluntary → {$liberty2="voluntary", $L+=2}
              |Mandatory → {$liberty2="mandatory", $S+=2}]
          
          → libertarian end passages
              {$dot5Color = "green"}
              (stage4_complete)
              → Privacy
```

### Stage 5: Privacy Scenarios

```
Privacy
  → privacy2 → privacy3
      "Surveillance, security vs freedom..."
      → **privacy choice 1: mass surveillance?**
          [Yes → {$privacy1="yes", $S+=2}
          |No → {$privacy1="no", $L+=2}]
      
      → privacy continuation
          → **privacy choice 2: torture to save lives?**
              [Yes → {$privacy2="yes", $U+=1, $S+=1}
              |No → {$privacy2="no", $D+=1, $L+=1}]
          
          → privacy8
              → privacy9
                  {compute $science, $society, $art}
                  (stage5_complete)
                  → Endgame
```

### Endgame: Results

```
Endgame
  → endgame2
      SCIENCE ROUTING:
          if U < 2  → sciencepoor
          if U > 5  → sciencegood
          else      → scienceaverage
      
      sciencepoor / scienceaverage / sciencegood
          SOCIETY ROUTING:
              if L > 5  → societypoor
              if S > 6  → societygood
              else      → societyaverage
          
          societypoor / societyaverage / societygood
              ART ROUTING:
                  if U > 5  → artpoor
                  if D > 6  → artgood
                  else      → artaverage
              
              artpoor / artaverage / artgood
                  → endgame3
                      MORAL TYPE:
                          if U>=D and L>=S → U+L passage
                          if U<D and L<S   → D+S passage
                          if U<D and L>=S  → D+L passage
                          else             → U+S passage
                      
                      → Graph display
                          {plot (xPerc, yPerc) on moral compass}
                      
                      (result_complete)
                      {submit to Google Sheets}
                      → credits
```

---

## Russian Branch

The Russian branch is structurally identical. Every passage `<name>` has a corresponding `<name>ru` passage. The flow, variable updates, conditions, and routing are the same. See `localization-map.md` for the complete mapping.

---

## Passage Count Summary

| Section | Approx. Passages (per language) | Choices |
|---------|-------------------------------|---------|
| Start + Language | 2 | 1 (language) |
| Intro + Trolley | ~8 | 2 (optional) |
| Yacht / Rezeda | ~12 | 2 |
| Moral Reflection | ~6 | 0 |
| Factory | ~8 | 2 |
| Utilitarianism | ~4 | 0 |
| Deontology / Lies | ~12 | 2 |
| Libertarian | ~8 | 2 |
| Privacy | ~10 | 2 |
| Endgame + Results | ~15 | 0 |
| **Total per language** | **~85** | **12** |
| **Total (both languages)** | **~170** | — |

Plus shared passages (Start, StoryInit, etc.) = **~269 total**.

---

## Key Branching Points

Only 3 types of branching exist in this game:

1. **Language branch** — one-time split at start, then parallel tracks
2. **Tutorial skip** — optional trolley section, converges at Rezeda
3. **Binary moral choices** — each choice leads to different intermediate text but always converges back to the main path

The game is fundamentally **linear with binary choice detours**. There are no dead ends, no game-over states, and no loops. Every path leads to the endgame.
