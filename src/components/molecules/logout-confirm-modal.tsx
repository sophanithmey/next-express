'use client';

import React from 'react';
import { LogOut, X } from 'lucide-react';
import { Button } from '@/components/atoms/button';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger-50 text-danger-600 border border-danger-100">
            <LogOut className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 id="logout-title" className="text-base font-bold text-slate-900">
            Log out of account?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to end your current seller session? You can sign back in anytime with your phone number and PIN.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className="bg-danger-600 hover:bg-danger-700 text-white font-bold rounded-xl px-4 shadow-xs"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}

