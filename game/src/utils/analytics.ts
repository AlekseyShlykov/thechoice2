type Fbq = {
  (command: 'trackCustom', eventName: string, params?: Record<string, unknown>): void;
  (command: 'track', eventName: string, params?: Record<string, unknown>): void;
  (command: 'init', pixelId: string, params?: Record<string, unknown>): void;
};

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    fbq?: Fbq;
  }
}

window.dataLayer = window.dataLayer || [];

export function track(eventName: string, params: Record<string, unknown> = {}) {
  window.dataLayer.push({ event: eventName, ...params });
}

export function trackMeta(eventName: string, params: Record<string, unknown> = {}) {
  try {
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, params);
    }
  } catch {
    // Meta Pixel unavailable
  }
}

export function getDeviceType(): string {
  return /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
}

export function getOS(): string {
  const ua = navigator.userAgent;
  if (/Windows NT/i.test(ua)) return 'Windows';
  if (/Mac OS X/i.test(ua)) return 'macOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iOS/i.test(ua)) return 'iOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown';
}

const COUNTRY_LOOKUP_MS = 3000;

export async function getCountry(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), COUNTRY_LOOKUP_MS);
    const resp = await fetch('https://ipapi.co/json', {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (resp.ok) {
      const json = await resp.json();
      return json.country_name || 'Unknown';
    }
  } catch {
    // fallback
  }
  return 'Unknown';
}

const SHEETS_WEB_APP_URL = import.meta.env.VITE_SHEETS_WEB_APP_URL;
const SHEETS_SECRET = import.meta.env.VITE_SHEETS_SECRET;

interface SubmissionData {
  U: number;
  D: number;
  L: number;
  S: number;
  Lang: string;
  trolley1: number | string;
  trolley2: number | string;
  yacht1: number | string;
  yacht2: number | string;
  factory1: number | string;
  factory2: number | string;
  lies1: number | string;
  lies2: number | string;
  liberty1: number | string;
  liberty2: number | string;
  privacy1: number | string;
  privacy2: number | string;
  science: number | string;
  society: number | string;
  art: number | string;
}

export async function submitToGoogleSheets(data: SubmissionData): Promise<void> {
  const timestamp = new Date().toISOString();
  const deviceType = getDeviceType();
  const os = getOS();
  const country = await getCountry();

  const row = [
    timestamp,
    data.U,
    data.D,
    data.L,
    data.S,
    data.Lang,
    country,
    deviceType,
    os,
    data.trolley1,
    data.trolley2,
    data.yacht1,
    data.yacht2,
    data.factory1,
    data.factory2,
    data.lies1,
    data.lies2,
    data.liberty1,
    data.liberty2,
    data.privacy1,
    data.privacy2,
    data.science,
    data.society,
    data.art,
  ];

  if (!SHEETS_WEB_APP_URL || !SHEETS_SECRET) {
    console.warn(
      'Sheets submission skipped: set VITE_SHEETS_WEB_APP_URL and VITE_SHEETS_SECRET (see scripts/google-sheets-webapp/SETUP.md)',
    );
    return;
  }

  // GAS Web App: POST often breaks on 302 redirect in browsers; GET + base64 payload is reliable.
  const payload = btoa(JSON.stringify({ rows: [row] }));
  const url =
    `${SHEETS_WEB_APP_URL}?submit=1` +
    `&secret=${encodeURIComponent(SHEETS_SECRET)}` +
    `&payload=${encodeURIComponent(payload)}`;

  try {
    const resp = await fetch(url, { method: 'GET' });
    const text = await resp.text();
    let result: { ok?: boolean; error?: string; appended?: number };
    try {
      result = JSON.parse(text) as { ok?: boolean; error?: string; appended?: number };
    } catch {
      result = { ok: false, error: text };
    }
    if (!resp.ok || !result.ok) {
      console.error('Sheets submit failed:', resp.status, result.error || result, text.slice(0, 200));
      return;
    }
    console.log('Data sent to Google Sheets:', result);
  } catch (e) {
    console.error('Error sending data:', e);
  }
}
