import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ru from './ru.json';
import es from './es.json';
import de from './de.json';
import fr from './fr.json';
import ja from './ja.json';
import ko from './ko.json';
import zhHans from './zh-Hans.json';
import af from './af.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    es: { translation: es },
    de: { translation: de },
    fr: { translation: fr },
    ja: { translation: ja },
    ko: { translation: ko },
    'zh-Hans': { translation: zhHans },
    af: { translation: af },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
