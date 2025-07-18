// components/DataTableFilterText.tsx
'use client';

import MultiSelect from '@/components/shared/MultiSelect';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from '@/components/ui/select';
import {
  DataTableFilter,
  FilterOperation,
  FilterPrimitive,
  FilterPrimitiveTuple,
  FilterValue,
} from '@/types/data-table';
import { Equal, X, ChevronRight, ChevronLeft, List, Search } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

type Props<T> = {
  meta: DataTableFilter;
  fullKey: string;
  value: T;
  setPendingFilters: Dispatch<SetStateAction<Record<string, FilterValue>>>;
};

export function DataTableFilterText({
  meta,
  fullKey,
  value,
  setPendingFilters,
}: Props<string | undefined>) {
  return (
    <Input
      type="text"
      placeholder={meta.placeholder || 'Search...'}
      value={value || ''}
      onChange={(e) =>
        setPendingFilters((prev) => ({
          ...prev,
          [fullKey]: { op: 'lk', value: e.target.value },
        }))
      }
      className="w-full"
    />
  );
}

export function DataTableFilterBoolean({
  meta,
  fullKey,
  value,
  setPendingFilters,
}: Props<boolean>) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={fullKey}
        checked={value}
        onCheckedChange={(checked) =>
          setPendingFilters((prev) => ({
            ...prev,
            [fullKey]: { op: 'eq', value: checked as boolean },
          }))
        }
      />
      <Label htmlFor={fullKey} className="text-sm font-normal">
        {meta.label || 'Enabled'}
      </Label>
    </div>
  );
}

export function DataTableFilterSelect({
  meta,
  fullKey,
  value,
  setPendingFilters,
}: Props<string | undefined>) {
  if (!meta.options) return null;

  return (
    <Select
      value={value || ''}
      onValueChange={(selectedValue) =>
        setPendingFilters((prev) => ({
          ...prev,
          [fullKey]: { op: 'eq', value: selectedValue },
        }))
      }
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={meta.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {meta.options.map((opt, idx) => (
          <SelectItem key={idx} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DataTableFilterMultiSelect({
  meta,
  fullKey,
  value,
  setPendingFilters,
}: Props<string[] | undefined>) {
  if (!meta.options) return null;

  return (
    <MultiSelect
      className="w-full"
      options={meta.options}
      defaultValues={value}
      placeholder={meta.placeholder}
      maxDisplayedBadges={2}
      onChange={(selectedValues) =>
        setPendingFilters((prev) => ({
          ...prev,
          [fullKey]: { op: 'in', value: selectedValues },
        }))
      }
    />
  );
}

function DataTableOperatorSelect({
  onSelect,
  defaultValue,
  operations,
}: {
  onSelect: (op: FilterOperation) => void;
  defaultValue?: string;
  operations?: FilterOperation[];
}) {
  const availableOperations = operations || ['eq', 'gt', 'lt', 'bt'];

  const operatorLabels: Record<FilterOperation, { icon: React.ReactNode }> = {
    eq: { icon: <Equal className="w-4 h-4" /> },
    ne: { icon: <X className="w-4 h-4" /> },
    gt: { icon: <ChevronRight className="w-4 h-4" /> },
    lt: { icon: <ChevronLeft className="w-4 h-4" /> },
    bt: {
      icon: (
        <span className="flex">
          <ChevronLeft className="w-4 h-4" />
          <ChevronRight className="w-4 h-4" />
        </span>
      ),
    },
    in: { icon: <List className="w-4 h-4" /> },
    lk: { icon: <Search className="w-4 h-4" /> },
    nl: { icon: <Search className="w-4 h-4" /> },
    ct: { icon: <Search className="w-4 h-4" /> },
    nct: { icon: <Search className="w-4 h-4" /> },
    is: { icon: <X className="w-4 h-4" /> },
  };

  return (
    <Select
      onValueChange={(value) => onSelect(value as FilterOperation)}
      defaultValue={defaultValue || 'eq'}
    >
      <SelectTrigger className="w-fit rounded-r-none" noIcon>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableOperations.map((op) => (
          <SelectItem key={op} value={op}>
            <div className="flex items-center gap-2">{operatorLabels[op].icon}</div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DataTableFilterNumber({
  meta,
  fullKey,
  value,
  op,
  setPendingFilters,
}: Props<number | [number, number] | undefined> & { op: FilterOperation }) {
  const val = (value || [0, 0]) as FilterPrimitiveTuple;

  const update = (op: FilterOperation, v: FilterPrimitive | FilterPrimitiveTuple): void => {
    if (op === 'bt') {
      setPendingFilters((prev) => ({
        ...prev,
        [fullKey]: {
          op: 'bt',
          value: v as FilterPrimitiveTuple,
        },
      }));
      return;
    }

    setPendingFilters((prev) => ({
      ...prev,
      [fullKey]: {
        op,
        value: v as FilterPrimitive,
      },
    }));
  };

  return op === 'bt' ? (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <DataTableOperatorSelect
          defaultValue={op}
          onSelect={(op) => update(op, val)}
          operations={meta.operations}
        />
        <span className="text-sm text-muted-foreground">Between</span>
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Min"
          value={val[0] as number}
          onChange={(e) => update('bt', [Number(e.target.value), val[1] as number])}
          className="flex-1"
        />
        <Input
          type="number"
          placeholder="Max"
          value={val[1] as number}
          onChange={(e) => update('bt', [val[0] as number, Number(e.target.value)])}
          className="flex-1"
        />
      </div>
    </div>
  ) : (
    <div className="flex">
      <DataTableOperatorSelect
        defaultValue={op}
        onSelect={(op) => update(op, val)}
        operations={meta.operations}
      />
      <Input
        type="number"
        placeholder={meta.placeholder}
        value={value as number}
        onChange={(e) => update(op, Number(e.target.value))}
        className="flex-1 rounded-l-none"
      />
    </div>
  );
}

export function DataTableFilterDate({
  meta,
  fullKey,
  value,
  op,
  setPendingFilters,
}: Props<string | string[] | undefined> & { op: FilterOperation }) {
  const val = (value || ['', '']) as FilterPrimitiveTuple;

  const update = (op: FilterOperation, v: FilterPrimitive | FilterPrimitiveTuple): void => {
    if (op === 'bt') {
      setPendingFilters((prev) => ({
        ...prev,
        [fullKey]: {
          op: 'bt',
          value: v as FilterPrimitiveTuple,
        },
      }));
      return;
    }

    setPendingFilters((prev) => ({
      ...prev,
      [fullKey]: {
        op,
        value: v as FilterPrimitive,
      },
    }));
  };

  return op === 'bt' ? (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <DataTableOperatorSelect
          defaultValue={op}
          onSelect={(op) => update(op, val)}
          operations={meta.operations}
        />
        <span className="text-sm text-muted-foreground">Between</span>
      </div>
      <div className="flex gap-2">
        <Input
          type="date"
          placeholder="Start"
          value={val[0] as string}
          onChange={(e) => update('bt', [e.target.value, val[1] as string])}
          className="flex-1"
        />
        <Input
          type="date"
          placeholder="End"
          value={val[1] as string}
          onChange={(e) => update('bt', [val[0] as string, e.target.value])}
          className="flex-1"
        />
      </div>
    </div>
  ) : (
    <div className="flex">
      <DataTableOperatorSelect
        defaultValue={op}
        onSelect={(op) => update(op, val)}
        operations={meta.operations}
      />
      <Input
        type="date"
        placeholder={meta.placeholder}
        value={value as string}
        onChange={(e) => update(op, e.target.value)}
        className="flex-1 rounded-l-none"
      />
    </div>
  );
}
