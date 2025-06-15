'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
  options: { label: string, value: string }[];
  placeholder?: string;
  lead?: React.ReactNode;
  onSelect?: (value: string) => void;
}

export default function SearchBox({ options, placeholder, lead, onSelect }: Props) {
  const [selected, setSelected] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSelect = (option: { label: string, value: string }) => {
    setSelected(option.value);
    setSearch('');
    setIsOpen(false);
    onSelect && onSelect(option.value);
  }

  return (
    <div className="relative flex flex-col w-full">
      <div className="flex w-full">
        {lead && <div className={cn("flex flex-col bg-secondary rounded-md rounded-r-none w-fit px-2 py-1 items-center justify-center text-sm", isOpen && 'rounded-b-none')}>
          {lead}
        </div>}
        <Input
          placeholder={(selected && options.find((opt) => opt.value === selected)?.label) || placeholder || "Search..."}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
          value={search}
          className={cn(isOpen && "rounded-b-none z-[51]", lead && 'rounded-l-none')}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => {
              setIsOpen(false);
              setSearch('');
            }, 100);
          }}
        />
      </div>

      <div className={cn((!isOpen && 'hidden'), "absolute top-full z-50 w-full bg-card rounded-md rounded-t-none shadow")}>
        <ScrollArea className="flex items-start overflow-auto max-h-[30vh]">
          {options
            .filter((o) => o.label.toLowerCase().includes(search))
            .map((opt) => (
              <Button
                key={opt.value}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </Button>
            ))}
        </ScrollArea>
      </div>
    </div>
  );
}