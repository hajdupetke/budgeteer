import { type ComponentProps } from 'react';
import { Input } from './input';

type CurrencyInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> & {
  field: {
    value: string;
    onChange: (value: string) => void;
    name: string;
    onBlur: () => void;
    ref: (element: HTMLInputElement | null) => void;
  };
  isInvalid: boolean;
};

export const CurrencyInput = ({ field, isInvalid, ...props }: CurrencyInputProps) => {
  return (
    <div className="relative">
      <Input
        placeholder="Amount"
        className="placeholder:text-slate-400 bg-white h-12 text-sm"
        aria-invalid={isInvalid}
        type="text"
        inputMode="decimal"
        {...props}
        {...field}
        // Keep the exact input for validation; never turn a negative amount into a positive one.
        onChange={(event) => field.onChange(event.target.value)}
      />
      <span className="absolute inset-y-1 right-3 flex items-center font-bold text-gray-400">
        EUR
      </span>
    </div>
  );
};
