import React from 'react';
import { AppHeader } from '../organisms/app-header';
import { UserProfile } from '@/features/auth/types/auth-types';

interface DashboardLayoutTemplateProps {
  user: UserProfile | null;
  children: React.ReactNode;
}

export function DashboardLayoutTemplate({
  user,
  children,
}: DashboardLayoutTemplateProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60 antialiased">
      <AppHeader user={user} />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
