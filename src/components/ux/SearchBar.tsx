'use client';

import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

type Props = {
  delay?: number;
  onSearch?: (query: string) => void;
} & React.ComponentProps<typeof Input>;

export default function SearchBar({ delay = 1000, onSearch, ...props }: Props) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    onSearch && onSearch(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <Input
      type="search"
      placeholder="Search..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      {...props}
    />
  );
}
