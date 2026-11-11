'use client';

import React, { useRef } from 'react';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';
import { FileText, Camera, X, Image as ImageIcon } from 'lucide-react';

interface RiderNoteInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  noteValue: string;
  imageValue?: string;
  onChangeNote: (note: string) => void;
  onChangeImage: (imageUrl?: string) => void;
}

export function RiderNoteInput({
  id,
  label = 'Rider Note',
  placeholder = 'e.g. Call before arrival, building entrance at back alley, house #12B',
  noteValue,
  imageValue,
  onChangeNote,
  onChangeImage,
}: RiderNoteInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64 data URL for instant client preview and payload transfer
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChangeImage(reader.result);
      }
    };
    reader.readAsDataURL(file);

    // Reset input value to allow re-uploading same file if desired
    e.target.value = '';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} optional>
          {label}
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            id={id}
            placeholder={placeholder}
            value={noteValue}
            onChange={(e) => onChangeNote(e.target.value)}
            leftIcon={<FileText className="h-4 w-4 text-slate-400" />}
            sizeVariant="sm"
          />
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-9 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-xs font-semibold text-slate-700 flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer shadow-2xs"
          title="Upload photo for courier"
        >
          <Camera className="h-3.5 w-3.5 text-brand-600" />
          <span className="hidden sm:inline">{imageValue ? 'Change Photo' : 'Photo'}</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload photo for rider note"
        />
      </div>

      {/* Image Preview Card */}
      {imageValue && (
        <div className="flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50/50 p-2 text-xs animate-in fade-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageValue}
            alt="Rider reference"
            className="h-10 w-10 rounded-lg object-cover border border-brand-200 shadow-2xs flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-brand-900 truncate text-[11px] flex items-center gap-1">
              <ImageIcon className="h-3 w-3 text-brand-600" />
              <span>Location photo attached for rider</span>
            </span>
            <span className="text-slate-500 text-[10px]">Helps courier find entrance quickly</span>
          </div>
          <button
            type="button"
            onClick={() => onChangeImage(undefined)}
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Remove photo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

