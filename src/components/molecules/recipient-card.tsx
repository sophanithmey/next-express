import React from 'react';
import { User, Phone, MapPin, History } from 'lucide-react';
import { RecipientRecord } from '@/features/booking/types/booking-types';
import { cn } from '@/lib/cn';

interface RecipientCardProps {
  recipient: RecipientRecord;
  onSelect: (recipient: RecipientRecord) => void;
  className?: string;
}

export function RecipientCard({ recipient, onSelect, className }: RecipientCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(recipient)}
      className={cn(
        'group flex w-full flex-col items-start rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-brand-500 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20',
        className
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
            {recipient.name}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <History className="h-3 w-3" />
          <span>Recent</span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
        <Phone className="h-3 w-3 text-slate-400" />
        <span className="font-medium">{recipient.phoneNumber}</span>
      </div>

      {recipient.lastAddress && (
        <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-500 line-clamp-1">
          <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>{recipient.lastAddress}</span>
        </div>
      )}
    </button>
  );
}

