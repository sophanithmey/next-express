import React from 'react';
import { Input, InputProps } from '../atoms/input';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onClear, onChange, ...props }, ref) => {
    const hasValue = Boolean(value);

    return (
      <Input
        ref={ref}
        value={value}
        onChange={onChange}
        leftIcon={<Search className="w-4 h-4" />}
        rightIcon={
          hasValue && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="text-slate-400 hover:text-slate-600 transition-colors pointer-events-auto"
            >
              <X className="w-4 h-4" />
            </button>
          ) : undefined
        }
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

