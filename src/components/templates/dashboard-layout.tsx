import React from 'react';
import { AppHeader } from '../organisms/app-header';
import { AppSidebar } from '../organisms/app-sidebar';
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
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <AppHeader user={user} />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

