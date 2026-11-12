import React from 'react';
import { authServerService } from '@/server/services/auth-server-service';
import { DashboardLayoutTemplate } from '@/components/templates/dashboard-layout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await authServerService.getCurrentUser().catch(() => null);

  return (
    <DashboardLayoutTemplate user={user}>{children}</DashboardLayoutTemplate>
  );
}
