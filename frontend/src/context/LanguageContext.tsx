import React, { createContext, useContext, useEffect, useState } from 'react';

import { storage } from '@/src/utils/storage';
import { Lang, STRINGS, TrType } from '@/src/i18n';

const KEY_LANG = 'mk_lang';

type LanguageValue = {
  ready: boolean;
  language: Lang;
  setLanguage: (l: Lang) => void;
  t: TrType;
  catLabel: (key: string) => string;
};

const LanguageContext = createContext<LanguageValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [language, setLang] = useState<Lang>('tr');

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<Lang>(KEY_LANG, 'tr');
      if (saved && STRINGS[saved]) setLang(saved);
      setReady(true);
    })();
  }, []);

  const setLanguage = (l: Lang) => {
    setLang(l);
    storage.setItem(KEY_LANG, l);
  };

  const t = STRINGS[language];
  const catLabel = (key: string) => t.cat[key] ?? key;

  return (
    <LanguageContext.Provider value={{ ready, language, setLanguage, t, catLabel }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider');
  return ctx;
}
