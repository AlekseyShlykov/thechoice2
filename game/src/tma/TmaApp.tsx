import { useEffect } from 'react';
import i18n from '../i18n';
import GameScene from '../components/GameScene';
import { useGameStore } from '../store/gameStore';
import { detectTmaLang } from './lang';
import { initTelegram } from './telegram';
import '../App.css';
import './tma.css';

const lang = detectTmaLang();

i18n.changeLanguage(lang);

const store = useGameStore.getState();
store.setLang(lang);
store.updateVar('tma', true);

window.history.replaceState(null, '', `/${lang}`);

const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
if (viewport) {
  viewport.setAttribute(
    'content',
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
  );
}

export default function TmaApp() {
  useEffect(() => {
    initTelegram();
  }, []);

  return (
    <div className="app tma-app">
      <GameScene />
    </div>
  );
}
