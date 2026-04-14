type TmaLang = 'ru' | 'en';

function getStartParam(): string | null {
  const url = new URL(window.location.href);

  const fromSearch = url.searchParams.get('startapp');
  if (fromSearch) return fromSearch;

  try {
    const hash = url.hash.slice(1);
    if (hash) {
      const hp = new URLSearchParams(hash);
      const val = hp.get('tgWebAppStartParam');
      if (val) return val;
    }
  } catch { /* ignore parse errors */ }

  return null;
}

function getTelegramUserLang(): string | null {
  try {
    const tg = (window as Window & { Telegram?: { WebApp: TelegramWebApp } }).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.language_code) {
      return tg.initDataUnsafe.user.language_code;
    }
  } catch { /* SDK not loaded yet */ }

  try {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    const hp = new URLSearchParams(hash);
    const initData = hp.get('tgWebAppData');
    if (!initData) return null;
    const dp = new URLSearchParams(initData);
    const userStr = dp.get('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr) as { language_code?: string };
    return user.language_code ?? null;
  } catch { /* parse error */ }

  return null;
}

interface TelegramWebApp {
  initDataUnsafe: {
    start_param?: string;
    user?: { language_code?: string };
  };
}

function resolve(raw: string): TmaLang {
  return raw.startsWith('ru') ? 'ru' : 'en';
}

export function detectTmaLang(): TmaLang {
  // 1. start_param (URL or Telegram hash)
  const sp = getStartParam();
  if (sp) return resolve(sp);

  // 2. Telegram user language
  const tgLang = getTelegramUserLang();
  if (tgLang) return resolve(tgLang);

  // 3. Browser language
  const nav = navigator.language ?? '';
  if (nav) return resolve(nav);

  // 4. Default
  return 'en';
}
