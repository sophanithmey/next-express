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
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md">
          <Truck className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 max-w-sm mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}

