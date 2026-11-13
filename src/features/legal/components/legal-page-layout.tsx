'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { ChevronRight, Clock, MapPin, PhoneCall, ShieldCheck } from 'lucide-react';
import { LandingFooter } from '@/features/landing/components/landing-footer';
import { LegalPageSidebar } from './legal-page-sidebar';

interface LegalSection {
  number?: string;
  title: string;
  paragraphs?: string[];
  content?: string[];
}

interface LegalPageLayoutProps {
  currentSlug?: 'about-us' | 'terms-of-use' | 'privacy-policy';
  breadcrumbTitle: string;
  badgeText: string;
  pageTitle: string;
  lastUpdated?: string;
  importantNotice?: string;
  introParagraphs?: string[];
  sections: LegalSection[];
  contactInfo?: {
    title: string;
    description: string;
    phone: string;
    phoneRaw: string;
    address: string;
    mapsUrl: string;
  };
}

export function LegalPageLayout({
  currentSlug = 'about-us',
  breadcrumbTitle,
  badgeText,
  pageTitle,
  lastUpdated,
  importantNotice,
  introParagraphs,
  sections,
  contactInfo,
}: LegalPageLayoutProps) {
  return (
    <div className='flex-1 flex flex-col bg-slate-50/60 antialiased font-sans'>
      <main className='flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl space-y-6'>
          {/* Breadcrumb Navigation */}
          <nav
            aria-label='Breadcrumb'
            className='flex items-center gap-1.5 text-xs text-slate-500 font-medium'
          >
            <Link
              href='/'
              className='hover:text-secondary-600 transition'
            >
              Home
            </Link>
            <ChevronRight className='h-3 w-3 text-slate-400' />
            <span className='text-slate-800 font-semibold'>{breadcrumbTitle}</span>
          </nav>

          {/* 2-Column Editorial Grid matching max-w-7xl app container */}
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start'>
            {/* Left Navigation & Contact Sidebar (Sticky during scroll) */}
            <div className='lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 self-start'>
              <LegalPageSidebar currentSlug={currentSlug} />
            </div>

            {/* Right Main Article Content */}
            <div className='lg:col-span-8 xl:col-span-9 space-y-6'>
              {/* Hero Header Card */}
              <div className='rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-4'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-secondary-50 border border-secondary-200 px-3 py-1 text-xs font-bold text-secondary-700'>
                    <ShieldCheck className='h-3.5 w-3.5 text-secondary-600' />
                    {badgeText}
                  </span>
                  {lastUpdated && (
                    <span className='inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium'>
                      <Clock className='h-3.5 w-3.5' />
                      <span>Last Updated: {lastUpdated}</span>
                    </span>
                  )}
                </div>

                <h1 className='text-2xl sm:text-3xl font-black text-slate-900 tracking-tight'>
                  {pageTitle}
                </h1>

                {importantNotice && (
                  <div className='rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs font-medium text-amber-900 leading-relaxed'>
                    {importantNotice}
                  </div>
                )}

                {introParagraphs && introParagraphs.length > 0 && (
                  <div className='space-y-2.5 text-sm text-slate-600 leading-relaxed pt-1'>
                    {introParagraphs.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Structured Document Content */}
              <div className='space-y-4'>
                {sections.map((section, idx) => {
                  const items = section.paragraphs || section.content || [];
                  return (
                    <section
                      key={idx}
                      className='rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-2xs space-y-3'
                    >
                      <h2 className='text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2'>
                        {section.number && (
                          <span className='flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-secondary-700'>
                            {section.number}
                          </span>
                        )}
                        <span>{section.title}</span>
                      </h2>
                      <div className='space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed'>
                        {items.map((p, pIdx) => (
                          <p key={pIdx}>{p}</p>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Contact Box (if provided) */}
              {contactInfo && (
                <div className='rounded-2xl border border-secondary-200 bg-secondary-50/50 p-6 sm:p-7 shadow-2xs space-y-4'>
                  <div>
                    <h3 className='text-base font-bold text-secondary-900'>
                      {contactInfo.title}
                    </h3>
                    <p className='text-xs text-slate-600 mt-1'>
                      {contactInfo.description}
                    </p>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs'>
                    <a
                      href={`tel:${contactInfo.phoneRaw}`}
                      className='flex items-center gap-2.5 rounded-xl border border-white bg-white p-3 font-semibold text-secondary-800 shadow-2xs hover:bg-secondary-100/50 transition cursor-pointer'
                    >
                      <PhoneCall className='h-4 w-4 text-secondary-600 shrink-0' />
                      <span>{contactInfo.phone}</span>
                    </a>
                    <a
                      href={contactInfo.mapsUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2.5 rounded-xl border border-white bg-white p-3 font-semibold text-secondary-800 shadow-2xs hover:bg-secondary-100/50 transition cursor-pointer'
                    >
                      <MapPin className='h-4 w-4 text-primary-600 shrink-0' />
                      <span className='truncate'>{contactInfo.address}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
}
