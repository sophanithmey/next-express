import React from 'react';
import { cn } from '@/lib/cn';

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (!label) {
    return <hr className={cn('border-t border-slate-200 my-4', className)} />;
  }

  return (
    <div className={cn('relative my-4 flex items-center', className)}>
      <div className="flex-grow border-t border-slate-200" />
      <span className="mx-3 flex-shrink text-xs uppercase tracking-wider text-slate-400 font-medium">
        {label}
      </span>
      <div className="flex-grow border-t border-slate-200" />
    </div>
  );
}
