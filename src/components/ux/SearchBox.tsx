'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactDOM from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import SearchBar from '@/components/ux/SearchBar';

type Option = { label: string; value: string };

type Props = {
  options: Option[];
  placeholder?: string;
  defaultValue?: string;
  lead?: React.ReactNode;
  loading?: boolean;
  delay?: number;
  portal?: boolean;
  onSelect?: (value: string) => void;
  onSearch?: (search: string) => void;
};

export default function SearchBox({
  options,
  defaultValue,
  placeholder,
  lead,
  loading,
  delay = 1000,
  portal,
  onSelect,
  onSearch,
}: Props) {
  const [selected, setSelected] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [usePortal, setUsePortal] = useState(portal);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

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
      if (isOpen && dropdownRef.current?.contains(e.target as Node)) {
      } else {
        setIsOpen(false);
      }
    };
    document.addEventListener('wheel', stopScroll, { passive: true });
    return () => document.removeEventListener('wheel', stopScroll);
  }, [isOpen]);

  const openDropdown = () => {
    const inputRect = inputRef.current?.getBoundingClientRect();
    const wrapperRect = wrapperRef.current?.getBoundingClientRect();
    const dropdownHeight = 200; // Estimate your dropdown height in px

    if (inputRect && wrapperRect) {
      const wouldBeClipped =
        inputRect.bottom + dropdownHeight > window.innerHeight ||
        wrapperRect.top < 0 ||
        wrapperRect.bottom > window.innerHeight;

      if (!portal) {
        setUsePortal(wouldBeClipped);
        if (wouldBeClipped) {
          setDropdownPos({
            top: inputRect.bottom + window.scrollY,
            left: inputRect.left + window.scrollX,
            width: inputRect.width,
          });
        }
      } else {
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

  const handleSelect = (option: Option) => {
    setSelected(option.value);
    setSearch('');
    setIsOpen(false);
    onSelect?.(option.value);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSearch = useCallback(
    (e: string) => {
      if (onSearch) onSearch(e);
      setSearch(e.toLowerCase());
    },
    [onSearch] // only recreate if parent onSearch changes
  );

  const filteredOptions = options.filter((o) => o.label.toLowerCase().includes(search));

  const dropdownContent = (
    <div
      className={cn(
        'absolute bg-input rounded-md shadow max-h-[30vh] overflow-x-hidden overflow-y-auto z-[999] pointer-events-auto',
        !usePortal && 'top-full w-full',
        isOpen && 'rounded-t-none'
      )}
      ref={dropdownRef}
      style={
        usePortal
          ? {
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }
          : undefined
      }
    >
      {loading ? (
        <Button disabled variant="ghost">
          Loading...
        </Button>
      ) : (
        <div className="grid w-full z-[999]">
          {filteredOptions.map((opt) => (
            <Button
              key={opt.value}
              variant="ghost"
              className="w-full justify-start z-[999]"
              onClick={() => handleSelect(opt)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div ref={wrapperRef} className="relative flex flex-col w-full">
        <div className="flex w-full">
          <SearchBar
            placeholder={
              (selected && options.find((opt) => opt.value === selected)?.label) ||
              placeholder ||
              'Search...'
            }
            onSearch={handleSearch}
            className={cn(isOpen && 'rounded-b-none', lead && 'rounded-l-none')}
            onClick={openDropdown}
            delay={delay}
            lead={lead}
            leadClass={cn(isOpen && 'rounded-b-none!')}
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
