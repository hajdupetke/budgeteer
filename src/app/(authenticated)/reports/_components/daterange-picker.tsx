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
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

interface DateRangePickerProps {
  className?: string;
}

export const DateRangePicker = ({ className }: DateRangePickerProps) => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const pathname = usePathname();
  const { replace } = useRouter();
  const startDate = params.get('startDate');
  const endDate = params.get('endDate');

  const [dateRange, setDateRange] = useState<DateRange>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  });
  useEffect(() => {
    if (dateRange.from) params.set('startDate', dateRange.from.toISOString());
    if (dateRange.to) params.set('endDate', dateRange.to.toISOString());

    replace(`${pathname}?${params.toString()}`);
  }, [dateRange]);

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
