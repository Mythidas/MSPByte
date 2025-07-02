'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SearchBar from '@/components/common/SearchBar';
import { cn } from '@/lib/utils';

type Option = { label: string; value: string };

type Props = {
  options: Option[];
  placeholder?: string;
  defaultValue?: string;
  lead?: React.ReactNode;
  loading?: boolean;
  delay?: number;
  onSelect?: (value: string) => void;
  onSearch?: (search: string) => void;
};

export default function SearchBox({
  options,
  defaultValue,
  placeholder,
  lead,
  loading,
  delay = 0,
  onSelect,
  onSearch,
}: Props) {
  const [selected, setSelected] = useState(defaultValue);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

  const handleSelect = (option: Option) => {
    setSelected(option.value);
    setSearch('');
    setIsOpen(false);
    onSelect?.(option.value);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSearch = useCallback(
    (value: string) => {
      if (onSearch) onSearch(value);
      setSearch(value.toLowerCase());
    },
    [onSearch]
  );

  const filteredOptions = options.filter((o) => o.label.toLowerCase().includes(search));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <SearchBar
            placeholder={
              (selected && options.find((opt) => opt.value === selected)?.label) ||
              placeholder ||
              'Search...'
            }
            onSearch={handleSearch}
            className={cn(lead && 'rounded-l-none')}
            delay={delay}
            lead={lead}
            defaultValue={defaultValue}
            ref={inputRef}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start" // ensures alignment to the left
        className="w-[--radix-popover-trigger-width] p-0 max-h-[30vh] overflow-y-auto"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {loading ? (
          <Button disabled variant="ghost" className="w-full">
            Loading...
          </Button>
        ) : (
          <div className="grid w-full">
            {filteredOptions.map((opt) => (
              <Button
                key={opt.value}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
