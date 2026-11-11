'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageOption {
  code: 'km' | 'en';
  label: string;
  nativeLabel: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'km', label: 'Khmer', nativeLabel: 'ខ្មែរ', flag: '🇰🇭' },
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcher() {
  const locale = useLocale() as 'km' | 'en';
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLanguage =
    LANGUAGES.find((lang) => lang.code === locale) || LANGUAGES[0];

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectLanguage = (newLocale: 'km' | 'en') => {
    setIsOpen(false);
    if (newLocale === locale) return;

    // Preserve query parameters during language switch
    const search = typeof window !== 'undefined' ? window.location.search : '';
    router.replace(`${pathname}${search}`, { locale: newLocale });
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/80 bg-white/70 hover:bg-white text-slate-700 text-xs font-semibold shadow-2xs backdrop-blur-md transition cursor-pointer active:scale-95"
        title="Switch Language / ប្តូរភាសា"
      >
        <span className="text-sm leading-none">{activeLanguage.flag}</span>
        <span className="hidden sm:inline font-sans">{activeLanguage.nativeLabel}</span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-36 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-2xl p-1.5 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`flex w-full items-center justify-between px-2.5 py-2 text-xs rounded-xl transition cursor-pointer ${
                  isSelected
                    ? 'bg-secondary-50 text-secondary-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-secondary-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

