import { Input } from './input';

export const CurrencyInput = ({
  field,
  isInvalid,
}: {
  field: any;
  isInvalid: boolean;
}) => {
  return (
    <div className="relative">
      <Input
        placeholder="Amount"
        className="placeholder:text-slate-400 bg-white h-12 text-sm"
        aria-invalid={isInvalid}
        type="text"
        {...field}
        onChange={(e) => {
          let val = e.target.value;

          // If string is empty make the value 0
          if (val === '') {
            field.onChange('0');
            return;
          }

          // Replace all characters that are not digits or a decimal point with empty string
          val = val.replace(/[^\d.]/g, '');

          // Only one decimal point and only 2 digits after decimal point
          const numArr = val.split('.');
          if (numArr.length > 1)
            val = numArr[0] + '.' + numArr.slice(1).join('').substring(0, 2);

          // Handle leading 0's
          if (val.startsWith('0') && val.length > 1 && val[1] !== '.')
            val = val.substring(1);

          field.onChange(val);
        }}
        value={field.value}
      />
      <span className="absolute inset-y-1 right-3 flex items-center font-bold text-gray-400">
        EUR
      </span>
    </div>
  );
};
