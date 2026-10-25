'use client';

import { type ComponentProps } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DateTimePickerProps = Omit<ComponentProps<typeof Button>, 'value' | 'onChange'> & {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  field?: { onChange: (date: Date | undefined) => void; value: Date | string | undefined };
  isInvalid: boolean;
};

export function DateTimePicker({ date, setDate, field, isInvalid, ...props }: DateTimePickerProps) {
  const hours = String(date?.getHours() ?? 0).padStart(2, '0');
  const minutes = String(date?.getMinutes() ?? 0).padStart(2, '0');
  function update(next: Date | undefined) { setDate(next); field?.onChange(next); }
  function timeChange(part: 'hours' | 'minutes', value: string) {
    const next = new Date(date ?? new Date());
    if (part === 'hours') next.setHours(Number(value)); else next.setMinutes(Number(value));
    update(next);
  }
  return <Popover>
    <PopoverTrigger asChild><Button variant="outline" className="h-11 w-full justify-start" aria-invalid={isInvalid} {...props} type="button"><CalendarIcon data-icon="inline-start" />{date ? format(date, 'd MMM yyyy, HH:mm') : 'Pick a date and time'}</Button></PopoverTrigger>
    <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" align="start">
      <Calendar mode="single" selected={date} onSelect={(value) => {
        if (value) { const next = new Date(value); next.setHours(Number(hours), Number(minutes)); update(next); } else update(undefined);
      }} />
      <div className="flex items-center justify-between gap-3 border-t p-3"><span className="text-xs text-muted-foreground">Local time</span><div className="flex items-center gap-2">
        <Select value={hours} onValueChange={(value) => timeChange('hours', value)}><SelectTrigger aria-label="Hours" className="w-18"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{Array.from({ length: 24 }, (_, i) => <SelectItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</SelectItem>)}</SelectGroup></SelectContent></Select>
        <span aria-hidden="true">:</span>
        <Select value={minutes} onValueChange={(value) => timeChange('minutes', value)}><SelectTrigger aria-label="Minutes" className="w-18"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{Array.from({ length: 60 }, (_, i) => <SelectItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</SelectItem>)}</SelectGroup></SelectContent></Select>
      </div></div>
    </PopoverContent>
  </Popover>;
}
