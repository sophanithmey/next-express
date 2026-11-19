'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { DropoffStop } from '../types/booking-types';
import {
  parseDropoffStopsFromFile,
  parseDropoffStopsFromText,
  downloadSampleDropoffCsvTemplate,
  downloadSampleDropoffXlsxTemplate,
  SAMPLE_DROPOFF_CSV,
} from '../services/bulk-order-parser';
import { MAX_DROPOFF_STOPS } from '@/lib/constants';

interface UseDropoffUploadProps {
  onApplyStops: (stops: DropoffStop[]) => void;
}

export function useDropoffUpload({ onApplyStops }: UseDropoffUploadProps) {
  const tBooking = useTranslations('Booking');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewStops = inputText.trim()
    ? parseDropoffStopsFromText(inputText)
    : [];

  const handleApplyImportedStops = useCallback(
    (stops: DropoffStop[], totalParsed: number, sourceName?: string) => {
      if (stops.length === 0) {
        toast.error(tBooking('dropoffNoValidStopsError'));
        return false;
      }

      onApplyStops(stops);
      setIsModalOpen(false);
      setInputText('');

      if (totalParsed > MAX_DROPOFF_STOPS) {
        toast.warning(
          tBooking('dropoffStopsTruncatedToast', {
            imported: stops.length,
            total: totalParsed,
            max: MAX_DROPOFF_STOPS,
          }),
        );
      } else {
        toast.success(
          tBooking('dropoffStopsImportedToast', {
            count: stops.length,
            fileName: sourceName || 'spreadsheet',
          }),
        );
      }
      return true;
    },
    [onApplyStops, tBooking],
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        setIsProcessing(true);
        const { stops, totalParsed } = await parseDropoffStopsFromFile(file);
        handleApplyImportedStops(stops, totalParsed, file.name);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : tBooking('bulkFileReadError');
        toast.error(message);
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [handleApplyImportedStops, tBooking],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void handleFileUpload(file);
      }
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        void handleFileUpload(file);
      }
    },
    [handleFileUpload],
  );

  const handleDownloadXlsx = useCallback(() => {
    void downloadSampleDropoffXlsxTemplate();
  }, []);

  const handleDownloadCsv = useCallback(() => {
    downloadSampleDropoffCsvTemplate();
  }, []);

  const handleLoadSample = useCallback(() => {
    setInputText(SAMPLE_DROPOFF_CSV);
  }, []);

  const handleApplyPreview = useCallback(() => {
    if (previewStops.length === 0) return;
    const total = parseDropoffStopsFromText(inputText).length;
    handleApplyImportedStops(previewStops, total, 'Pasted Text');
  }, [previewStops, inputText, handleApplyImportedStops]);

  return {
    isModalOpen,
    setIsModalOpen,
    isProcessing,
    isDragOver,
    inputText,
    setInputText,
    previewStops,
    fileInputRef,
    handleFileUpload,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDownloadXlsx,
    handleDownloadCsv,
    handleLoadSample,
    handleApplyPreview,
  };
}
