'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  Drawer,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MultiSelect from '@/components/common/MultiSelect';
import SearchBar from '@/components/common/SearchBar';
import { useTableURLState } from '@/hooks/common/useTableURLState';
import {
  DataTableColumnDef,
  FilterValue,
  FilterPrimitive,
  FilterPrimitiveTuple,
  ColumnFilterMeta,
  FilterOperation,
} from '@/types/data-table';
import { ColumnFiltersState, SortingState, Column, Table } from '@tanstack/react-table';
import { FunnelPlus, Funnel, ChevronLeft, ChevronRight, Equal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type DataTableDrawerProps<TData> = {
  table: Table<TData>;
  columnFilters: ColumnFiltersState;
  columns: DataTableColumnDef<TData>[];
  sorting: SortingState;
  data: TData[];
};

export function DataTableFilters<TData>({
  table,
  columnFilters,
  columns,
  sorting,
  data,
}: DataTableDrawerProps<TData>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<Record<string, FilterValue>>({});
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({});
  const { initialFilters, initialSorting, applyUrlState } = useTableURLState();
  const didInitFilters = useRef(false);

  useEffect(() => {
    if (
      !didInitFilters.current &&
      initialFilters.length > 0 &&
      data.length > 0 // wait for your async data
    ) {
      table.setColumnFilters(initialFilters);
      table.setSorting(initialSorting);
      didInitFilters.current = true;
    }
  }, [initialFilters, initialSorting, data, table]);

  useEffect(() => {
    if (!drawerOpen) return;

    const currentFilters = table.getState().columnFilters;
    const pending: Record<string, FilterValue> = {};
    const active: Record<string, boolean> = {};

    for (const col of table.getAllColumns()) {
      const found = currentFilters.find((f) => f.id === col.id);

      if (found) {
        // If it's an operator filter, keep it as-is
        pending[col.id] = found.value as FilterValue;
        active[col.id] = true;
      } else {
        // Not currently filtered
        active[col.id] = false;
      }
    }

    setPendingFilters(pending);
    setActiveFilters(active);
  }, [drawerOpen, table]);

  const handleFilterApply = () => {
    const applied: ColumnFiltersState = [];

    for (const [id, rawValue] of Object.entries(pendingFilters)) {
      if (!activeFilters[id]) continue;

      // Look up the column's filter config
      const colDef = columns.find((c) => c.accessorKey === id) as
        | DataTableColumnDef<TData>
        | undefined;
      const filterMeta = colDef?.filter;

      if (!filterMeta) continue;

      let value = rawValue;
      switch (filterMeta.type) {
        case 'boolean':
          value = { op: 'eq', value: (rawValue.value ?? false) as FilterPrimitive | undefined };
          break;
        case 'text':
        case 'select':
          value = { op: 'eq', value: (rawValue.value ?? '') as FilterPrimitive | undefined };
          break;
        case 'number':
        case 'date':
          const opTuple = value.value as FilterPrimitiveTuple;
          if (value.value === undefined || (value.op === 'bt' && (!opTuple[0] || opTuple[1]))) {
            continue;
          }
          break;
      }

      applied.push({ id, value });
    }

    applyUrlState({ filters: applied, sorting });
    setDrawerOpen(false);
  };

  const handleFilterClear = () => {
    const cleared = table.getAllColumns().reduce(
      (acc, col) => {
        acc[col.id] = { op: 'eq', value: undefined };
        return acc;
      },
      {} as Record<string, FilterValue>
    );
    setPendingFilters(cleared);
    setActiveFilters({});
    table.setColumnFilters([]);
  };

  const renderFilterNumberOrDate = (meta: ColumnFilterMeta, id: string) => {
    const newValue = (
      prev: Record<string, FilterValue>,
      op?: FilterOperation,
      value?: FilterPrimitive | FilterPrimitiveTuple
    ): Record<string, FilterValue> => {
      const prevVal = prev[id]?.value;

      if (op === 'bt') {
        return {
          ...prev,
          [id]: {
            op: 'bt',
            value: (value ?? prevVal) as FilterPrimitiveTuple,
          },
        };
      }

      const validOp: Exclude<FilterOperation, 'bt'> = op ? op : 'eq';

      return {
        ...prev,
        [id]: {
          op: validOp,
          value: (value ?? prevVal ?? '') as FilterPrimitive | undefined,
        },
      };
    };

    const pendingTuple = (pendingFilters[id]?.value || [0, 0]) as FilterPrimitiveTuple;

    return (
      <>
        {pendingFilters[id]?.op === 'bt' ? (
          <div className="flex gap-2">
            <SearchBar
              type="number"
              placeholder={meta.placeholder}
              value={(pendingTuple[0] as number) || 0}
              delay={0}
              onChange={(e) =>
                setPendingFilters((prev) =>
                  newValue(prev, 'bt', [
                    Number(e.target.value),
                    ((prev[id].value as FilterPrimitiveTuple)[1] as number) || 0,
                  ])
                )
              }
              lead={
                <DataTableOperatorSelect
                  onSelect={(op) => setPendingFilters((prev) => newValue(prev, op))}
                />
              }
            />
            <SearchBar
              type="number"
              placeholder={meta.placeholder}
              value={(pendingTuple[1] as number) || 0}
              delay={0}
              onChange={(e) =>
                setPendingFilters((prev) =>
                  newValue(prev, 'bt', [
                    ((prev[id].value as FilterPrimitiveTuple)[0] as number) || 0,
                    Number(e.target.value),
                  ])
                )
              }
              lead={
                <DataTableOperatorSelect
                  onSelect={(op) => setPendingFilters((prev) => newValue(prev, op))}
                />
              }
            />
          </div>
        ) : (
          <SearchBar
            type="number"
            placeholder={meta.placeholder}
            value={(pendingFilters[id]?.value as number) || 0}
            delay={0}
            onChange={(e) =>
              setPendingFilters((prev) =>
                newValue(prev, pendingFilters[id]?.op, Number(e.target.value))
              )
            }
            lead={
              <DataTableOperatorSelect
                onSelect={(op) => setPendingFilters((prev) => newValue(prev, op))}
              />
            }
          />
        )}
      </>
    );
  };

  const renderFilterBoolean = (meta: ColumnFilterMeta, id: string, value: boolean | undefined) => {
    return (
      <Label className="text-sm">
        <Checkbox
          checked={value}
          onCheckedChange={(e) =>
            setPendingFilters((prev) => ({
              ...prev,
              [id]: { op: 'eq', value: e as boolean },
            }))
          }
        />
        Enabled
      </Label>
    );
  };

  const renderFilterMultiSelect = (
    meta: ColumnFilterMeta,
    id: string,
    value: string[] | undefined
  ) => {
    if (!meta.options) return null;
    return (
      <MultiSelect
        className="relative flex w-full max-w-full"
        options={meta.options}
        defaultValues={value}
        placeholder={meta.placeholder}
        maxDisplayedBadges={1}
        onChange={(e) =>
          setPendingFilters((prev) => ({
            ...prev,
            [id]: { op: 'in', value: e },
          }))
        }
      />
    );
  };

  const renderFilterSelect = (meta: ColumnFilterMeta, id: string, value: string | undefined) => {
    if (!meta.options) return null;
    return (
      <Select
        value={value || ''}
        onValueChange={(e) =>
          setPendingFilters((prev) => ({
            ...prev,
            [id]: { op: 'eq', value: e },
          }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder={meta.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {meta?.options.map((opt, idx) => (
            <SelectItem key={idx} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderFilterText = (meta: ColumnFilterMeta, id: string, value: string | undefined) => {
    return (
      <Input
        type="text"
        className="w-full border px-2 py-1 rounded"
        placeholder={meta.placeholder || `Search ${id}`}
        value={value || ''}
        onChange={(e) =>
          setPendingFilters((prev) => ({
            ...prev,
            [id]: { op: 'eq', value: e.target.value },
          }))
        }
      />
    );
  };

  const renderFilter = (col: Column<TData, unknown>) => {
    const colId = col.id;
    const filterMeta = (col.columnDef as DataTableColumnDef<TData>).filter!;
    const currentValue = pendingFilters[colId] as FilterValue;

    return (
      <div key={colId} className="space-y-2 border-b pb-4">
        <div className="flex items-center gap-2">
          <Label className="font-medium flex gap-2">
            <Checkbox
              checked={activeFilters[colId]}
              onCheckedChange={(checked) => {
                setActiveFilters((prev) => ({ ...prev, [colId]: !!checked }));
              }}
            />
            {(col.columnDef as DataTableColumnDef<TData>).meta?.label || col.columnDef.id}
          </Label>

          <>
            {filterMeta.type === 'text' &&
              renderFilterText(filterMeta, colId, currentValue?.value as string)}
            {filterMeta.type === 'select' &&
              filterMeta.options &&
              renderFilterSelect(filterMeta, colId, currentValue?.value as string)}
            {filterMeta.type === 'multiselect' &&
              filterMeta.options &&
              renderFilterMultiSelect(filterMeta, colId, currentValue?.value as string[])}
            {filterMeta.type === 'boolean' &&
              renderFilterBoolean(filterMeta, colId, currentValue?.value as boolean)}
            {filterMeta.type === 'number' && renderFilterNumberOrDate(filterMeta, colId)}
            {filterMeta.type === 'date' && renderFilterNumberOrDate(filterMeta, colId)}
          </>
        </div>
      </div>
    );
  };

  return (
    <Drawer direction="left" open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost">{columnFilters.length > 0 ? <FunnelPlus /> : <Funnel />}</Button>
      </DrawerTrigger>
      <DrawerContent className="w-[30vw]! max-w-[30vw]!">
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Toggle and set filters by column.</DrawerDescription>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          {table
            .getAllColumns()
            .filter(
              (col) => col.getCanFilter() && !!(col.columnDef as DataTableColumnDef<TData>).filter
            )
            .map(renderFilter)}
        </div>

        <DrawerFooter className="flex flex-row w-full gap-2 items-end justify-end">
          <Button variant="destructive" onClick={handleFilterClear}>
            Clear
          </Button>
          <Button onClick={handleFilterApply}>Apply</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DataTableOperatorSelect({
  onSelect,
  defaultValue,
}: {
  onSelect: (op: FilterOperation) => void;
  defaultValue?: string;
}) {
  return (
    <Select
      onValueChange={(e) => onSelect(e as FilterOperation)}
      defaultValue={defaultValue || 'eq'}
    >
      <SelectTrigger noIcon className="p-0! h-fit!">
        <SelectValue defaultValue={defaultValue || 'eq'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="eq">
          <Equal />
        </SelectItem>
        <SelectItem value="gt">
          <ChevronRight />
        </SelectItem>
        <SelectItem value="lt">
          <ChevronLeft />
        </SelectItem>
        <SelectItem value="bt">
          <ChevronLeft /> <ChevronRight />
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
