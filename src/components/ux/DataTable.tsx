'use client';

import {
  Column,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Table as TTable,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import SearchBar from '@/components/ux/SearchBar';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import {
  Funnel,
  ArrowUpDown,
  MoveDown,
  MoveUp,
  Grid2X2,
  FunnelPlus,
  Equal,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from '@/components/ui/pagination';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Suspense, useEffect, useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useTableURLState } from '@/hooks/useTableURLState';
import { Input } from '@/components/ui/input';
import MultiSelect from '@/components/ux/MultiSelect';
import {
  DataTableColumnDef,
  FilterOperation,
  FilterValue,
  ColumnFilterMeta,
  FilterPrimitive,
  FilterPrimitiveTuple,
} from '@/types/data-table';

interface DataTableProps<TData> {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  initialVisibility?: VisibilityState;
  action?: React.ReactNode;
}

export default function DataTable<TData>({
  columns,
  data,
  initialVisibility = {},
  action,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility);
  const [globalSearch, setGlobalSearch] = useState('');

  const simpleSearchFields = columns
    .filter((col) => (col as DataTableColumnDef<TData>).simpleSearch)
    .map((col) => col.accessorKey)
    .filter(Boolean) as string[];

  const table = useReactTable({
    data,
    columns: columns as DataTableColumnDef<TData>[],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter: globalSearch,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const lower = String(filterValue).toLowerCase();

      return simpleSearchFields.some((colId) => {
        const key = colId as keyof TData;
        const val = row.original[key];
        return String(val).toLowerCase().includes(lower);
      });
    },
  });

  return (
    <div className="flex flex-col size-full gap-4">
      <div className="flex w-full h-fit justify-between">
        <div className="flex items-center w-full max-w-sm gap-2">
          <SearchBar placeholder="Search..." onSearch={setGlobalSearch} delay={500} />
          <Suspense fallback={<div>Loading...</div>}>
            <DataTableFilters
              table={table}
              columnFilters={columnFilters}
              columns={columns}
              sorting={sorting}
              data={data}
            />
          </Suspense>

          {table.getAllColumns().filter((column) => column.getCanHide()).length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-auto">
                  <Grid2X2 />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {(column.columnDef as DataTableColumnDef<TData>)?.meta?.label ?? column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div>{action}</div>
      </div>

      <Card className="py-0">
        <ScrollArea className="flex items-start overflow-auto max-h-[70vh]">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'py-1 rounded',
                          (header.column.columnDef as DataTableColumnDef<TData>).headerClass
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'py-1',
                          (cell.column.columnDef as DataTableColumnDef<TData>).cellClass
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <DataTableFooter table={table} />
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}

interface SortedHeaderProps<TValue> {
  column: Column<TValue>;
  label: string;
}

export function DataTableHeader<TValue>({ column, label }: SortedHeaderProps<TValue>) {
  return (
    <Button
      variant="none"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="px-0!"
    >
      {label}
      {column.getIsSorted() === 'asc' && <MoveUp />}
      {column.getIsSorted() === 'desc' && <MoveDown />}
      {!column.getIsSorted() && column.getCanSort() && <ArrowUpDown />}
    </Button>
  );
}

type DataTableFooterProps<TData> = {
  table: TTable<TData>;
};

function DataTableFooter<TData>({ table }: DataTableFooterProps<TData>) {
  const generateLinks = () => {
    const totalPages = table.getPageCount();
    const page = table.getState().pagination.pageIndex + 1;
    const display =
      page === 1
        ? [1, 2, 3]
        : page === totalPages
          ? [totalPages - 2, totalPages - 1, totalPages]
          : [page - 1, page, page + 1];

    return display.map((index) => {
      if (index < 1 || index > totalPages) return null;
      return (
        <PaginationItem key={index}>
          <PaginationLink
            onClick={() => table.setPageIndex(index - 1)}
            isActive={page === index}
            className="hover:cursor-pointer"
          >
            {index}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <TableCaption className="sticky bottom-0 z-50 bg-card space-y-2 py-2 rounded">
      <Separator />
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => table.getCanPreviousPage() && table.previousPage()}
            />
          </PaginationItem>
          {generateLinks()}
          <PaginationItem>
            <PaginationNext onClick={() => table.getCanNextPage() && table.nextPage()} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <Separator />
      <div className="flex w-full gap-2 justify-center items-center">
        <span>Pages: {table.getPageCount()}</span>
        <Separator orientation="vertical" />
        <span>Total: {table.getRowCount()}</span>
        <Separator orientation="vertical" />
        <Label>
          Page Size:
          <Select onValueChange={(v) => table.setPageSize(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </Label>
      </div>
    </TableCaption>
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

type DataTableDrawerProps<TData> = {
  table: TTable<TData>;
  columnFilters: ColumnFiltersState;
  columns: DataTableColumnDef<TData>[];
  sorting: SortingState;
  data: TData[];
};

function DataTableFilters<TData>({
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

    table.setColumnFilters(applied);
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
        options={meta.options}
        defaultValues={value}
        placeholder={meta.placeholder}
        lead="In"
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
      <DrawerContent>
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
