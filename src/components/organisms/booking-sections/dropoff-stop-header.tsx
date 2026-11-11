'use client';

import React from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DropoffStopHeaderProps {
  index: number;
  recipientName?: string;
  codAmount?: number;
  summaryText?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemoveStop: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function DropoffStopHeader({
  index,
  recipientName,
  codAmount,
  summaryText,
  isCollapsed = false,
  onToggleCollapse,
  onRemoveStop,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: DropoffStopHeaderProps) {
  const tRecipient = useTranslations('Recipient');
  const tCommon = useTranslations('Common');
  const tBooking = useTranslations('Booking');

  return (
    <div
      className={`flex items-center justify-between transition-all ${
        !isCollapsed ? 'border-b border-slate-200/80 pb-2.5' : ''
      }`}
    >
      {/* Title & Clickable Collapse Zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleCollapse}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleCollapse?.();
          }
        }}
        className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0 pr-2"
      >
        {/* Drag Handle */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="drag-handle touch-none shrink-0 flex items-center justify-center p-1 -ml-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded cursor-grab active:cursor-grabbing transition"
          title={tBooking('dragToReorder')}
          aria-label={tBooking('dragToReorder')}
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Index badge & destination label */}
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white font-mono shadow-2xs">
          {index + 1}
        </div>

        <div className="min-w-0 truncate">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 truncate">
              {tRecipient('destinationIndex', { index: index + 1 })}
              {recipientName ? ` — ${recipientName}` : ''}
            </span>
            {typeof codAmount === 'number' && codAmount > 0 && (
              <span className="shrink-0 rounded border border-primary-200 bg-primary-50 px-1.5 py-0.2 font-mono text-[10px] font-bold text-primary-900">
                ${codAmount.toFixed(2)}
              </span>
            )}
          </div>
          {isCollapsed && summaryText && (
            <p className="text-[11px] text-slate-500 truncate font-normal">
              {summaryText}
            </p>
          )}
        </div>
      </div>

      <div className="no-drag flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Accessible Move Up / Down */}
        {(onMoveUp || onMoveDown) && (
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200/70 shadow-2xs">
            <button
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
              className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer"
              title={tRecipient('moveUp')}
              aria-label={tRecipient('moveUp')}
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={onMoveDown}
              className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 transition cursor-pointer"
              title={tRecipient('moveDown')}
              aria-label={tRecipient('moveDown')}
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onRemoveStop}
          className="text-[11px] font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:bg-rose-50 px-1.5 py-0.5 rounded transition cursor-pointer"
          aria-label={tRecipient('destinationIndex', { index: index + 1 })}
        >
          <Trash2 className="h-3 w-3" />
          <span>{tCommon('remove')}</span>
        </button>

        {/* Dedicated Collapse / Expand Chevron */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title={isCollapsed ? tRecipient('expandStop') : tRecipient('collapseStop')}
            aria-label={isCollapsed ? tRecipient('expandStop') : tRecipient('collapseStop')}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
