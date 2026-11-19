'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LogIn, LogOut } from 'lucide-react';
import { UserProfile } from '@/features/auth/types/auth-types';
import { formatPhoneNumber } from '@/lib/phone-number';

interface AppHeaderMobileAuthProps {
  isAuthenticated: boolean;
  user?: UserProfile | null;
  onClose: () => void;
  onOpenAuthModal: () => void;
  onOpenLogoutModal: () => void;
}

export function AppHeaderMobileAuth({
  isAuthenticated,
  user,
  onClose,
  onOpenAuthModal,
  onOpenLogoutModal,
}: AppHeaderMobileAuthProps) {
  const t = useTranslations('Navigation');

  return (
    <div className="pt-1">
      {isAuthenticated ? (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-600 text-white font-black uppercase text-sm shadow-xs">
              {user?.shopName?.[0] || user?.name?.[0] || 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.shopName || user?.name || 'Seller Store'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {formatPhoneNumber(user?.phoneNumber || '012888999')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLogoutModal();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-danger-600 hover:bg-danger-50 transition cursor-pointer border border-danger-200/60 bg-white"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenAuthModal();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200/80 bg-white text-slate-800 text-xs font-bold shadow-2xs hover:bg-slate-50 transition cursor-pointer"
        >
          <LogIn className="h-4 w-4 text-slate-600" />
          <span>{t('login')}</span>
        </button>
      )}
    </div>
  );
}
