'use client';

import React from 'react';
import { ParcelInfo } from '@/features/booking/types/booking-types';
import { FormSection } from '../../molecules/form-section';
import { Input } from '../../atoms/input';
import { Label } from '../../atoms/label';
import { Package } from 'lucide-react';

interface ParcelSectionProps {
  parcel: ParcelInfo;
  onChangeParcel: (parcel: ParcelInfo) => void;
}

export function ParcelSection({ parcel, onChangeParcel }: ParcelSectionProps) {
  return (
    <FormSection
      number="C"
      title="Parcel Information"
      subtitle="Order tracking reference and package notes"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="parcel-ref">Parcel Number / Seller Order ID</Label>
          <Input
            id="parcel-ref"
            placeholder="e.g. LIVE-0914 or INV-1002"
            value={parcel.sellerOrderRef || ''}
            onChange={(e) =>
              onChangeParcel({ ...parcel, sellerOrderRef: e.target.value })
            }
            leftIcon={<Package className="h-4 w-4 text-slate-400" />}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="parcel-desc">Parcel Description (Optional)</Label>
          <Input
            id="parcel-desc"
            placeholder="e.g. Women dress, Skincare set"
            value={parcel.description || ''}
            onChange={(e) =>
              onChangeParcel({ ...parcel, description: e.target.value })
            }
          />
        </div>
      </div>
    </FormSection>
  );
}

