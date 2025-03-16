'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  field?: {
    onChange: (value: any) => void;
    value: Date | string | undefined;
  };
}

export function DateTimePicker({
  date,
  setDate,
  className,
  field,
}: DateTimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<{
    hours: string;
    minutes: string;
  }>({
    hours: date ? String(date.getHours()).padStart(2, '0') : '00',
    minutes: date ? String(date.getMinutes()).padStart(2, '0') : '00',
  });

  // Update the date when time changes
  React.useEffect(() => {
    if (
      date &&
      (selectedTime.hours !== String(date.getHours()).padStart(2, '0') ||
        selectedTime.minutes !== String(date.getMinutes()).padStart(2, '0'))
    ) {
      const newDate = new Date(date);
      newDate.setHours(Number.parseInt(selectedTime.hours));
      newDate.setMinutes(Number.parseInt(selectedTime.minutes));
      setDate(newDate);
    }
  }, [selectedTime, date, setDate]);

  // Update the time when date changes
  React.useEffect(() => {
    if (date) {
      setSelectedTime({
        hours: String(date.getHours()).padStart(2, '0'),
        minutes: String(date.getMinutes()).padStart(2, '0'),
      });
    }
  }, [date]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const hours = selectedTime.hours
        ? Number.parseInt(selectedTime.hours)
        : 0;
      const minutes = selectedTime.minutes
        ? Number.parseInt(selectedTime.minutes)
        : 0;

      const newDate = new Date(selectedDate);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);

      setDate(newDate);
      if (field?.onChange) {
        field.onChange(newDate);
      }
    } else {
      setDate(undefined);
      if (field?.onChange) {
        field.onChange(undefined);
      }
    }
  };

  // Update the handleTimeChange function to also call field.onChange if it exists
  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    setSelectedTime((prev) => ({
      ...prev,
      [type]: value,
    }));

    if (date) {
      const newDate = new Date(date);
      if (type === 'hours') {
        newDate.setHours(Number.parseInt(value));
      } else {
        newDate.setMinutes(Number.parseInt(value));
      }
      setDate(newDate);
      if (field?.onChange) {
        field.onChange(newDate);
      }
    } else if (value !== '') {
      // If no date is selected yet, create a new date
      const newDate = new Date();
      if (type === 'hours') {
        newDate.setHours(Number.parseInt(value));
        newDate.setMinutes(Number.parseInt(selectedTime.minutes));
      } else {
        newDate.setHours(Number.parseInt(selectedTime.hours));
        newDate.setMinutes(Number.parseInt(value));
      }
      setDate(newDate);
      if (field?.onChange) {
        field.onChange(newDate);
      }
    }
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, 'PPP HH:mm')
            ) : (
              <span>Pick a date and time</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
          <div className="border-t border-border p-3 flex justify-between">
            <div className="text-sm font-medium">Time:</div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedTime.hours}
                onValueChange={(value) => handleTimeChange('hours', value)}
              >
                <SelectTrigger className="w-16">
                  <SelectValue placeholder="Hours" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <SelectItem key={i} value={String(i).padStart(2, '0')}>
                      {String(i).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm">:</span>
              <Select
                value={selectedTime.minutes}
                onValueChange={(value) => handleTimeChange('minutes', value)}
              >
                <SelectTrigger className="w-16">
                  <SelectValue placeholder="Minutes" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }).map((_, i) => (
                    <SelectItem key={i} value={String(i).padStart(2, '0')}>
                      {String(i).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
