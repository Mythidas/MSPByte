'use client';

import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
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
import { useEffect, useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ClassValue } from 'clsx';
import { Checkbox } from '@/components/ui/checkbox';
import { useTableURLState } from '@/hooks/useTableURLState';
import { Input } from '@/components/ui/input';
import { Option } from '@/types';

export type FilterOperation = 'equals' | 'greater' | 'less' | 'between';
export type FilterType = 'text' | 'select' | 'boolean' | 'date' | 'number';

export type ColumnFilterMeta = {
  type: FilterType;
  options?: Option[]; // For selects
  placeholder?: string;
  operations?: FilterOperation[];
};

export type DataTableColumnDef<TData> = {
  accessorKey?: string;
  simpleSearch?: boolean;
  filter?: ColumnFilterMeta;
  headerClass?: ClassValue;
  cellClass?: ClassValue;
} & ColumnDef<TData, undefined>;

interface DataTableProps<TData> {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  initialVisibility?: VisibilityState;
}

type PendingFilterValue =
  | string
  | boolean
  | { op: FilterOperation; value: any }
  | { op: 'between'; value: [any, any] };

export default function DataTable<TData>({
  columns,
  data,
  initialVisibility = {},
}: DataTableProps<TData>) {
  const { initialFilters, initialSorting, applyUrlState, isReady } = useTableURLState();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility);
  const [globalSearch, setGlobalSearch] = useState('');

  const [pendingFilters, setPendingFilters] = useState<Record<string, PendingFilterValue>>({});
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const didInitFilters = useRef(false);
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

  useEffect(() => {
    if (
      !didInitFilters.current &&
      initialFilters.length > 0 &&
      data.length > 0 // wait for your async data
    ) {
      table.setColumnFilters(initialFilters);
      setSorting(initialSorting);
      didInitFilters.current = true;
    }
  }, [initialFilters, initialSorting, data]);

  useEffect(() => {
    if (drawerOpen) {
      const currentFilters = table.getState().columnFilters;
      const pending: Record<string, any> = {};
      const active: Record<string, boolean> = {};

      for (const col of table.getAllColumns()) {
        const found = currentFilters.find((f) => f.id === col.id);
        pending[col.id] = found?.value ?? '';
        active[col.id] = !!found;
      }

      setPendingFilters(pending);
      setActiveFilters(active);
    }
  }, [drawerOpen]);

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

  const handleFilterApply = () => {
    const applied: ColumnFiltersState = [];

    for (const [id, rawValue] of Object.entries(pendingFilters)) {
      if (!activeFilters[id]) continue;

      // Look up the column's filter config
      const colDef = columns.find((c) => c.accessorKey === id) as
        | DataTableColumnDef<any>
        | undefined;
      const filterMeta = colDef?.filter;

      if (!filterMeta) continue;

      let value = rawValue;

      // Normalize undefined values by type
      switch (filterMeta.type) {
        case 'boolean':
          value = rawValue || false;
          break;
        case 'text':
        case 'select':
          value = rawValue || '';
          break;
        case 'number':
        case 'date':
          if (typeof rawValue === 'object' && rawValue !== null && 'op' in rawValue) {
            const opValue = rawValue as { op: string; value: any };
            if (
              opValue.value === undefined ||
              (opValue.op === 'between' && (!opValue.value?.[0] || !opValue.value?.[1]))
            ) {
              continue;
            }
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
        acc[col.id] = '';
        return acc;
      },
      {} as Record<string, any>
    );
    setPendingFilters(cleared);
    setActiveFilters({});
    table.setColumnFilters([]);
  };

  const renderOperators = (onSelect: (op: FilterOperation) => void) => {
    return (
      <Select onValueChange={(e) => onSelect(e as FilterOperation)} defaultValue="equals">
        <SelectTrigger noIcon>
          <SelectValue placeholder="Operators" defaultValue="equals" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="equals">
            <Equal />
          </SelectItem>
          <SelectItem value="greater">
            <ChevronRight />
          </SelectItem>
          <SelectItem value="less">
            <ChevronLeft />
          </SelectItem>
          <SelectItem value="between">
            <ChevronLeft /> <ChevronRight />
          </SelectItem>
        </SelectContent>
      </Select>
    );
  };

  const renderFilterDate = (meta: ColumnFilterMeta, id: string, value: string | undefined) => {};

  const renderFilterNumber = (meta: ColumnFilterMeta, id: string, value: number | undefined) => {
    return renderOperators(() => {});
  };

  const renderFilterBoolean = (meta: ColumnFilterMeta, id: string, value: boolean | undefined) => {
    return (
      <Label className="text-sm">
        <Checkbox
          checked={value}
          onCheckedChange={(e) =>
            setPendingFilters((prev) => ({
              ...prev,
              [id]: e as boolean,
            }))
          }
        />
        Enabled
      </Label>
    );
  };

  const renderFilterSelect = (meta: ColumnFilterMeta, id: string, value: string | undefined) => {
    if (!meta.options) return null;
    return (
      <Select
        value={value}
        onValueChange={(e) =>
          setPendingFilters((prev) => ({
            ...prev,
            [id]: e,
          }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder={meta.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {meta?.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
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
        value={value}
        onChange={(e) =>
          setPendingFilters((prev) => ({
            ...prev,
            [id]: e.target.value,
          }))
        }
      />
    );
  };

  const renderFilter = (col: Column<TData, unknown>) => {
    const colId = col.id;
    const filterMeta = (col.columnDef as DataTableColumnDef<TData>).filter!;
    const currentValue = pendingFilters[colId] as any;

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
            {(col.columnDef.meta as any)?.label || col.columnDef.id}
          </Label>

          <>
            {filterMeta.type === 'text' &&
              renderFilterText(filterMeta, colId, currentValue as string)}
            {filterMeta.type === 'select' &&
              filterMeta.options &&
              renderFilterSelect(filterMeta, colId, currentValue as string)}
            {filterMeta.type === 'boolean' &&
              renderFilterBoolean(filterMeta, colId, currentValue as boolean)}
            {filterMeta.type === 'number' &&
              renderFilterNumber(filterMeta, colId, currentValue as number)}
            {filterMeta.type === 'date' &&
              renderFilterDate(filterMeta, colId, currentValue as string)}
          </>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col size-full gap-4">
      <div className="flex items-center w-full max-w-sm gap-2">
        <SearchBar placeholder="Search identities..." onSearch={setGlobalSearch} />
        <Drawer direction="left" open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost">
              {columnFilters.length > 0 ? <FunnelPlus /> : <Funnel />}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerDescription>Toggle and set filters by column.</DrawerDescription>
            </DrawerHeader>

            <div className="p-4 space-y-4">
              {table
                .getAllColumns()
                .filter((col) => col.getCanFilter() && !!(col.columnDef as any).filter)
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
                      {(column.columnDef as any)?.meta?.label ?? column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
                        className={cn('py-1 rounded', (header.column.columnDef as any).headerClass)}
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
                        className={cn('py-1', (cell.column.columnDef as any).cellClass)}
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
                <span>Total: {data.length}</span>
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
      {!column.getIsSorted() && <ArrowUpDown />}
    </Button>
  );
}
