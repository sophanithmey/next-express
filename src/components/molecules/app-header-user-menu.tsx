'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { LogOut } from 'lucide-react';
import { UserProfile } from '@/features/auth/types/auth-types';
import { formatPhoneNumber } from '@/lib/phone-number';

interface AppHeaderUserMenuProps {
  user: UserProfile;
  onOpenLogoutModal: () => void;
}

export function AppHeaderUserMenu({ user, onOpenLogoutModal }: AppHeaderUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('Navigation');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const initial = user.shopName?.[0] || user.name?.[0] || 'S';
  const displayName = user.shopName || user.name || 'Seller Store';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={`${displayName} • ${formatPhoneNumber(user.phoneNumber || '012888999')}`}
        aria-label="User profile and account settings"
        aria-expanded={isOpen}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-600 text-white text-xs font-black uppercase shadow-xs ring-2 ring-white/80 hover:ring-secondary-300 transition-all cursor-pointer active:scale-95"
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl p-3 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-600 text-white text-xs font-bold uppercase">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {formatPhoneNumber(user.phoneNumber || '012888999')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenLogoutModal();
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-danger-600 hover:bg-danger-50 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

