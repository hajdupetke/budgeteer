'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Button, buttonVariants } from './button';
import { X } from 'lucide-react';

export type MultiSelectOption = {
  value: any;
  label: string;
};

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selection: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  isInvalid?: boolean;
}

export const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  emptyMessage = 'No items found.',
  className,
  disabled = false,
  isInvalid,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        className={cn(
          'items-center dark:bg-zinc-200/30 border-zinc-200 flex h-12 w-full rounded-md border bg-transparent px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none md:text-sm dark:dark:bg-zinc-800/30 dark:border-zinc-800',
          'data-[state=open]:border-zinc-950 data-[state=open]:dark:border-zinc-300 data-[state=open]:ring-zinc-950/50 data-[state=open]:dark:ring-zinc-300/50 data-[state=open]:ring-[3px]',
          'focus-visible:border-zinc-950 focus-visible:ring-zinc-950/50 focus-visible:ring-[3px]',
          isInvalid
            ? 'border-red-500 data-[state=open]:ring-red-500/20 data-[state=open]:border-red-500 '
            : ''
        )}
        role="combobox"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <div className="flex flex-wrap gap-1">
          {selected.length > 0 ? (
            selected.map((item) => {
              const selectedOption = options.find(
                (option) => option.value === item
              );
              return (
                <Badge
                  key={item}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-xl"
                >
                  {selectedOption?.label}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(selectedOption?.value as string);
                    }}
                    className="cursor-pointer"
                  >
                    <X className="size-3" />
                  </div>
                </Badge>
              );
            })
          ) : (
            <span className="text-sm text-slate-400">{placeholder}</span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      {/* SVG that is a checkmark */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={cn(
                          'h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
