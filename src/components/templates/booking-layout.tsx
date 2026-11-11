import React from 'react';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';

interface BookingLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function BookingLayout({
  title,
  subtitle,
  children,
}: BookingLayoutProps) {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between border-b border-slate-200 pb-4'>
        <div className='flex items-center gap-2'>
          <Link
            href='/bookings'
            className='rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition'
            title='Return to Bookings'
          >
            <ArrowLeft className='h-5 w-5' />
          </Link>
          <h1 className='text-xl font-bold tracking-tight text-slate-900'>
            {title}
          </h1>
        </div>
        <p className='mt-1 text-xs text-slate-500 pl-8'>{subtitle}</p>
      </div>

      <div>{children}</div>
    </div>
  );
}
