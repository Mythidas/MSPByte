// components/DataTableFilterText.tsx
'use client';

import SearchBox from '@/shared/components/SearchBox';
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
import { FilterValue, FilterOperations, FilterPrimitiveTuple, FilterPrimitive } from '@/types/db';
import { subDays } from 'date-fns';
import { Equal, X, ChevronRight, ChevronLeft, List, Search } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { DataTableFilter } from '@/features/data-table/types/table';
import DatePicker from '@/shared/components/DatePicker';
import MultiSelect from '@/shared/components/MultiSelect';

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
          [fullKey]: {
            op: meta.operations ? (meta.operations[0] as any) : 'ilike',
            value: e.target.value,
          },
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
            [fullKey]: {
              op: meta.operations ? (meta.operations[0] as any) : 'eq',
              value: checked as boolean,
            },
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
  setPendingFilters,
}: Props<string | undefined>) {
  if (!meta.options) return null;

  return (
    <SearchBox
      placeholder={meta.placeholder}
      options={meta.options}
      onSelect={(selectedValue) =>
        setPendingFilters((prev) => ({
          ...prev,
          [fullKey]: {
            op: meta.operations ? (meta.operations[0] as any) : 'eq',
            value: selectedValue,
          },
        }))
      }
    />
  );
}

export function DataTableFilterMultiSelect({
  meta,
  fullKey,
  value,
  setPendingFilters,
}: Props<string[] | undefined>) {
  if (!meta.options) return null;
  const trueValue = value ? (Array.isArray(value) ? value : [String(value)]) : [];

  return (
    <MultiSelect
      className="w-full"
      options={meta.options}
      defaultValues={trueValue}
      placeholder={meta.placeholder}
      maxDisplayedBadges={2}
      onChange={(selectedValues) =>
        setPendingFilters((prev) => ({
          ...prev,
          [fullKey]: {
            op: meta.operations ? (meta.operations[0] as any) : 'in',
            value: selectedValues,
          },
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
    cs: {
      icon: undefined,
    },
    cd: {
      icon: undefined,
    },
    'not.eq': {
      icon: undefined,
    },
    'not.neq': {
      icon: undefined,
    },
    'not.gt': {
      icon: undefined,
    },
    'not.gte': {
      icon: undefined,
    },
    'not.lt': {
      icon: undefined,
    },
    'not.lte': {
      icon: undefined,
    },
    'not.like': {
      icon: undefined,
    },
    'not.ilike': {
      icon: undefined,
    },
    'not.is': {
      icon: undefined,
    },
    'not.in': {
      icon: undefined,
    },
    'not.cs': {
      icon: undefined,
    },
    'not.cd': {
      icon: undefined,
    },
    ov: {
      icon: undefined,
    },
    'not.ov': {
      icon: undefined,
    },
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
  const val =
    op === 'bt' ? ((value || ['', '']) as [number, number]) : (value as number | undefined);

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
          value={(val as [number, number])[0]}
          onChange={(e) => update('bt', [Number(e.target.value), (val as [number, number])[1]])}
          className="flex-1"
        />
        <Input
          type="number"
          placeholder="Max"
          value={(val as [number, number])[1]}
          onChange={(e) => update('bt', [(val as [number, number])[0], Number(e.target.value)])}
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
}: Props<string | [string, string] | undefined> & { op: FilterOperations }) {
  if (typeof value === 'number') {
    value = subDays(new Date(), value).toISOString();
  }
  const val =
    op === 'bt' ? ((value || ['', '']) as [string, string]) : (value as string | undefined);

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
          value={val?.[0] as string}
          onChange={(date) => update('bt', [date, val?.[1] as string])}
          placeholder="Start date"
          className="flex-1"
        />
        <DatePicker
          value={val?.[1] as string}
          onChange={(date) => update('bt', [val?.[0] as string, date])}
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
        value={value as string | undefined}
        onChange={(date) => update(op, date)}
        placeholder={meta.placeholder}
        className="flex-1 rounded-l-none"
      />
    </div>
  );
}
