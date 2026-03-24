# Twine (SugarCube) → Frontend Migration Spec

## 1. Project Goal

Rebuild the existing Twine (SugarCube) HTML game as a modern frontend application using a standard frontend stack.

This is a **full migration**, not a reinterpretation.

The result must:
- preserve 100% of the original game logic
- preserve all branches, choices, and endings
- preserve all variable calculations
- preserve all side effects and integrations
- improve code structure and UI quality

---

## 2. Core Objective

The rebuilt version must behave identically to the original Twine game.

For the same sequence of player choices, the new version must produce:

- identical story progression
- identical available choices
- identical variable updates
- identical final values
- identical result logic
- identical graph-driving values
- identical external side effects (analytics, data submission)

UI can improve visually, but logic must remain unchanged.

---

## 3. Tech Stack

Cursor should choose the most suitable modern frontend stack.

Requirements:
- suitable for interactive narrative apps
- centralized state management
- JSON-based localization support
- ability to render result graphs
- clean and maintainable

Preferred:
- React + Vite (or equivalent modern stack)

Do NOT use Twine or SugarCube in the final implementation.

---

## 4. Scope of Original Game

The original project is a single Twine/SugarCube HTML file containing:

- all passages (story + logic)
- inline CSS styling
- custom JavaScript behavior
- language branching (English / Russian)
- variable-based logic system
- result graph logic
- analytics tracking (dataLayer)
- result submission to Google Sheets (NoCodeAPI)
- local assets (images, favicon)

---

## 5. Core Requirement: Full Logic Parity

The migration must preserve:

- all passages
- all transitions
- all choices
- all conditions
- all variable updates
- all branching paths
- all endings
- all hidden logic

### Critical rule

For identical player input → identical output:

- same scenes
- same choices
- same variables
- same results
- same graph values

---

## 6. Passage Behavior Preservation

This is not just text migration — passage runtime behavior must be preserved.

Includes:

- variable updates inside passages (`<<set>>`)
- conditional rendering (`<<if>>`, `<<elseif>>`, `<<else>>`)
- transitions (`<<link>>`, `[[...]]`, `<<goto>>`)
- inline logic execution
- side effects triggered inside passages

---

## 7. Language Flow Preservation

Language selection is part of gameplay.

Current behavior:
- player starts at Start screen
- chooses English or Russian
- `$Lang` is set
- game continues in selected language branch

Migration requirements:
- preserve language selection step
- preserve user experience of choosing language
- convert duplicated branches into JSON localization if possible
- preserve all wording and flow
- preserve any differences between language branches

---

## 8. State Management

All variables must be centralized.

Must preserve:
- initial values
- updates
- conditions
- final values used in results

State should include:
- scoring variables (U, D, L, S, etc.)
- per-choice variables (trolley, yacht, etc.)
- language
- flags if any

---

## 9.1 Localization System Upgrade (REQUIRED)

The original game uses separate Twine branches for each language (e.g. English and Russian).

This approach must be replaced with a proper scalable localization system.

### Required behavior

- all languages must be loaded from JSON files
- language must be stored in state
- all scenes must use language-based content (not duplicated logic branches)
- adding a new language must NOT require duplicating game logic

### Required architecture

- one unified game flow (no duplicated passage branches per language)
- all text content comes from locale files
- logic remains shared across all languages

### Language files

/content/locales/en.json  
/content/locales/ru.json  
(and must support adding more languages easily)

### Critical constraint

DO NOT maintain separate logic branches for each language.

Instead:
- merge English and Russian flows into a single logical structure
- map all text to localization keys
- preserve exact meaning and structure

### Compatibility requirement

Even after merging language branches:
- the player must experience the same flow
- the same choices must appear
- the same logic must apply
- only the text changes based on language

### Extensibility requirement

The final system must allow adding a new language (e.g. French) by:
- creating a new JSON file
- without modifying game logic code

### Important rule

Language is content, not logic.

Do not encode language differences in branching logic unless absolutely necessary and proven by the original game.

---

## 10. Narrative Rendering (Typewriter Effect)

The original game uses a typewriter-style text animation.

Required behavior:

- text appears progressively when a scene loads
- clicking outside links instantly reveals full text
- links should not break behavior

This must be preserved.

---

## 11. Analytics Preservation

The original game uses `window.dataLayer` for tracking.

Must preserve:

- game start event
- language selection
- player choices
- any other tracked events

Requirements:
- maintain event structure where possible
- implement cleanly in frontend
- do not remove tracking

---

## 12. Results Submission (Google Sheets)

The game sends results to Google Sheets via NoCodeAPI.

This behavior is **mandatory to preserve**.

### Requirements

- preserve automatic submission
- preserve trigger point in flow
- preserve all variables sent
- preserve metadata

### Fields to preserve

The following values must be sent:

1. timestamp  
2. U  
3. D  
4. L  
5. S  
6. Lang  
7. country  
8. deviceType  
9. os  
10. trolley1  
11. trolley2  
12. yacht1  
13. yacht2  
14. factory1  
15. factory2  
16. lies1  
17. lies2  
18. liberty1  
19. liberty2  
20. privacy1  
21. privacy2  
22. science  
23. society  
24. art  

### Metadata behavior

Must preserve:
- timestamp generation
- country lookup (or equivalent fallback)
- device detection
- OS detection

### Implementation requirements

- clean payload construction
- error handling
- no silent data loss
- clearly documented logic

---

## 13. Result Model & Graph

The game computes final results based on variables and displays a graph.

Must preserve:

- all scoring variables
- all calculations
- mapping from variables → graph
- mapping from variables → interpretation

Do NOT approximate logic.

Graph rendering can improve visually but must use same data.

---

## 14. Asset Preservation

All assets must remain functional:

- images inside story
- favicon
- other local files

Paths may change, but references must be updated correctly.

---

## 15. UI / UX Requirements

UI should be improved to product-level quality.

Goals:
- clean modern design
- strong readability
- centered narrative layout
- clear choices
- good spacing
- responsive design
- polished result screen

Must preserve:
- reading flow
- scene progression
- narrative structure

---

## 16. Layout Behavior

Preserve reading experience:

- vertical scroll inside scene
- text-focused layout
- inline images
- preserved line breaks (important)
- immersive narrative feel

---

## 17. Features NOT Required

Do not add:

- save/load
- undo/history
- timers
- inventory
- backend systems
- unnecessary complexity

---

## 18. Migration Workflow

### Step 1 — Analyze Twine

Extract:
- passages
- variables
- conditions
- transitions
- analytics
- submission logic
- graph logic

### Step 2 — Build Documentation

Create:

/docs/game-logic-map.md  
/docs/variables-map.md  
/docs/passage-flow.md  

### Step 3 — Verify Understanding

List:
- variables
- branches
- results
- graph model

### Step 4 — Design Architecture

Choose:
- stack
- state model
- scene system
- localization system

### Step 5 — Implement

- rebuild engine
- migrate content
- implement logic
- implement UI

### Step 6 — Verify Parity

Ensure:
- same behavior
- same results
- same graph
- same data submission

---

## 19. Verification Checklist

- all passages mapped
- all choices preserved
- all variables preserved
- all conditions preserved
- language works
- analytics works
- Google Sheets submission works
- graph matches original
- no broken transitions

---

## 20. Non-Negotiables

Must NOT change:

- logic
- branching
- variable calculations
- result model
- graph logic
- analytics behavior
- data submission behavior

---

## 21. Priority Order

1. logic accuracy  
2. result correctness  
3. data submission correctness  
4. content separation  
5. UI quality  
6. maintainability  

---

## 22. Final Instruction

Do NOT build a similar game.

Build a **faithful frontend reconstruction** of the existing Twine game with:

- identical logic
- identical behavior
- identical results
- improved architecture
- improved UI
- preserved integrations