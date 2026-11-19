'use client';

import React from 'react';
import { Headphones, PhoneCall } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export function GlobalErrorSupport() {
  return (
    <div className="mt-8 border-t border-slate-100 pt-5 text-center">
      <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
        <Headphones className="h-3.5 w-3.5 text-secondary-600" />
        <span>Need assistance? Contact our hotline:</span>
        <a
          href={`tel:${APP_CONFIG.supportPhoneRaw}`}
          className="font-semibold text-secondary-600 hover:underline inline-flex items-center gap-1 transition"
        >
          <PhoneCall className="h-3 w-3" />
          <span>{APP_CONFIG.supportPhone}</span>
        </a>
      </div>
    </div>
  );
}
