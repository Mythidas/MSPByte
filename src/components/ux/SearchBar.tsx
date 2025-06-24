'use client';

import { Input } from '@/components/ui/input';
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
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timeout);
  }, [query, delay]);

  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

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
