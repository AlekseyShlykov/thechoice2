interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  requestFullscreen?: () => void;
  isExpanded: boolean;
  initDataUnsafe: {
    start_param?: string;
    user?: { language_code?: string };
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function initTelegram(): Promise<void> {
  try {
    await loadScript('https://telegram.org/js/telegram-web-app.js');
  } catch {
    return; // not in Telegram or network error — degrade gracefully
  }

  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  tg.ready();
  tg.expand();

  if (typeof tg.requestFullscreen === 'function') {
    try { tg.requestFullscreen(); } catch { /* optional */ }
  }
}
