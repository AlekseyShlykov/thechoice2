import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { passages } from '../passages/registry';
import { useTypewriter } from '../hooks/useTypewriter';
import MoralGraph from './MoralGraph';
import ShareResultButton from './ShareResultButton';
import './GameScene.css';

const RESULT_PASSAGES = ['resultUL', 'resultUS', 'resultDL', 'resultDS'];
const SUPPORTED_LANGS = ['en', 'ru', 'es', 'de', 'fr', 'ja', 'ko', 'zh-Hans', 'af'] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];
const BASE_SEGMENTS = import.meta.env.BASE_URL.split('/').filter(Boolean);
const SEO_LANG_MAP: Record<SupportedLang, string> = {
  en: 'en',
  ru: 'ru',
  es: 'es',
  de: 'de',
  fr: 'fr',
  ja: 'ja',
  ko: 'ko',
  'zh-Hans': 'zh-Hans',
  af: 'af',
};

function isSupportedLang(value: string): value is SupportedLang {
  return (SUPPORTED_LANGS as readonly string[]).includes(value);
}

function stripBaseSegments(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean);
  const baseMatches = BASE_SEGMENTS.every((seg, idx) => parts[idx] === seg);
  return baseMatches ? parts.slice(BASE_SEGMENTS.length) : parts;
}

function getLangFromPath(pathname: string): SupportedLang | null {
  const parts = stripBaseSegments(pathname);
  const first = parts[0];
  return first && isSupportedLang(first) ? first : null;
}

function withLangInPath(pathname: string, lang: SupportedLang): string {
  const parts = stripBaseSegments(pathname);
  if (parts[0] && isSupportedLang(parts[0])) {
    parts[0] = lang;
  } else {
    parts.unshift(lang);
  }
  return `/${[...BASE_SEGMENTS, ...parts].join('/')}`;
}

function ensureCanonical(urlPath: string): void {
  const href = `${window.location.origin}${urlPath}`;
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.href = href;
}

export default function GameScene() {
  const { t, i18n } = useTranslation();
  const currentPassage = useGameStore((s) => s.currentPassage);
  const lang = useGameStore((s) => s.lang);
  const store = useGameStore();

  const passage = passages[currentPassage];
  const sceneContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urlLang = getLangFromPath(window.location.pathname);
    if (urlLang && urlLang !== lang) {
      store.setLang(urlLang);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    document.documentElement.lang = SEO_LANG_MAP[lang];
    const nextPath = withLangInPath(window.location.pathname, lang);
    if (nextPath !== window.location.pathname) {
      window.history.replaceState(window.history.state, '', `${nextPath}${window.location.search}${window.location.hash}`);
    }
    ensureCanonical(nextPath);
  }, [lang, i18n]);

  useEffect(() => {
    if (passage?.onEnter) {
      passage.onEnter(store);
    }
    sceneContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPassage]);

  const mainText = useMemo(() => {
    if (!passage) return '';
    return t(passage.textKey, { defaultValue: '' });
  }, [passage, t]);

  const formattedText = useMemo(() => {
    return mainText.replace(/\n/g, '<br/>');
  }, [mainText]);

  const { displayedText, skipToEnd } = useTypewriter(formattedText);

  const isResultPage = RESULT_PASSAGES.includes(currentPassage);
  const showGraph = isResultPage;

  const resultDescKey = isResultPage
    ? passage.textKey.replace('.title', '.description')
    : null;

  const resultTitlePlain = isResultPage ? t(passage.textKey, { defaultValue: '' }) : '';

  if (!passage) {
    return <div className="game-scene">Passage not found: {currentPassage}</div>;
  }

  const isStartPage = currentPassage === 'start';

  return (
    <div
      className="game-scene"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.choice-button, .share-result-overlay')) return;
        skipToEnd();
      }}
    >
      <div className="scene-content" ref={sceneContentRef}>
        {isStartPage && (
          <div className="start-header">
            <h1 className="start-title">
              <span className="start-title-line">{t('start.titleLine1')}</span>
              <br />
              <span className="start-title-line">{t('start.titleLine2')}</span>
            </h1>
            <h2 className="start-subtitle">
              <span className="start-subtitle-line">{t('start.subtitlePart1')}</span>
              <span className="start-subtitle-sep" aria-hidden="true">
                {' '}
                •{' '}
              </span>
              <span className="start-subtitle-line">{t('start.subtitlePart2')}</span>
            </h2>
            {passage.choices[0] && (
              <button className="choice-button start-play-button" onClick={() => passage.choices[0].action(store)}>
                {t(passage.choices[0].textKey, { defaultValue: passage.choices[0].textKey })}
              </button>
            )}
          </div>
        )}

        {passage.image && !isStartPage && (
          <img
            src={passage.image}
            alt=""
            className="scene-image"
            loading="eager"
          />
        )}

        {!isStartPage && isResultPage && (
          <h2
            className="result-heading"
            dangerouslySetInnerHTML={{ __html: displayedText }}
          />
        )}
        {!isStartPage && !isResultPage && (
          <div
            className="scene-text"
            dangerouslySetInnerHTML={{ __html: displayedText }}
          />
        )}

        {showGraph && <MoralGraph />}

        {isResultPage && resultDescKey && (
          <div
            className="scene-text result-description"
            dangerouslySetInnerHTML={{
              __html: t(resultDescKey, { defaultValue: '' }).replace(/\n/g, '<br/>'),
            }}
          />
        )}
      </div>

      <div className="choices-container">
        {isResultPage && <ShareResultButton resultTitle={resultTitlePlain} />}
        {isStartPage ? (
          <div className="language-choices-wrap">
            <div className="language-choices-title">{t('start.chooseLanguage')}</div>
            <div className="language-choices" role="group" aria-label="Language selection">
              <button className="choice-button language-choice-button" onClick={() => store.setLang('en')}>
                {t('start.english')}
              </button>
              <button className="choice-button language-choice-button" onClick={() => store.setLang('ru')}>
                {t('start.russian')}
              </button>
              <button className="choice-button language-choice-button" onClick={() => store.setLang('es')}>
                {t('start.spanish')}
              </button>
              <button className="choice-button language-choice-button" onClick={() => store.setLang('de')}>
                {t('start.german')}
              </button>
              <button className="choice-button language-choice-button" onClick={() => store.setLang('fr')}>
                {t('start.french')}
              </button>
              <button className="choice-button language-choice-button" onClick={() => store.setLang('ja')}>
                {t('start.japanese')}
              </button>
              <button className="choice-button language-choice-button" onClick={() => store.setLang('ko')}>
                {t('start.korean')}
              </button>
              <button className="choice-button language-choice-button" onClick={() => store.setLang('zh-Hans')}>
                {t('start.chineseSimplified')}
              </button>
              <button className="choice-button language-choice-button" onClick={() => store.setLang('af')}>
                {t('start.afrikaans')}
              </button>
            </div>
          </div>
        ) : (
          passage.choices.map((choice, idx) => (
            <button
              key={`${currentPassage}-${idx}`}
              className="choice-button"
              onClick={() => choice.action(store)}
            >
              {t(choice.textKey, { defaultValue: choice.textKey })}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
