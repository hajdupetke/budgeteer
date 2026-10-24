import React from 'react';
import { Input } from './input';

export const CurrencyInput = ({ field, isInvalid }: {
  field: { value: string; onChange: (value: string) => void; name: string; onBlur: () => void; ref: React.Ref<HTMLInputElement> };
  isInvalid: boolean;
}) => (
  <div className="relative">
    <Input
      placeholder="0.00"
      className="placeholder:text-slate-400 bg-white h-12 text-sm"
      aria-invalid={isInvalid}
      inputMode="decimal"
      type="text"
      {...field}
      onChange={(event) => field.onChange(event.target.value)}
    />
    <span className="absolute inset-y-1 right-3 flex items-center font-bold text-gray-400">EUR</span>
  </div>
);
