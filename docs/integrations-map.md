# Integrations Map

## 1. Google Analytics (gtag.js)

### Configuration

- **GTM Container**: `GTM-MZRQ4JRZ`
- **GA4 Measurement ID**: `G-DP65GTYG1C`

### Setup Script

```html
<!-- Google Tag Manager -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DP65GTYG1C"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-DP65GTYG1C');
</script>
```

### Events

| Event Name | Trigger Point | Parameters | Passage |
|------------|--------------|------------|---------|
| `game_start` | Start passage displays | — | Start |
| `choice_made` | Player selects language | `choice_id: 'choose_language'`, `lang: 'en'\|'ru'` | English / Russian |
| `tutorial_complete` | After trolley tutorial ends | — | trolley5 / trolleyru5 |
| `stage1_complete` | Yacht + moral section done | — | ready1 / ready1ru |
| `stage2_complete` | Factory section done | — | factory3-4 / factory3-4ru |
| `stage3_complete` | Deontology section done | — | deontology9-10 / deontologyru9-10 |
| `stage4_complete` | Libertarian section done | — | libertarian end / libertarianru end |
| `stage5_complete` | Privacy section done | — | privacy9 / privacyru9 |
| `result_complete` | Final result displayed | — | endgame3 / endgameru3 |

### React Implementation

```typescript
// utils/analytics.ts

export function trackEvent(eventName: string, params?: Record<string, string>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// Usage:
trackEvent('game_start');
trackEvent('choice_made', { choice_id: 'choose_language', lang: 'en' });
trackEvent('stage1_complete');
trackEvent('result_complete');
```

Add to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-DP65GTYG1C"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-DP65GTYG1C');
</script>
```

Type declaration:
```typescript
// global.d.ts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
```

---

## 2. Google Sheets Submission

### Endpoint

```
URL:     https://v1.nocodeapi.com/aishlykov/google_sheets/ohxHHAcDmgnAYEsY?tabId=Results
Method:  POST
Headers: Content-Type: application/json
```

### Request Body

JSON array containing a single row (array of arrays):

```json
[
  [
    "2024-01-15T10:30:00Z",  // timestamp (ISO string)
    5,                         // U score
    3,                         // D score
    4,                         // L score
    2,                         // S score
    "en",                      // Lang
    "US",                      // country (from IP lookup)
    "Desktop",                 // deviceType
    "macOS",                   // os
    "pull",                    // trolley1
    "push",                    // trolley2
    "agree",                   // yacht1
    "no",                      // yacht2
    "accept",                  // factory1
    "no",                      // factory2
    "yes",                     // lies1
    "lie",                     // lies2
    "no",                      // liberty1 (no tax)
    "voluntary",               // liberty2
    "yes",                     // privacy1
    "yes",                     // privacy2
    1,                         // science (0/1/2)
    1,                         // society (0/1/2)
    1                          // art (0/1/2)
  ]
]
```

### Column Order (24 columns)

| Index | Field | Type | Source |
|-------|-------|------|--------|
| 0 | timestamp | string (ISO) | `new Date().toISOString()` |
| 1 | U | number | game state |
| 2 | D | number | game state |
| 3 | L | number | game state |
| 4 | S | number | game state |
| 5 | Lang | string | `"en"` or `"ru"` |
| 6 | country | string | IP geolocation API |
| 7 | deviceType | string | user agent detection |
| 8 | os | string | user agent detection |
| 9 | trolley1 | string | choice variable |
| 10 | trolley2 | string | choice variable |
| 11 | yacht1 | string | choice variable |
| 12 | yacht2 | string | choice variable |
| 13 | factory1 | string | choice variable |
| 14 | factory2 | string | choice variable |
| 15 | lies1 | string | choice variable |
| 16 | lies2 | string | choice variable |
| 17 | liberty1 | string | choice variable |
| 18 | liberty2 | string | choice variable |
| 19 | privacy1 | string | choice variable |
| 20 | privacy2 | string | choice variable |
| 21 | science | number | computed result |
| 22 | society | number | computed result |
| 23 | art | number | computed result |

---

## 3. IP Geolocation

### Endpoint

```
URL:    https://ipapi.co/json
Method: GET
```

### Response (relevant fields)

```json
{
  "country_name": "United States",
  "country_code": "US",
  ...
}
```

Use `country_name` or `country_code` for the sheets submission. Called once at game end.

### React Implementation

```typescript
async function getCountry(): Promise<string> {
  try {
    const res = await fetch('https://ipapi.co/json');
    const data = await res.json();
    return data.country_name || 'Unknown';
  } catch {
    return 'Unknown';
  }
}
```

---

## 4. Device Detection

### Device Type

```typescript
function getDeviceType(): string {
  return /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
}
```

### Operating System

```typescript
function getOS(): string {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Macintosh|Mac OS/i.test(ua)) return 'macOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown';
}
```

---

## 5. Complete Submission Function

```typescript
// services/submitResults.ts

interface GameResults {
  scores: { U: number; D: number; L: number; S: number };
  lang: string;
  choices: {
    trolley1: string; trolley2: string;
    yacht1: string; yacht2: string;
    factory1: string; factory2: string;
    lies1: string; lies2: string;
    liberty1: string; liberty2: string;
    privacy1: string; privacy2: string;
  };
  predictions: { science: number; society: number; art: number };
}

const SHEETS_URL = 'https://v1.nocodeapi.com/aishlykov/google_sheets/ohxHHAcDmgnAYEsY?tabId=Results';

export async function submitResults(results: GameResults): Promise<void> {
  const country = await getCountry();
  const deviceType = getDeviceType();
  const os = getOS();
  const timestamp = new Date().toISOString();

  const { scores, lang, choices, predictions } = results;

  const row = [
    timestamp,
    scores.U, scores.D, scores.L, scores.S,
    lang, country, deviceType, os,
    choices.trolley1, choices.trolley2,
    choices.yacht1, choices.yacht2,
    choices.factory1, choices.factory2,
    choices.lies1, choices.lies2,
    choices.liberty1, choices.liberty2,
    choices.privacy1, choices.privacy2,
    predictions.science, predictions.society, predictions.art,
  ];

  await fetch(SHEETS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([row]),
  });
}
```

---

## 6. Environment Variables

For the React app, extract API keys/URLs to env:

```env
# .env
VITE_GA_MEASUREMENT_ID=G-DP65GTYG1C
VITE_GTM_ID=GTM-MZRQ4JRZ
VITE_SHEETS_URL=https://v1.nocodeapi.com/aishlykov/google_sheets/ohxHHAcDmgnAYEsY?tabId=Results
VITE_GEO_URL=https://ipapi.co/json
```

---

## 7. Integration Timing

| Integration | When | Blocking? |
|-------------|------|-----------|
| GA: `game_start` | On Start passage render | No |
| GA: `choice_made` | On language selection | No |
| GA: stage events | On passage transition after stage | No |
| GA: `result_complete` | On final result display | No |
| Geolocation | At endgame (before sheets submit) | Yes (awaited) |
| Sheets POST | At endgame after result display | No (fire and forget) |
| Device detection | At endgame (sync, instant) | No |
