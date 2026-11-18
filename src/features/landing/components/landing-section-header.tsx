'use client';

import React from 'react';

const BRAND_HIGHLIGHT = 'Wingexpress';

interface LandingSectionHeaderProps {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
}

function renderHighlightedTitle(title: string) {
  const brandIndex = title.indexOf(BRAND_HIGHLIGHT);
  if (brandIndex === -1) return title;

  const before = title.slice(0, brandIndex);
  const after = title.slice(brandIndex + BRAND_HIGHLIGHT.length);

  return (
    <>
      {before}
      <span className='text-black'>Wing</span>
      <span className='text-primary-500'>express</span>
      {after}
    </>
  );
}

export function LandingSectionHeader({
  id,
  badge,
  title,
  subtitle,
}: LandingSectionHeaderProps) {
  return (
    <div className='mx-auto max-w-4xl text-center space-y-4 mb-12 sm:mb-14'>
      <div className='inline-flex items-center gap-2 rounded-full border border-info-600/20 bg-white px-3.5 py-1.5 shadow-2xs'>
        <span className='h-1.5 w-1.5 rounded-full bg-info-600' />
        <span className='text-[11px] font-bold uppercase tracking-[0.14em] text-[#142D59]'>
          {badge}
        </span>
      </div>

      <h2
        id={id}
        className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#17233C] tracking-tight leading-tight sm:whitespace-nowrap'
      >
        {renderHighlightedTitle(title)}
      </h2>

      <p className='mx-auto max-w-xl text-sm sm:text-base text-[#718096] leading-relaxed'>
        {subtitle}
      </p>
    </div>
  );
}
