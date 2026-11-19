'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface AppHeaderMobileLanguageProps {
  locale: string;
  onSwitchLanguage: (newLocale: 'km' | 'en') => void;
}

export function AppHeaderMobileLanguage({
  locale,
  onSwitchLanguage,
}: AppHeaderMobileLanguageProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
        Language / ភាសា
      </span>
      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60">
        <button
          type="button"
          onClick={() => onSwitchLanguage('km')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            locale === 'km'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="text-sm">🇰🇭</span>
          <span>ខ្មែរ</span>
          {locale === 'km' && <Check className="h-3.5 w-3.5 text-secondary-600" />}
        </button>
        <button
          type="button"
          onClick={() => onSwitchLanguage('en')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            locale === 'en'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="text-sm">🇬🇧</span>
          <span>English</span>
          {locale === 'en' && <Check className="h-3.5 w-3.5 text-secondary-600" />}
        </button>
      </div>
    </div>
  );
}
