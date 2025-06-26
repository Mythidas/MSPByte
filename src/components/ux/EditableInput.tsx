'use client';

import { useRef, useState } from 'react';
import { PenLine, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
  defaultValue: string;
  onChange?: (e: string) => void;
  disabled?: boolean;
};

export default function EditableInput({ defaultValue, onChange, disabled }: Props) {
  const [value, setValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    if (ref.current) ref.current.value = defaultValue;
    setIsEditing(false);
    setValue('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  const body = () => {
    if (isEditing) {
      return (
        <Input
          autoFocus
          onBlur={() => setIsEditing(false)}
          defaultValue={value || defaultValue}
          onChange={handleChange}
          ref={ref}
        />
      );
    }

    return (
      <>
        <span>{value || defaultValue}</span>
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
