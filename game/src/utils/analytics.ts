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

export async function getCountry(): Promise<string> {
  try {
    const resp = await fetch('https://ipapi.co/json', { cache: 'no-store' });
    if (resp.ok) {
      const json = await resp.json();
      return json.country_name || 'Unknown';
    }
  } catch {
    // fallback
  }
  return 'Unknown';
}

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

  try {
    const resp = await fetch(
      'https://v1.nocodeapi.com/aishlykov/google_sheets/ohxHHAcDmgnAYEsY?tabId=Results',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([row]),
      }
    );
    const text = await resp.text();
    console.log('Data sent:', text);
  } catch (e) {
    console.error('Error sending data:', e);
  }
}
