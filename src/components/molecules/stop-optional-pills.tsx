'use client';

import React from 'react';
import { Banknote, User, FileText, Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { OptionalFieldPills, OptionalFieldPill } from './optional-field-pills';

interface StopOptionalPillsProps {
  codAmount?: number;
  recipientName?: string;
  hasNote: boolean;
  hasImage: boolean;
  showCod: boolean;
  showName: boolean;
  showNote: boolean;
  onToggleCod: () => void;
  onToggleName: () => void;
  onToggleNote: () => void;
}

/**
 * Compact one-tap toggle pills for optional per-stop fields (COD, Name, Note/Photo).
 * Displays filled values directly on the pill when collapsed.
 */
export function StopOptionalPills({
  codAmount,
  recipientName,
  hasNote,
  hasImage,
  showCod,
  showName,
  showNote,
  onToggleCod,
  onToggleName,
  onToggleNote,
}: StopOptionalPillsProps) {
  const tRecipient = useTranslations('Recipient');

  const hasCod = typeof codAmount === 'number' && codAmount > 0;
  const trimmedName = recipientName?.trim() || '';
  const hasName = Boolean(trimmedName);
  const hasAttachment = hasNote || hasImage;

  const pills: OptionalFieldPill[] = [
    {
      key: 'cod',
      label: hasCod
        ? tRecipient('stopCodTag', { amount: `$${codAmount.toFixed(2)}` })
        : tRecipient('addCodChip'),
      icon: <Banknote className="h-3.5 w-3.5 shrink-0" />,
      isOpen: showCod,
      hasValue: hasCod,
      filledClasses: 'border-primary-300 bg-primary-50 text-primary-900 hover:bg-primary-100/70',
      onToggle: onToggleCod,
    },
    {
      key: 'name',
      label: hasName ? trimmedName : tRecipient('addNameChip'),
      icon: <User className="h-3.5 w-3.5 shrink-0" />,
      isOpen: showName,
      hasValue: hasName,
      onToggle: onToggleName,
    },
    {
      key: 'note',
      label: hasAttachment ? tRecipient('noteChip') : tRecipient('addNoteChip'),
      icon: <FileText className="h-3.5 w-3.5 shrink-0" />,
      isOpen: showNote,
      hasValue: hasAttachment,
      extraBadge: hasImage ? <Camera className="h-3 w-3 shrink-0 text-brand-600" /> : undefined,
      onToggle: onToggleNote,
    },
  ];

  return <OptionalFieldPills pills={pills} />;
}
