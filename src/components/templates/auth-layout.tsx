import React from 'react';
import { Truck } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-600 text-white shadow-md">
          <Truck className="h-7 w-7 text-primary-400" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-1.5 text-center text-sm text-slate-500 max-w-md mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="rounded-3xl border border-slate-200/90 bg-white px-8 py-10 shadow-lg sm:px-12">
          {children}
        </div>
      </div>
    </div>
  );
}

