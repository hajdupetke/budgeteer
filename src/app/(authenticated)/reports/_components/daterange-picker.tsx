'use client';

import { Popover } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { parseReportDateRange } from '@/lib/validation';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

interface DateRangePickerProps {
  className?: string;
  initialRange?: DateRange;
}

export const DateRangePicker = ({ className, initialRange }: DateRangePickerProps) => {
  const searchParams = useSearchParams();
  const serializedParams = searchParams.toString();
  const params = new URLSearchParams(serializedParams);
  const pathname = usePathname();
  const { replace } = useRouter();
  const startDate = params.get('startDate');
  const endDate = params.get('endDate');

  const validDate = (value: string | null) => {
    if (!value) return undefined;
    const parsed = parseReportDateRange(value ?? undefined, value ?? undefined);
    return parsed.success ? parsed.data.range?.start : undefined;
  };

  const [dateRange, setDateRange] = useState<DateRange>(initialRange ?? {
    from: validDate(startDate),
    to: validDate(endDate),
  });
  useEffect(() => {
    const next = new URLSearchParams(serializedParams);
    if (dateRange.from) next.set('startDate', dateRange.from.toISOString());
    else next.delete('startDate');
    if (dateRange.to) next.set('endDate', dateRange.to.toISOString());
    else next.delete('endDate');
    if (next.toString() !== serializedParams) replace(`${pathname}?${next.toString()}`);
  }, [dateRange, serializedParams, pathname, replace]);

  return (
    <div className={cn('grid-gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <CalendarIcon className="mr-2 size-4" />
            {dateRange?.from ? (
              dateRange?.to ? (
                <>
                  {format(dateRange.from, 'LLL dd y')} -{' '}
                  {format(dateRange.to, 'LLL dd y ')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border bg-white z-50"
          align="start"
        >
          <Calendar
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={(dateRange) => {
              if (dateRange) setDateRange(dateRange);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
