import React from 'react';
import { Input, InputProps } from '../atoms/input';
import { Phone } from 'lucide-react';

export interface PhoneInputProps extends Omit<InputProps, 'leftIcon'> {
  countryCode?: string;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ countryCode = '+855', className, ...props }, ref) => {
    return (
      <div className="relative flex w-full items-center">
        <div className="absolute left-3 z-10 flex items-center gap-1.5 border-r border-slate-200 pr-2 text-xs font-semibold text-slate-600">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{countryCode}</span>
        </div>
        <Input
          ref={ref}
          type="tel"
          className="pl-20"
          placeholder="12 345 678"
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
