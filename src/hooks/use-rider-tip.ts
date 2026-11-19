'use client';

import { useState } from 'react';

const MAX_CUSTOM_TIP = 100;

interface UseRiderTipProps {
  tipAmount: number;
  onChangeTip: (amount: number) => void;
}

export function useRiderTip({ tipAmount, onChangeTip }: UseRiderTipProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const isPresetSelected = (amount: number) => !isCustomMode && tipAmount === amount;
  const isNoTipSelected = !isCustomMode && tipAmount === 0;

  const handleSelectNoTip = () => {
    setIsCustomMode(false);
    setCustomInput('');
    onChangeTip(0);
  };

  const handleSelectPreset = (amount: number) => {
    setIsCustomMode(false);
    setCustomInput('');
    onChangeTip(amount);
  };

  const handleOpenCustom = () => {
    setIsCustomMode(true);
    if (tipAmount > 0) {
      setCustomInput(String(tipAmount));
    }
  };

  const handleCustomChange = (raw: string) => {
    // Allow numbers and single decimal point with up to 2 decimals
    if (raw !== '' && !/^\d*\.?\d{0,2}$/.test(raw)) {
      return;
    }
    setCustomInput(raw);

    if (raw === '' || raw === '.') {
      onChangeTip(0);
      return;
    }

    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.min(MAX_CUSTOM_TIP, Math.max(0, parsed));
      onChangeTip(Math.round(clamped * 100) / 100);
    }
  };

  return {
    isCustomMode,
    customInput,
    isPresetSelected,
    isNoTipSelected,
    handleSelectNoTip,
    handleSelectPreset,
    handleOpenCustom,
    handleCustomChange,
  };
}
