'use client';

import React from 'react';
import {
  Wrench,
  ServerCrash,
  Timer,
  PackageSearch,
  WifiOff,
  AlertCircle,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { SystemStatusVariant } from './types';
import { cn } from '@/lib/cn';

interface SystemStatusIllustrationProps {
  variant: SystemStatusVariant;
  className?: string;
}

export function SystemStatusIllustration({
  variant,
  className,
}: SystemStatusIllustrationProps) {
  const getIllustrationConfig = () => {
    switch (variant) {
      case 'maintenance':
        return {
          glowColor: 'bg-primary-200/40',
          outerRing: 'bg-primary-50/80 ring-primary-200/60',
          innerBg: 'bg-white text-primary-600 ring-primary-100',
          badgeBg: 'bg-secondary-600 text-white',
          MainIcon: Wrench,
          BadgeIcon: Activity,
        };
      case '500':
        return {
          glowColor: 'bg-amber-200/40',
          outerRing: 'bg-amber-50/80 ring-amber-200/60',
          innerBg: 'bg-white text-amber-700 ring-amber-100',
          badgeBg: 'bg-amber-600 text-white',
          MainIcon: ServerCrash,
          BadgeIcon: AlertCircle,
        };
      case '503':
        return {
          glowColor: 'bg-secondary-200/40',
          outerRing: 'bg-secondary-50/80 ring-secondary-200/60',
          innerBg: 'bg-white text-secondary-600 ring-secondary-100',
          badgeBg: 'bg-secondary-600 text-white',
          MainIcon: Timer,
          BadgeIcon: ShieldCheck,
        };
      case '404':
        return {
          glowColor: 'bg-primary-100/40',
          outerRing: 'bg-slate-100/80 ring-slate-200/60',
          innerBg: 'bg-white text-slate-700 ring-slate-100',
          badgeBg: 'bg-primary-500 text-slate-950',
          MainIcon: PackageSearch,
          BadgeIcon: AlertCircle,
        };
      case 'network':
        return {
          glowColor: 'bg-amber-100/40',
          outerRing: 'bg-amber-50/80 ring-amber-200/60',
          innerBg: 'bg-white text-amber-600 ring-amber-100',
          badgeBg: 'bg-slate-800 text-white',
          MainIcon: WifiOff,
          BadgeIcon: Activity,
        };
      case 'general':
      default:
        return {
          glowColor: 'bg-slate-200/40',
          outerRing: 'bg-slate-100/80 ring-slate-200/60',
          innerBg: 'bg-white text-slate-700 ring-slate-100',
          badgeBg: 'bg-secondary-600 text-white',
          MainIcon: AlertCircle,
          BadgeIcon: Activity,
        };
    }
  };

  const { glowColor, outerRing, innerBg, badgeBg, MainIcon, BadgeIcon } =
    getIllustrationConfig();

  return (
    <div
      className={cn(
        'relative mx-auto flex h-24 w-24 items-center justify-center',
        className,
      )}
    >
      {/* Ambient background glow */}
      <div
        aria-hidden='true'
        className={cn(
          'pointer-events-none absolute inset-0 -m-3 rounded-full blur-xl transition-all',
          glowColor,
        )}
      />

      {/* Outer rounded geometric container */}
      <div
        className={cn(
          'absolute inset-0 rounded-3xl ring-1 shadow-inner transition-all',
          outerRing,
        )}
      />

      {/* Central icon container */}
      <div
        className={cn(
          'relative flex h-20 w-20 items-center justify-center rounded-2xl shadow-xs ring-1 transition-all',
          innerBg,
        )}
      >
        <MainIcon
          className='h-10 w-10 transition-transform duration-300 hover:scale-105'
          strokeWidth={1.75}
        />
      </div>

      {/* Mini badge icon */}
      <span
        className={cn(
          'absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full shadow-md ring-2 ring-white transition-all',
          badgeBg,
        )}
      >
        <BadgeIcon className='h-4 w-4' strokeWidth={2.2} />
      </span>
    </div>
  );
}
