'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

type Option = { label: string; value: string };

type Props = {
  options: Option[];
  placeholder?: string;
  defaultValues?: string[];
  lead?: React.ReactNode;
  loading?: boolean;
  onChange?: (values: string[]) => void;
  maxDisplayedBadges?: number;
  className?: string;
  disabled?: boolean;
};

export default function MultiSelect({
  options,
  defaultValues = [],
  placeholder = 'Select items...',
  lead,
  loading = false,
  onChange,
  maxDisplayedBadges = 3,
  className,
  disabled = false,
}: Props) {
  const [selected, setSelected] = useState<string[]>(defaultValues);
  const [open, setOpen] = useState(false);

  const handleSelect = (value: string) => {
    const isSelected = selected.includes(value);
    const newSelected = isSelected
      ? selected.filter((item) => item !== value)
      : [...selected, value];

    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const handleRemove = (value: string, event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    const newSelected = selected.filter((item) => item !== value);
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const handleClear = () => {
    setSelected([]);
    onChange?.([]);
  };

  const selectedOptions = options.filter((option) => selected.includes(option.value));
  const displayedBadges = selectedOptions.slice(0, maxDisplayedBadges);
  const hiddenCount = Math.max(0, selectedOptions.length - maxDisplayedBadges);

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between min-h-10 h-auto py-2',
              selected.length > 0 && 'px-2',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            disabled={disabled}
          >
            <div className="flex items-center w-full">
              {lead && (
                <div className="flex items-center bg-muted rounded px-2 py-1 mr-2 text-xs font-medium">
                  {lead}
                </div>
              )}

              <div className="flex items-center justify-start w-full">
                {selected.length === 0 ? (
                  <span className="text-muted-foreground font-normal">{placeholder}</span>
                ) : (
                  <div className="flex items-center gap-1 w-full overflow-hidden">
                    <ScrollArea className="w-full">
                      <div className="flex items-center gap-1">
                        {displayedBadges.map((option) => (
                          <Badge
                            key={option.value}
                            variant="secondary"
                            className="text-xs font-normal px-2 py-1 gap-2 flex-shrink-0"
                          >
                            {option.label}
                            <span
                              className="h-auto w-fit px-0.5! hover:bg-transparent"
                              onClick={(e) => handleRemove(option.value, e)}
                            >
                              <X className="h-3 rounded p-0.5" />
                            </span>
                          </Badge>
                        ))}
                        {hiddenCount > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal px-2 py-1 flex-shrink-0"
                          >
                            +{hiddenCount} more
                          </Badge>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>

            <ChevronDown
              className={cn(
                'ml-2 h-4 w-4 shrink-0 transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search options..." className="h-9" />
            <CommandList>
              <CommandEmpty>{loading ? 'Loading...' : 'No options found.'}</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-72">
                  {options.map((option) => {
                    const isSelected = selected.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option.value)}
                        className="cursor-pointer"
                        disabled={loading}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="flex-1">{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </ScrollArea>
              </CommandGroup>

              {selected.length > 0 && (
                <>
                  <Separator />
                  <CommandGroup>
                    <div className="p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        className="w-full text-xs"
                      >
                        Clear All ({selected.length})
                      </Button>
                    </div>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
