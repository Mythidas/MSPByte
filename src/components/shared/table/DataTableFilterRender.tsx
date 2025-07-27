// components/DataTableFilterText.tsx
'use client';

import DatePicker from '@/components/shared/DatePicker';
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
  FilterOperations,
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
          [fullKey]: { op: 'ilike', value: e.target.value },
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
  FilterOperations,
}: {
  onSelect: (op: FilterOperations) => void;
  defaultValue?: string;
  FilterOperations?: FilterOperations[];
}) {
  const availableFilterOperations = FilterOperations || ['eq', 'gt', 'lt', 'bt'];

  const operatorLabels: Record<FilterOperations, { icon: React.ReactNode }> = {
    eq: { icon: <Equal className="w-4 h-4" /> },
    neq: { icon: <X className="w-4 h-4" /> },
    gt: { icon: <ChevronRight className="w-4 h-4" /> },
    gte: {
      icon: (
        <span className="flex">
          <ChevronRight className="w-4 h-4" />
          <Equal className="w-4 h-4" />
        </span>
      ),
    },
    lt: { icon: <ChevronRight className="w-4 h-4" /> },
    lte: {
      icon: (
        <span className="flex">
          <ChevronLeft className="w-4 h-4" />
          <Equal className="w-4 h-4" />
        </span>
      ),
    },
    bt: {
      icon: (
        <span className="flex">
          <ChevronLeft className="w-4 h-4" />
          <ChevronRight className="w-4 h-4" />
        </span>
      ),
    },
    in: { icon: <List className="w-4 h-4" /> },
    like: { icon: <Search className="w-4 h-4" /> },
    ilike: { icon: <Search className="w-4 h-4" /> },
    is: { icon: <Equal className="w-4 h-4" /> },
    not: { icon: <X className="w-4 h-4" /> },
  };

  return (
    <Select
      onValueChange={(value) => onSelect(value as FilterOperations)}
      defaultValue={defaultValue || 'eq'}
    >
      <SelectTrigger className="w-fit rounded-r-none" noIcon>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableFilterOperations.map((op) => (
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
}: Props<number | [number, number] | undefined> & { op: FilterOperations }) {
  const val = (value || [0, 0]) as FilterPrimitiveTuple;

  const update = (op: FilterOperations, v: FilterPrimitive | FilterPrimitiveTuple): void => {
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
          FilterOperations={meta.operations}
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
        defaultValue={op || 'eq'}
        onSelect={(op) => update(op, val)}
        FilterOperations={meta.operations}
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
}: Props<string | string[] | undefined> & { op: FilterOperations }) {
  const val = (value || ['', '']) as FilterPrimitiveTuple;

  const update = (op: FilterOperations, v: FilterPrimitive | FilterPrimitiveTuple): void => {
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
          FilterOperations={meta.operations}
        />
        <span className="text-sm text-muted-foreground">Between</span>
      </div>
      <div className="flex gap-2">
        <DatePicker
          value={val[0] as string}
          onChange={(date) => update('bt', [date, val[1] as string])}
          placeholder="Start date"
          className="flex-1"
        />
        <DatePicker
          value={val[1] as string}
          onChange={(date) => update('bt', [val[0] as string, date])}
          placeholder="End date"
          className="flex-1"
        />
      </div>
    </div>
  ) : (
    <div className="flex">
      <DataTableOperatorSelect
        defaultValue={op}
        onSelect={(op) => update(op, val)}
        FilterOperations={meta.operations}
      />
      <DatePicker
        value={value as string}
        onChange={(date) => update(op, date)}
        placeholder={meta.placeholder}
        className="flex-1 rounded-l-none"
      />
    </div>
  );
}
