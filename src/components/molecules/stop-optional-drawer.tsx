'use client';

import React from 'react';
import { DropoffLocation, DropoffStop, RecipientInfo } from '@/features/booking/types/booking-types';
import { User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';
import { StopCodInput } from './stop-cod-input';
import { RiderNoteInput } from './rider-note-input';

interface StopOptionalDrawerProps {
  idPrefix: string;
  stop: DropoffStop;
  resolvedImage?: string;
  isCodOpen: boolean;
  isNameOpen: boolean;
  isNoteOpen: boolean;
  nameError?: string;
  codError?: string;
  onUpdate: (
    recipient: RecipientInfo,
    dropoff: DropoffLocation,
    codAmount?: number
  ) => void;
}

/**
 * Progressive-disclosure drawer rendering whichever optional stop fields
 * (COD, Recipient Name, Rider Note & Photo) are toggled open or contain errors.
 */
export function StopOptionalDrawer({
  idPrefix,
  stop,
  resolvedImage,
  isCodOpen,
  isNameOpen,
  isNoteOpen,
  nameError,
  codError,
  onUpdate,
}: StopOptionalDrawerProps) {
  const t = useTranslations('Recipient');

  if (!isCodOpen && !isNameOpen && !isNoteOpen) {
    return null;
  }

  const nameId = `${idPrefix}-name`;
  const codId = `${idPrefix}-cod`;
  const noteId = `${idPrefix}-note`;

  return (
    <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
      {(isCodOpen || isNameOpen) && (
        <div
          className={
            isCodOpen && isNameOpen
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
              : 'grid grid-cols-1 gap-3'
          }
        >
          {isCodOpen && (
            <div className={isNameOpen ? '' : 'sm:max-w-xs'}>
              <StopCodInput
                id={codId}
                value={stop.codAmount}
                onChange={(amount) =>
                  onUpdate(stop.recipient, stop.dropoff, amount)
                }
                error={codError}
              />
            </div>
          )}

          {isNameOpen && (
            <div className="space-y-1">
              <Label htmlFor={nameId} optional>
                {t('nameLabel')}
              </Label>
              <Input
                id={nameId}
                placeholder={t('namePlaceholder')}
                value={stop.recipient.name}
                onChange={(e) =>
                  onUpdate(
                    { ...stop.recipient, name: e.target.value },
                    stop.dropoff
                  )
                }
                leftIcon={<User className="h-4 w-4 text-slate-400" />}
                error={Boolean(nameError)}
                sizeVariant="md"
              />
              {nameError && (
                <p className="text-xs font-medium text-danger-600">{nameError}</p>
              )}
            </div>
          )}
        </div>
      )}

      {isNoteOpen && (
        <RiderNoteInput
          id={noteId}
          label={t('riderNote')}
          placeholder={t('riderNotePlaceholder')}
          noteValue={stop.recipient.notes || ''}
          imageValue={resolvedImage}
          onChangeNote={(note) =>
            onUpdate({ ...stop.recipient, notes: note }, stop.dropoff)
          }
          onChangeImage={(img) =>
            onUpdate({ ...stop.recipient, imageUrl: img }, stop.dropoff)
          }
        />
      )}
    </div>
  );
}

