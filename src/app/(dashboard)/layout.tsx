import React from 'react';
import { redirect } from 'next/navigation';
import { sessionService } from '@/server/auth/session-service';
import { DashboardLayoutTemplate } from '@/components/templates/dashboard-layout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await sessionService.getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  return <DashboardLayoutTemplate user={user}>{children}</DashboardLayoutTemplate>;
}
