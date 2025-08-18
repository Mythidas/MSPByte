'use client';

import { useState } from 'react';
import { PenLine, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Option } from '@/shared/types';

type Props = {
  defaultValue: string;
  options: Option[];
  onChange?: (e: string) => void;
  disabled?: boolean;
};

export default function EditableSelect({ defaultValue, options, onChange, disabled }: Props) {
  const [value, setValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleReset = () => {
    setIsEditing(false);
    setValue('');
  };

  const handleChange = (e: string) => {
    setValue(e);
    if (onChange) onChange(e);
    setIsEditing(false);
  };

  const body = () => {
    if (isEditing) {
      return (
        <Select
          defaultValue={defaultValue}
          onValueChange={handleChange}
          onOpenChange={(open) => {
            if (!open) {
              // Wait a tick to allow value selection to happen first
              setTimeout(() => {
                // Only exit edit mode if no value change happened
                setIsEditing(false);
              }, 200);
            }
          }}
        >
          <SelectTrigger autoFocus>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt, idx) => {
              return (
                <SelectItem key={idx} value={opt.value}>
                  {opt.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );
    }

    return (
      <>
        <span>{value || options.find((opt) => opt.value === defaultValue)?.label}</span>
        {!!value && value !== defaultValue && (
          <Button
            variant="none"
            hidden={disabled}
            className={cn('w-8 h-4 p-0')}
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 text-red-500" />
          </Button>
        )}
        <Button
          variant="none"
          hidden={disabled}
          className={cn('w-8 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity')}
          onClick={() => setIsEditing(true)}
        >
          <PenLine className="w-4 h-4 text-muted-foreground" />
        </Button>
      </>
    );
  };

  return <span className="flex items-center h-fit group">{body()}</span>;
}
