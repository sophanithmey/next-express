'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RecipientInfo, RecipientRecord } from '@/features/booking/types/booking-types';
import { User, Phone, Sparkles } from 'lucide-react';

interface RecipientInputGroupProps {
  recipient: RecipientInfo;
  onChangeRecipient: (recipient: RecipientInfo) => void;
  onAutofillAddress?: (address: string, coords: { lat: number; lng: number }) => void;
}

export function RecipientInputGroup({
  recipient,
  onChangeRecipient,
  onAutofillAddress,
}: RecipientInputGroupProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matches, setMatches] = useState<RecipientRecord[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    const q = recipient.phoneNumber || recipient.name;
    if (!q || q.length < 3) {
      setMatches([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/recipients?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const list = await res.json();
          setMatches(list.slice(0, 3));
        }
      } catch {
        setMatches([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [recipient.phoneNumber, recipient.name]);

  const handleSelect = (r: RecipientRecord) => {
    onChangeRecipient({
      ...recipient,
      name: r.name,
      phoneNumber: r.phoneNumber,
    });
    if (r.lastAddress && r.lastCoordinates && onAutofillAddress) {
      onAutofillAddress(r.lastAddress, r.lastCoordinates);
    }
    setShowSuggestions(false);
  };

  return (
    <div ref={ref} className="relative flex-1 p-3.5 hover:bg-slate-50/80 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[11px] font-semibold text-slate-400 tracking-tight uppercase leading-none">
          Recipient Customer
        </label>
        {matches.length > 0 && (
          <span className="text-brand-600 font-semibold flex items-center gap-1 text-[10px]">
            <Sparkles className="h-3 w-3" />
            <span>Autofill</span>
          </span>
        )}
      </div>

      {/* Primary Customer Name (Full Width, No Cramping) */}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={recipient.name}
          onChange={(e) => onChangeRecipient({ ...recipient, name: e.target.value })}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Recipient full name"
          className="w-full text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal focus:outline-none bg-transparent truncate"
        />
        <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
      </div>

      {/* Secondary Phone Number & Notes (Full Width, Clear Mono) */}
      <div className="flex items-center gap-1.5 mt-0.5">
        <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
        <input
          type="tel"
          value={recipient.phoneNumber}
          onChange={(e) => onChangeRecipient({ ...recipient, phoneNumber: e.target.value })}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Phone: 012 998 877"
          className="w-full text-xs font-semibold text-slate-600 font-mono placeholder:text-slate-300 placeholder:font-normal focus:outline-none bg-transparent truncate"
        />
      </div>

      {showSuggestions && matches.length > 0 && (
        <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-brand-200 bg-white p-2.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-800 uppercase tracking-wider px-2 py-1">
            <Sparkles className="h-3 w-3 text-brand-600" />
            <span>Frequent Customer Autofill</span>
          </div>
          <div className="space-y-1">
            {matches.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left p-2.5 rounded-xl text-xs hover:bg-brand-50 text-slate-800 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-brand-600" />
                    <span>{item.name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 pl-5 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{item.phoneNumber}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded-md">
                  Autofill
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

