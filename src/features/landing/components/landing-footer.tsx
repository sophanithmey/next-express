'use client';

import React from 'react';
// import { LandingFooterCtaBanner } from './landing-footer-cta-banner';
import { LandingFooterBrand } from './landing-footer-brand';
import { LandingFooterSupport } from './landing-footer-support';
import { LandingFooterAppDownload } from './landing-footer-app-download';
import { LandingFooterBottom } from './landing-footer-bottom';

export function LandingFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-xl pt-10 sm:pt-14 pb-8 text-xs text-slate-600 transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Pre-Footer Action Banner */}
        {/* <LandingFooterCtaBanner /> */}

        {/* Footer Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          <LandingFooterBrand />
          <LandingFooterSupport />
          <LandingFooterAppDownload />
        </div>

        {/* Footer Bottom Legal & Credentials */}
        <LandingFooterBottom />
      </div>
    </footer>
  );
}
