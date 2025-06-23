'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ReactDOM from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { Separator } from '@/components/ui/separator';

type Option = { label: string; value: string };

type Props = {
  options: Option[];
  placeholder?: string;
  defaultValues?: string[];
  lead?: React.ReactNode;
  loading?: boolean;
  onChange?: (values: string[]) => void;
};

export default function MultiSelect({
  options,
  defaultValues = [],
  placeholder,
  lead,
  loading,
  onChange,
}: Props) {
  const [selected, setSelected] = useState<string[]>(defaultValues);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [usePortal, setUsePortal] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const stopScroll = (e: WheelEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('wheel', stopScroll, { passive: true });
    return () => document.removeEventListener('wheel', stopScroll);
  }, [isOpen]);

  const openDropdown = () => {
    const inputRect = inputRef.current?.getBoundingClientRect();
    const wrapperRect = wrapperRef.current?.getBoundingClientRect();
    const dropdownHeight = 200;

    if (inputRect && wrapperRect) {
      const wouldBeClipped =
        inputRect.bottom + dropdownHeight > window.innerHeight ||
        wrapperRect.top < 0 ||
        wrapperRect.bottom > window.innerHeight;

      setUsePortal(wouldBeClipped);
      if (wouldBeClipped) {
        setDropdownPos({
          top: inputRect.bottom + window.scrollY,
          left: inputRect.left + window.scrollX,
          width: inputRect.width,
        });
      }
    }

    setIsOpen(true);
    setSearch('');
  };

  const toggleSelection = (value: string) => {
    const isSelected = selected.includes(value);
    const next = isSelected ? selected.filter((v) => v !== value) : [...selected, value];

    setSelected(next);
    onChange?.(next);
  };

  const clearSelection = () => {
    setSelected([]);
    onChange?.([]);
  };

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute bg-card rounded-md shadow max-h-[30vh] overflow-y-auto z-[999] w-fit',
        !usePortal && 'top-full',
        isOpen && 'rounded-t-none'
      )}
      style={
        usePortal
          ? {
              position: 'absolute',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }
          : undefined
      }
    >
      <div className="flex flex-col px-1 pt-1 sticky top-0 z-10 bg-card gap-1">
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Separator />
      </div>
      <div className="grid w-full">
        {loading ? (
          <Button disabled variant="ghost">
            Loading...
          </Button>
        ) : (
          filteredOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={selected.includes(opt.value) ? 'secondary' : 'ghost'}
              className="w-full justify-start text-left rounded-none"
              onClick={() => toggleSelection(opt.value)}
            >
              {selected.includes(opt.value) ? '✓ ' : ''} {opt.label}
            </Button>
          ))
        )}
      </div>
      <div className="flex flex-col sticky bottom-0 z-10 bg-card gap-1 justify-end p-1">
        <Separator />
        <Button variant="destructive" size="sm" onClick={clearSelection}>
          Clear
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div ref={wrapperRef} className="relative flex flex-col w-full z-[999]">
        <div className="flex w-full">
          {lead && (
            <div
              className={cn(
                'flex items-center bg-secondary rounded-md rounded-r-none px-2 py-1 text-sm',
                isOpen && 'rounded-b-none'
              )}
            >
              {lead}
            </div>
          )}
          <Input
            placeholder={
              selected.length > 0
                ? options
                    .filter((opt) => selected.includes(opt.value))
                    .map((opt) => opt.label)
                    .join(', ')
                : placeholder || 'Select...'
            }
            onClick={openDropdown}
            readOnly
            className={cn(isOpen && 'rounded-b-none', lead && 'rounded-l-none')}
            ref={inputRef}
          />
        </div>
        {!usePortal && isOpen && dropdownContent}
      </div>
      {usePortal && isOpen && typeof window !== 'undefined'
        ? ReactDOM.createPortal(dropdownContent, document.getElementById('search-portal')!)
        : null}
    </>
  );
}
