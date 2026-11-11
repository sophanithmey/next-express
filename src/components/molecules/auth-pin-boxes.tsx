'use client';

import React from 'react';

interface AuthPinBoxesProps {
  pin: string;
  onClick: () => void;
}

export function AuthPinBoxes({ pin, onClick }: AuthPinBoxesProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-center gap-3 sm:gap-4 py-1"
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map((index) => {
        const isFilled = Boolean(pin[index]);
        const isCurrent = pin.length === index;

        return (
          <div
            key={index}
            className={`relative flex h-16 w-14 sm:w-16 items-center justify-center rounded-2xl border-2 transition-all cursor-pointer font-mono text-2xl font-black shadow-2xs ${
              isCurrent
                ? 'border-secondary-600 ring-4 ring-secondary-100 bg-white scale-105'
                : isFilled
                ? 'border-slate-300 bg-white text-slate-900'
                : 'border-slate-200 bg-slate-50/70 text-slate-300'
            }`}
          >
            {isFilled ? (
              <span className="flex h-3.5 w-3.5 rounded-full bg-slate-900 animate-in zoom-in-75 duration-100" />
            ) : isCurrent ? (
              <span className="h-6 w-0.5 bg-secondary-600 animate-pulse" />
            ) : (
              <span className="text-slate-300 font-normal">•</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

