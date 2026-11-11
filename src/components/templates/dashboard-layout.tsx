import React from 'react';
import { UserProfile } from '@/features/auth/types/auth-types';

interface DashboardLayoutTemplateProps {
  user?: UserProfile | null;
  children: React.ReactNode;
}

export function DashboardLayoutTemplate({
  children,
}: DashboardLayoutTemplateProps) {
  return (
    <div className='flex-1 flex flex-col bg-slate-50/60 antialiased font-sans'>
      <main className='flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl w-full'>{children}</div>
      </main>
    </div>
  );
}
