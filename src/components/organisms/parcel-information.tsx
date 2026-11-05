'use client';

import React from 'react';
import { ParcelInfo } from '@/features/booking/types/booking-types';
import { FormField } from '../molecules/form-field';
import { Input } from '../atoms/input';
import { Package, Hash } from 'lucide-react';

interface ParcelInformationProps {
  parcel: ParcelInfo;
  onChangeParcel: (parcel: ParcelInfo) => void;
}

export function ParcelInformation({
  parcel,
  onChangeParcel,
}: ParcelInformationProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Parcel & Package Information</h3>
        <p className="text-xs text-slate-500">
          Enter item details and internal seller order codes for easy tracking
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Seller Order Reference / Code"
            hint="Useful for matching your Facebook Live or store order"
          >
            <Input
              value={parcel.sellerOrderRef || ''}
              onChange={(e) =>
                onChangeParcel({ ...parcel, sellerOrderRef: e.target.value })
              }
              placeholder="e.g., LIVE-2041 or INV-0045"
              leftIcon={<Hash className="h-4 w-4" />}
            />
          </FormField>

          <FormField label="Item Quantity">
            <Input
              type="number"
              min={1}
              value={parcel.quantity || 1}
              onChange={(e) =>
                onChangeParcel({
                  ...parcel,
                  quantity: parseInt(e.target.value, 10) || 1,
                })
              }
              placeholder="1"
            />
          </FormField>
        </div>

        <FormField label="Parcel Item Description">
          <Input
            value={parcel.description || ''}
            onChange={(e) =>
              onChangeParcel({ ...parcel, description: e.target.value })
            }
            placeholder="e.g., Clothes (2 dresses), Beauty cosmetics, Electronic charger"
            leftIcon={<Package className="h-4 w-4" />}
          />
        </FormField>

        <FormField label="Special Handling Instructions (Optional)">
          <Input
            value={parcel.instructions || ''}
            onChange={(e) =>
              onChangeParcel({ ...parcel, instructions: e.target.value })
            }
            placeholder="e.g., Fragile, handle with care, do not bend"
          />
        </FormField>
      </div>
    </div>
  );
}
