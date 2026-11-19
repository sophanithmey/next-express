import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface LandingBenefitCardProps {
  index: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function LandingBenefitCard({
  index,
  icon: Icon,
  title,
  description,
}: LandingBenefitCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white p-6 sm:p-7 shadow-[0_1px_2px_rgba(20,45,89,0.04),0_8px_24px_-14px_rgba(20,45,89,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary-500 hover:shadow-[0_16px_36px_-14px_rgba(255,204,0,0.35),0_4px_12px_-4px_rgba(20,45,89,0.06)]">
      {/* Subtle top primary accent bar revealed on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary-400 via-primary-500 to-primary-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Delicate ambient primary corner glow on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary-400/20 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Top Row: Distinctive Icon Container + Numbered Badge */}
      <div className="relative flex items-start justify-between gap-4 mb-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#2563EB]/15 bg-linear-to-br from-[#EFF6FF] via-[#E8F1FF] to-[#DBEAFE] text-[#2563EB] shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:border-primary-500 group-hover:from-primary-400 group-hover:to-primary-500 group-hover:text-primary-foreground group-hover:shadow-md">
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </div>

        <span className="inline-flex items-center rounded-full border border-[#E5EAF2] bg-[#F6F8FC] px-2.5 py-1 font-mono text-xs font-semibold tracking-wider text-[#142D59]/55 transition-colors duration-300 group-hover:border-primary-400 group-hover:bg-primary-100 group-hover:text-primary-900">
          {index}
        </span>
      </div>

      {/* Content */}
      <div className="relative flex-1 space-y-2.5">
        <h3 className="text-base sm:text-lg font-bold text-[#17233C] tracking-tight leading-snug transition-colors duration-200 group-hover:text-[#142D59]">
          {title}
        </h3>
        <p className="text-sm text-[#718096] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Subtle logistics waypoint line accent */}
      <div
        aria-hidden="true"
        className="relative mt-6 flex items-center gap-1.5 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]/45 transition-colors duration-300 group-hover:bg-primary-500" />
        <span className="h-px w-8 bg-linear-to-r from-[#2563EB]/40 to-transparent transition-all duration-300 group-hover:w-14 group-hover:from-primary-500" />
      </div>
    </article>
  );
}
