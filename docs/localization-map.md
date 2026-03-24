# Localization Map

## Architecture

The original Twine game uses **parallel passage branches** for English and Russian. Every English passage has a Russian counterpart with an `ru` suffix. The game logic, variable updates, conditions, and branching are identical between languages — only the text content differs.

## Language Selection

```
Start (shared)
  ├─ "English" → $Lang = "en" → English branch
  └─ "Russian" → $Lang = "ru" → Russian branch
```

Once selected, the player stays in their language branch for the entire game.

---

## Passage Pair Mapping

### Shared Passages (No Language Variant)

| Passage | Purpose |
|---------|---------|
| `Start` | Entry point, language buttons |
| `StoryInit` | Variable initialization |

### Entry & Tutorial

| English | Russian | Content |
|---------|---------|---------|
| `English` | `Russian` | Intro, tutorial offer |
| `Trolley` | `trolleyru` | Trolley problem intro |
| `trolley2` | `trolleyru2` | Fat man variant |
| `trolley3` | `trolleyru3` | Trolley reflection |
| `trolley4` | `trolleyru4` | Trolley conclusion |
| `trolley5` | `trolleyru5` | Tutorial end |

### Stage 1: Yacht / Rezeda

| English | Russian | Content |
|---------|---------|---------|
| `Rezeda` | `rezedaru` | Scenario intro |
| `Rezeda2` | `rezedaru2` | Story setup |
| `keep waiting` | `keep waitingru` | Wait for rescue |
| `catch fish` | `catch fishru` | Try to find food |
| `nothing` | `nothingru` | No food found |
| `What options` | `What optionsru` | Discuss options |
| `refuse` | `refuseru` | Refuse cannibalism |
| `agree` | `agreeru` | Agree to cannibalism |
| (yacht continuation passages) | (ru equivalents) | Story continues |
| `What's next?` | `What's next?ru` | Transition to moral |

### Moral Reflection

| English | Russian | Content |
|---------|---------|---------|
| `moral` | `moralru` | Moral philosophy intro |
| `moral2` | `moralru2` | Two approaches |
| `What are they?` | `What are they?ru` | Consequentialism |
| `And what's the second one?` | `And what's the second one?ru` | Deontology |
| `Interesting` | `Interestingru` | Player response |
| `ready1` | `ready1ru` | Ready for next stage |

### Stage 2: Factory

| English | Russian | Content |
|---------|---------|---------|
| `factory` | `factoryru` | Ford Pinto intro |
| `Great!` | `Great!ru` | Transition |
| `factory2` | `factoryru2` | Factory choice setup |
| `factory3` | `factoryru3` | Factory result A |
| `factory4` | `factoryru4` | Factory result B |

### Utilitarianism Exposition

| English | Russian | Content |
|---------|---------|---------|
| `Utilitarism` | `Utilitarismru` | Util intro |
| `utilitarism2` | `utilitarismru2` | Util explanation |
| `utilitarism3` | `utilitarismru3` | Util conclusion |

### Stage 3: Deontology

| English | Russian | Content |
|---------|---------|---------|
| `Deontology` | `Deontologyru` | Deontology intro |
| `deontology2` | `deontologyru2` | Kant intro |
| `deontology3` | `deontologyru3` | Categorical imperative |
| `deontology4` | `deontologyru4` | Lying question 1 |
| `deontology5` | `deontologyru5` | Lying scenario |
| `deontology6` | `deontologyru6` | Lying development |
| `deontology7` | `deontologyru7` | Lying question 2 |
| `deontology8` | `deontologyru8` | Lying reflection |
| `deontology9` | `deontologyru9` | Result path A |
| `deontology10` | `deontologyru10` | Result path B |

### Stage 4: Libertarian

| English | Russian | Content |
|---------|---------|---------|
| `Libertarian` | `Libertarianru` | Intro |
| `libertarian2` | `libertarianru2` | Setup |
| `libertarian3` | `libertarianru3` | Tax question |
| (continuation) | (ru equivalents) | Charity question |

### Stage 5: Privacy

| English | Russian | Content |
|---------|---------|---------|
| `Privacy` | `Privacyru` | Intro |
| `privacy2` | `privacyru2` | Surveillance setup |
| `privacy3`–`privacy8` | `privacyru3`–`privacyru8` | Scenario passages |
| `privacy9` | `privacyru9` | Result computation |

### Endgame

| English | Russian | Content |
|---------|---------|---------|
| `Endgame` | `Endgameru` | Results intro |
| `endgame2` | `endgameru2` | Science routing |
| `sciencepoor` | `sciencepoorru` | Science: poor |
| `scienceaverage` | `scienceaverageru` | Science: average |
| `sciencegood` | `sciencegoodru` | Science: good |
| `societypoor` | `societypoorru` | Society: poor |
| `societyaverage` | `societyaverageru` | Society: average |
| `societygood` | `societygoodru` | Society: good |
| `artpoor` | `artpoorru` | Art: poor |
| `artaverage` | `artaverageru` | Art: average |
| `artgood` | `artgoodru` | Art: good |
| `endgame3` | `endgameru3` | Moral type calc |
| `U+L` | `U+Lru` | Consequentialist + Libertarian |
| `U+S` | `U+Sru` | Consequentialist + Social Contract |
| `D+L` | `D+Lru` | Deontologist + Libertarian |
| `D+S` | `D+Sru` | Deontologist + Social Contract |
| `credits` | `creditsru` | Credits screen |

---

## React i18n Strategy

### Recommended: Namespace-based JSON files

```
src/
  locales/
    en/
      common.json       # UI strings (buttons, labels)
      intro.json         # Intro + trolley text
      yacht.json         # Yacht scenario text
      moral.json         # Moral reflection text
      factory.json       # Factory scenario text
      utilitarianism.json
      deontology.json    # Deontology + lies text
      libertarian.json   # Libertarian scenario text
      privacy.json       # Privacy scenario text
      endgame.json       # Results, predictions, moral types
    ru/
      common.json
      intro.json
      yacht.json
      moral.json
      factory.json
      utilitarianism.json
      deontology.json
      libertarian.json
      privacy.json
      endgame.json
```

### JSON Structure Example

```json
// en/yacht.json
{
  "rezeda": {
    "title": "The Yacht",
    "intro": "It's the 19th century. You're on a yacht called Rezeda...",
    "waitOption": "Keep waiting for rescue",
    "fishOption": "Try to catch fish",
    "nothing": "Days pass. There's nothing to eat...",
    "whatOptions": "What options do we have?",
    "refuse": "I refuse. We can't do this.",
    "agree": "We have no choice. We must survive.",
    "choice1Question": "Should the crew eat the cabin boy to survive?",
    "choice2Question": "Should the survivors be punished for what they did?"
  }
}
```

```json
// ru/yacht.json
{
  "rezeda": {
    "title": "Яхта",
    "intro": "XIX век. Вы находитесь на яхте «Резеда»...",
    "waitOption": "Продолжить ждать спасения",
    "fishOption": "Попытаться поймать рыбу",
    "nothing": "Проходят дни. Еды нет...",
    "whatOptions": "Какие у нас варианты?",
    "refuse": "Я отказываюсь. Мы не можем так поступить.",
    "agree": "У нас нет выбора. Мы должны выжить.",
    "choice1Question": "Должна ли команда съесть юнгу, чтобы выжить?",
    "choice2Question": "Должны ли выжившие быть наказаны за содеянное?"
  }
}
```

### i18n Library

Use `react-i18next` with `i18next`:

```typescript
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enYacht from './locales/en/yacht.json';
// ... all namespaces

import ruCommon from './locales/ru/common.json';
import ruYacht from './locales/ru/yacht.json';
// ... all namespaces

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, yacht: enYacht /* ... */ },
    ru: { common: ruCommon, yacht: ruYacht /* ... */ },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
```

### Usage in Components

```tsx
import { useTranslation } from 'react-i18next';

function YachtScene() {
  const { t } = useTranslation('yacht');
  
  return (
    <div>
      <p>{t('rezeda.intro')}</p>
    </div>
  );
}
```

### Language Switch

```typescript
import { useTranslation } from 'react-i18next';

function LanguageSelect() {
  const { i18n } = useTranslation();
  
  const setLanguage = (lang: 'en' | 'ru') => {
    i18n.changeLanguage(lang);
    // also update game store: setLang(lang)
  };
  
  return (
    <>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('ru')}>Русский</button>
    </>
  );
}
```

---

## Key Principle

In the React version, **language is not a routing concern**. Unlike Twine where English and Russian are separate passage trees, in React:

- There is ONE component tree
- Language is handled by i18n context
- The game state machine is language-agnostic
- Text content is loaded from locale files based on the active language

This eliminates the duplication of 134+ Russian passages, reducing the passage count from ~269 to ~135 unique game states.
