# Migration Plan: Twine/SugarCube → React + Vite + TypeScript

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React 18+ | Component-based, large ecosystem |
| Build | Vite | Fast dev server, native TS support |
| Language | TypeScript | Type safety for game state |
| State | Zustand | Lightweight, no boilerplate, perfect for game state |
| Routing | Internal state machine (no URL routing) | Game is single-page, not URL-driven |
| i18n | react-i18next | Industry standard, namespace support |
| Styling | CSS Modules or Tailwind CSS | Scoped styles, no runtime cost |
| Animation | Framer Motion | Typewriter effect, transitions |

---

## Project Structure

```
the-choice/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env
├── public/
│   ├── images/
│   │   ├── ai.png
│   │   ├── yacht1.png, yacht2.png
│   │   ├── factory1.png, factory2.png
│   │   ├── deontology1.png, deontology2.png
│   │   ├── taxes1.png, taxes2.png
│   │   ├── privacy1.png, privacy2.png
│   │   ├── trolley1.png, trolley2.png
│   │   ├── science1.png, science2.png, science3.png
│   │   ├── society1.png, society2.png, society3.png
│   │   ├── art1.png, art2.png, art3.png
│   │   ├── preview.png
│   │   ├── favicon.png
│   │   ├── soundoff.png, soundon.png
│   │   └── site.png
│   └── audio/
│       └── music.mp3
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── global.d.ts
│   ├── i18n.ts
│   ├── vite-env.d.ts
│   │
│   ├── store/
│   │   ├── gameStore.ts          # Zustand: scores, choices, stage, lang
│   │   └── uiStore.ts            # Zustand: sound, current passage
│   │
│   ├── engine/
│   │   ├── passages.ts           # Passage registry & definitions
│   │   ├── types.ts              # PassageId, Choice, GameState types
│   │   └── computeResults.ts     # Score → result calculations
│   │
│   ├── components/
│   │   ├── Game.tsx              # Main game controller
│   │   ├── Passage.tsx           # Renders current passage text + image
│   │   ├── ChoiceBar.tsx         # Bottom choice buttons
│   │   ├── TypewriterText.tsx    # Typewriter animation
│   │   ├── Footer.tsx            # Progress dots + sound + site link
│   │   ├── ProgressDots.tsx      # 5 dots component
│   │   ├── SoundToggle.tsx       # Music on/off
│   │   ├── MoralGraph.tsx        # 2D result graph (canvas or SVG)
│   │   ├── ResultCard.tsx        # Science/society/art result display
│   │   └── LanguageSelect.tsx    # EN/RU buttons
│   │
│   ├── hooks/
│   │   ├── useAudio.ts           # Background music management
│   │   ├── useTypewriter.ts      # Typewriter effect logic
│   │   └── useGameProgress.ts    # Derive dot colors from stage
│   │
│   ├── services/
│   │   ├── analytics.ts          # gtag wrapper
│   │   ├── submitResults.ts      # Google Sheets POST
│   │   └── geolocation.ts        # IP country lookup
│   │
│   ├── utils/
│   │   ├── device.ts             # Device type + OS detection
│   │   └── resultLogic.ts        # Thresholds, routing helpers
│   │
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── intro.json
│   │   │   ├── yacht.json
│   │   │   ├── moral.json
│   │   │   ├── factory.json
│   │   │   ├── utilitarianism.json
│   │   │   ├── deontology.json
│   │   │   ├── libertarian.json
│   │   │   ├── privacy.json
│   │   │   └── endgame.json
│   │   └── ru/
│   │       └── (same files)
│   │
│   └── styles/
│       ├── global.css
│       ├── Game.module.css
│       ├── Passage.module.css
│       ├── ChoiceBar.module.css
│       ├── Footer.module.css
│       └── MoralGraph.module.css
```

---

## Migration Phases

### Phase 1: Foundation (Days 1–2)

**Goal**: Scaffold the project, set up state management and the passage engine.

1. **Initialize project**
   ```bash
   npm create vite@latest the-choice -- --template react-ts
   cd the-choice
   npm install zustand react-i18next i18next framer-motion
   ```

2. **Define types** (`engine/types.ts`)
   ```typescript
   export type PassageId = string;

   export interface Choice {
     labelKey: string;           // i18n key for button text
     nextPassage: PassageId;
     effects: (state: GameState) => Partial<GameState>;
   }

   export interface Passage {
     id: PassageId;
     textKey: string;            // i18n key for passage body
     image?: string;             // optional image filename
     choices?: Choice[];         // if absent → auto-advance with "continue"
     next?: PassageId;           // for linear passages
     nextFn?: (state: GameState) => PassageId; // conditional routing
     onEnter?: (state: GameState) => Partial<GameState>; // side effects
     analyticsEvent?: string;    // fire on enter
   }

   export interface Scores {
     U: number;
     D: number;
     L: number;
     S: number;
   }

   export interface Choices {
     trolley1: string;
     trolley2: string;
     yacht1: string;
     yacht2: string;
     factory1: string;
     factory2: string;
     lies1: string;
     lies2: string;
     liberty1: string;
     liberty2: string;
     privacy1: string;
     privacy2: string;
   }

   export interface Predictions {
     science: number;
     society: number;
     art: number;
   }

   export interface GameState {
     currentPassage: PassageId;
     scores: Scores;
     choices: Choices;
     predictions: Predictions;
     lang: 'en' | 'ru' | null;
     stage: number;              // 0-6
     started: boolean;
   }
   ```

3. **Create Zustand stores** (`store/gameStore.ts`)
   - `gameStore`: scores, choices, predictions, currentPassage, stage, lang
   - `uiStore`: soundOn, typewriterComplete

4. **Build passage engine** (`engine/passages.ts`)
   - Register all ~135 unique passages as a `Map<PassageId, Passage>`
   - Each passage has its text key, choices, transitions, and effects
   - Conditional routing uses `nextFn` that reads game state

5. **Implement result computation** (`engine/computeResults.ts`)
   - Pure functions: `computeScience(U)`, `computeSociety(L, S)`, `computeArt(U, D)`
   - `computeMoralType(U, D, L, S)`
   - `computeGraphPosition(U, D, L, S)`

### Phase 2: Core UI (Days 3–4)

**Goal**: Build the game rendering loop and core components.

1. **Game controller** (`components/Game.tsx`)
   - Reads `currentPassage` from store
   - Looks up passage definition
   - Renders `<Passage>` with text and image
   - Renders `<ChoiceBar>` or continue button
   - Fires analytics events on passage enter

2. **Passage renderer** (`components/Passage.tsx`)
   - Receives i18n text key, renders with typewriter effect
   - Displays optional image
   - Click-to-skip typewriter animation

3. **Typewriter effect** (`hooks/useTypewriter.ts`)
   - 15ms per character
   - Skips HTML tags (render them instantly)
   - Click anywhere to reveal all remaining text
   - Signals completion to enable choice buttons

4. **Choice bar** (`components/ChoiceBar.tsx`)
   - Fixed to bottom of viewport
   - Renders 1-2 choice buttons
   - Disabled until typewriter completes
   - On click: apply effects → advance to next passage

5. **Footer** (`components/Footer.tsx`)
   - Sound toggle button (soundoff.png / soundon.png)
   - 5 progress dots (derived from `stage`)
   - Site link button (site.png)

### Phase 3: Localization (Day 5)

**Goal**: Extract all text content, set up i18n.

1. **Extract text from Twine passages**
   - Go through all ~135 English passages
   - Create corresponding JSON keys in `en/*.json`
   - Repeat for Russian in `ru/*.json`

2. **Configure i18n** (`i18n.ts`)
   - Import all namespaces
   - Set up language detection from game state

3. **Wire components to i18n**
   - Replace hardcoded strings with `t()` calls
   - Verify both languages render correctly

### Phase 4: Integrations (Day 6)

**Goal**: Analytics, Google Sheets, audio.

1. **Google Analytics**
   - Add gtag script to `index.html`
   - Create `services/analytics.ts` wrapper
   - Fire events at correct passage transitions

2. **Google Sheets submission**
   - Create `services/submitResults.ts`
   - Fetch country from ipapi.co
   - Detect device/OS
   - POST results at endgame

3. **Background music**
   - Create `hooks/useAudio.ts`
   - Loop `music.mp3`
   - Respect `soundOn` state
   - Handle autoplay restrictions (require user interaction first)

### Phase 5: Results & Endgame (Day 7)

**Goal**: Build the result screens and moral graph.

1. **Result routing**
   - Implement conditional passage routing for science/society/art
   - Each result passage shows the appropriate image and text

2. **Moral graph** (`components/MoralGraph.tsx`)
   - SVG or Canvas 2D implementation
   - X axis: Deontology ↔ Consequentialism
   - Y axis: Social Contract ↔ Libertarianism
   - Plot the player's position as a dot
   - Label axes

3. **Result cards** (`components/ResultCard.tsx`)
   - Display science/society/art predictions with images

4. **Credits screen**

### Phase 6: Polish & Testing (Days 8–9)

**Goal**: Visual polish, responsive design, cross-browser testing.

1. **Visual polish**
   - Match original Twine game's dark aesthetic
   - Smooth passage transitions (fade in/out)
   - Button hover/active states
   - Mobile-responsive layout

2. **Edge cases**
   - Trolley skip path (verify variables stay at "no")
   - All 4 moral type outcomes
   - All 27 result combinations (3×3×3)
   - Zero scores (graph center)
   - Score ties (verify >= behavior)

3. **Performance**
   - Lazy-load images per stage
   - Preload next stage's images
   - Audio loading strategy

4. **Accessibility**
   - Keyboard navigation for choices
   - Screen reader support for passage text
   - Focus management on passage transitions

### Phase 7: Deployment (Day 10)

**Goal**: Build and deploy.

1. **Build**
   ```bash
   npm run build
   ```

2. **Test production build locally**
   ```bash
   npm run preview
   ```

3. **Deploy** (Vercel, Netlify, or static hosting)
   - Configure SPA fallback
   - Set up environment variables
   - Verify analytics in production

---

## Key Architecture Decisions

### 1. State Machine over React Router

The game is not URL-based. Passages are driven by an internal state machine, not URL routes. This means:
- No browser back/forward navigation (intentional — prevents replaying choices)
- State lives in Zustand, not URL params
- Single `<Game>` component switches passages based on `currentPassage`

### 2. Passage Registry Pattern

Instead of one React component per passage, use a data-driven approach:

```typescript
const passages = new Map<PassageId, Passage>();

passages.set('yacht_intro', {
  id: 'yacht_intro',
  textKey: 'yacht:rezeda.intro',
  image: 'yacht1.png',
  next: 'yacht_wait_or_fish',
  onEnter: () => ({ stage: 1 }),
  analyticsEvent: undefined,
});

passages.set('yacht_choice1', {
  id: 'yacht_choice1',
  textKey: 'yacht:rezeda.choice1Question',
  choices: [
    {
      labelKey: 'yacht:rezeda.agree',
      nextPassage: 'yacht_agreed',
      effects: (s) => ({
        scores: { ...s.scores, U: s.scores.U + 2 },
        choices: { ...s.choices, yacht1: 'agree' },
      }),
    },
    {
      labelKey: 'yacht:rezeda.refuse',
      nextPassage: 'yacht_refused',
      effects: (s) => ({
        scores: { ...s.scores, D: s.scores.D + 2 },
        choices: { ...s.choices, yacht1: 'refuse' },
      }),
    },
  ],
});
```

This approach:
- Keeps all game logic in one place
- Makes it trivial to verify against the Twine source
- Avoids 135+ separate component files

### 3. Typewriter as a Hook

The typewriter effect is a reusable hook, not embedded in the passage system:

```typescript
const { displayedText, isComplete, skipToEnd } = useTypewriter(fullText, 15);
```

### 4. Derived State over Stored State

Progress dots, result routing, and the moral graph are all **derived** from scores — not stored as separate variables. This eliminates synchronization bugs:

```typescript
// Instead of $dot3Color stored variable:
const dotColors = useMemo(() => [
  stage >= 1 ? 'green' : 'gray',
  stage >= 2 ? 'green' : 'gray',
  stage >= 3 ? 'green' : 'gray',
  stage >= 4 ? 'green' : 'gray',
  stage >= 5 ? 'green' : 'gray',
], [stage]);
```

---

## Verification Checklist

After migration, verify these critical paths:

- [ ] Language selection sets i18n language AND game store lang
- [ ] Trolley skip path leaves trolley variables as "no" and adds no score
- [ ] Each choice increments the correct score(s) by the correct amount
- [ ] Result computation thresholds match exactly (privacy9 vs endgame2 thresholds differ)
- [ ] All 4 moral types can be reached
- [ ] Graph positions are correct for extreme scores (all U, all D, etc.)
- [ ] Google Sheets row has exactly 24 columns in the correct order
- [ ] Analytics events fire at the right moments
- [ ] Typewriter effect handles HTML tags correctly
- [ ] Music loops and respects toggle state
- [ ] Mobile layout works (fixed bottom bar, readable text)
- [ ] Both English and Russian text renders completely
