'use client';

import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type Props = {
  delay?: number;
  onSearch?: (query: string) => void;
  lead?: React.ReactNode;
  placeholder?: string;
} & React.ComponentProps<typeof Input>;

export default function SearchBar({ delay = 1000, onSearch, lead, placeholder, ...props }: Props) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, delay);

  useEffect(() => {
    onSearch?.(debouncedQuery); // ← no dependency on onSearch
  }, [debouncedQuery]); // ← this is key

  return (
    <div className="flex w-full">
      {lead && (
        <div
          className={cn(
            'flex flex-col bg-secondary rounded-md rounded-r-none w-fit px-2 py-1 items-center justify-center text-sm'
          )}
        >
          {lead}
        </div>
      )}
      <Input
        type="search"
        placeholder={placeholder || 'Search...'}
        className={cn(lead && 'rounded-l-none')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        {...props}
      />
    </div>
  );
}
