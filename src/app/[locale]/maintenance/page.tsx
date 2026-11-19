import { Metadata } from 'next';
import { getMaintenanceConfig } from '@/server/lib/maintenance';
import { SystemStatusPage } from '@/components/system-status/system-status-page';
import { LanguageSwitcher } from '@/components/molecules/language-switcher';

export const metadata: Metadata = {
  title: 'System Maintenance | WingExpress',
  description:
    "We're currently improving our platform to provide you with a better delivery experience. Please check back shortly.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  const config = getMaintenanceConfig();

  return (
    <main className='relative flex min-h-screen flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8'>
      {/* Top Language Toggle */}
      <div className='absolute top-4 right-4 sm:top-6 sm:right-6 z-10'>
        <LanguageSwitcher />
      </div>

      <SystemStatusPage
        variant='maintenance'
        estimatedCompletion={config.estimatedUntil}
        customNotice={config.customMessage}
      />
    </main>
  );
}
