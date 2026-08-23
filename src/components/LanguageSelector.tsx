import React, { useEffect, useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../services/i18n/commandKeywords';
import type { SupportedLanguage } from '../services/i18n/commandKeywords';



const STORAGE_KEY = 'voice_assistant_lang';

interface LanguageSelectorProps {
  onLanguageChange: (lang: SupportedLanguage) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChange,
  className = '',
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en-US');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      setSelectedLang(saved);
      onLanguageChange(saved);
    } else {
      onLanguageChange('en-US');
    }
  }, [onLanguageChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as SupportedLanguage;
    setSelectedLang(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    onLanguageChange(newLang);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <label htmlFor="language-select" className="sr-only">
        Select Voice Language
      </label>
      <div className="relative flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 shadow-sm hover:border-slate-600 transition-colors">
        <svg
          className="w-4 h-4 text-indigo-400 mr-2 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>

        <select
          id="language-select"
          value={selectedLang}
          onChange={handleChange}
          className="bg-transparent text-slate-200 text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer pr-6 appearance-none"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option
              key={lang.code}
              value={lang.code}
              className="bg-slate-900 text-slate-200"
            >
              {lang.flag} {lang.nativeName}
            </option>
          ))}
        </select>

        <svg
          className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};
