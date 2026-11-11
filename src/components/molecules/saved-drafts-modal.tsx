'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  SavedBookingDraft,
  deleteApiBookingDraft,
  deleteUserBookingDraft,
} from '@/features/booking/services/booking-draft-service';
import { Button } from '../atoms/button';
import { X, FileText, Trash2, ArrowRight, Clock, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SavedDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: SavedBookingDraft[];
  onResumeDraft: (draft: SavedBookingDraft) => void;
  onDraftDeleted: () => void;
}

export function SavedDraftsModal({
  isOpen,
  onClose,
  drafts,
  onResumeDraft,
  onDraftDeleted,
}: SavedDraftsModalProps) {
  const t = useTranslations('Booking');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async (draft: SavedBookingDraft) => {
    if (deletingId) return;
    setDeletingId(draft.id);
    try {
      if (draft.source === 'api' || draft.orderId) {
        await deleteApiBookingDraft(draft.orderId || draft.id, locale);
      }
      deleteUserBookingDraft(draft.id);
      onDraftDeleted();
      toast.info(t('draftDeletedBanner'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete draft');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDraftDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return t('draftDateFallback');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl sm:max-w-xl lg:max-w-2xl max-h-[90vh] min-h-[480px] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t('savedDraftsModalTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('savedDraftsCount', { count: drafts.length })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label={t('closeDraftsAria')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {drafts.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FileText className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                {t('noSavedDraftsTitle')}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {t('noSavedDraftsDesc')}
              </p>
            </div>
          ) : (
            drafts.map((draft) => {
              const origin = draft.formData.pickup?.address || t('defaultPickupOrigin');
              const dest = draft.formData.dropoff?.address || t('defaultDropoffAddress');
              const recipientName = draft.formData.recipient?.name;
              const recipientPhone = draft.formData.recipient?.phoneNumber;

              return (
                <div
                  key={draft.id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 hover:border-brand-300 hover:shadow-xs transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {draft.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDraftDate(draft.updatedAt || draft.createdAt)}</span>
                        </span>
                        {recipientPhone && (
                          <span>
                            • {recipientName ? `${recipientName} ` : ''}({recipientPhone})
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={deletingId === draft.id}
                      onClick={() => void handleDelete(draft)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer shrink-0 disabled:opacity-50"
                      title={t('deleteDraftTitle')}
                    >
                      {deletingId === draft.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate max-w-[65%]">
                      <MapPin className="h-3 w-3 text-brand-600 shrink-0" />
                      <span className="truncate">{origin.split(',')[0]} → {dest.split(',')[0]}</span>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => onResumeDraft(draft)}
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      {t('resumeDraft')}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-5 sm:px-6 py-3.5 bg-slate-50/70 flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {tCommon('close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
