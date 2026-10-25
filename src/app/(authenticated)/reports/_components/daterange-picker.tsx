'use client';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { calendarDate } from '@/lib/finance';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

function pickerDate(value: string | null) {
  if (!value) return undefined;
  try {
    const utc = calendarDate(value);
    // Calendar controls use local Dates; preserve the selected calendar day.
    return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
  } catch { return undefined; }
}

export const DateRangePicker = ({ className }: { className?: string }) => {
  const params = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const start = params.get('startDate');
  const end = params.get('endDate');
  const [range, setRange] = useState<DateRange | undefined>(() => ({ from: pickerDate(start), to: pickerDate(end) }));
  useEffect(() => { setRange({ from: pickerDate(start), to: pickerDate(end) }); }, [start, end]);

  function select(next: DateRange | undefined) {
    setRange(next);
    const query = new URLSearchParams(params);
    query.delete('startDate');
    query.delete('endDate');
    if (next?.from) query.set('startDate', format(next.from, 'yyyy-MM-dd'));
    if (next?.to) query.set('endDate', format(next.to, 'yyyy-MM-dd'));
    replace(query.size ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <CalendarIcon aria-hidden="true" />
            {range?.from ? `${format(range.from, 'LLL dd y')}${range.to ? ` – ${format(range.to, 'LLL dd y')}` : ''}` : 'Pick dates'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="range" defaultMonth={range?.from} selected={range} onSelect={select} numberOfMonths={1} />
        </PopoverContent>
      </Popover>
      {(start !== null || end !== null) && <Button variant="ghost" onClick={() => select(undefined)}>Clear dates</Button>}
    </div>
  );
};
