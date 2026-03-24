import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { passages } from '../passages/registry';
import { useTypewriter } from '../hooks/useTypewriter';
import MoralGraph from './MoralGraph';
import './GameScene.css';

const RESULT_PASSAGES = ['resultUL', 'resultUS', 'resultDL', 'resultDS'];

export default function GameScene() {
  const { t, i18n } = useTranslation();
  const currentPassage = useGameStore((s) => s.currentPassage);
  const lang = useGameStore((s) => s.lang);
  const store = useGameStore();

  const passage = passages[currentPassage];

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  useEffect(() => {
    if (passage?.onEnter) {
      passage.onEnter(store);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (!passage) {
    return <div className="game-scene">Passage not found: {currentPassage}</div>;
  }

  const isStartPage = currentPassage === 'start';

  return (
    <div
      className="game-scene"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.choice-button')) return;
        skipToEnd();
      }}
    >
      <div className="scene-content">
        {isStartPage && (
          <div className="start-header">
            <h1 className="start-title">{t('start.title')}</h1>
            <h2 className="start-subtitle">{t('start.subtitle')}</h2>
            <p className="start-choose">{t('start.chooseLanguage')}</p>
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

        {!isStartPage && (
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
        {passage.choices.map((choice, idx) => (
          <button
            key={`${currentPassage}-${idx}`}
            className="choice-button"
            onClick={() => choice.action(store)}
          >
            {t(choice.textKey, { defaultValue: choice.textKey })}
          </button>
        ))}
      </div>
    </div>
  );
}
