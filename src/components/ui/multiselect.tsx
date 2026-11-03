'use client';

import { useState, type ComponentProps } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Badge } from './badge';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Check, ChevronDown, X } from 'lucide-react';

export type MultiSelectOption = { value: number; label: string };
type MultiSelectProps = Omit<ComponentProps<'button'>, 'onChange'> & {
  options: MultiSelectOption[];
  selected: number[];
  onChange: (selection: number[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  isInvalid?: boolean;
};

export function MultiSelect({ options, selected, onChange, placeholder = 'Select categories', emptyMessage = 'No categories found.', isInvalid, ...props }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  function toggle(value: number) { onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]); }
  return <div className="flex min-w-0 flex-col gap-2">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button variant="outline" role="combobox" aria-expanded={open} aria-invalid={isInvalid} className="h-11 w-full justify-between" {...props} type="button"><span className="truncate">{selected.length ? `${selected.length} ${selected.length === 1 ? 'category' : 'categories'} selected` : placeholder}</span><ChevronDown /></Button></PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command><CommandInput placeholder="Find a category…" /><CommandList><CommandEmpty>{emptyMessage}</CommandEmpty><CommandGroup>
          {options.map((option) => <CommandItem key={option.value} value={`${option.label} ${option.value}`} onSelect={() => toggle(option.value)}>
            <span className="flex size-4 items-center justify-center">{selected.includes(option.value) && <Check className="size-4" aria-hidden="true" />}</span><span className="truncate">{option.label}</span><span className="sr-only">{selected.includes(option.value) ? 'selected' : 'not selected'}</span>
          </CommandItem>)}
        </CommandGroup></CommandList></Command>
      </PopoverContent>
    </Popover>
    {selected.length > 0 && <ul className="flex flex-wrap gap-2" aria-label="Selected categories">
      {selected.map((value) => {
        const name = options.find((option) => option.value === value)?.label ?? 'Unavailable category';
        return <li key={value} className="min-w-0 max-w-full"><Badge variant="secondary" className="max-w-full gap-1.5"><span className="truncate">{name}</span><button type="button" aria-label={`Remove ${name}`} onClick={() => toggle(value)} className="shrink-0 rounded-sm p-1"><X className="size-3" aria-hidden="true" /></button></Badge></li>;
      })}
    </ul>}
  </div>;
}
