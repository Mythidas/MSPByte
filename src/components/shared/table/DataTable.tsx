'use client';

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import SearchBar from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { Download, Grid2X2, RotateCw } from 'lucide-react';
import { forwardRef, Suspense, useEffect, useImperativeHandle, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  DataResponse,
  DataTableColumnDef,
  DataTableFetcher,
  DataTableFilter,
  FilterValue,
} from '@/types/data-table';
import { Spinner } from '@/components/shared/Spinner';
import { DataTableFilters } from '@/components/shared/table/DataTableFilters';
import { DataTableFooter } from '@/components/shared/table/DataTableFooter';
import * as XLSX from 'xlsx';
import { ClassValue } from 'clsx';

interface DataTableProps<TData> {
  columns: DataTableColumnDef<TData>[];
  data?: TData[];
  initialVisibility?: VisibilityState;
  action?: React.ReactNode;
  isLoading?: boolean;
  height?: ClassValue;
  fetcher?: (args: DataTableFetcher) => Promise<DataResponse<TData>>;
  filters?: Record<string, Record<string, DataTableFilter>>;
}

export type DataTableRef = {
  refetch: () => void;
};

function DataTableInner<TData>(
  {
    columns,
    data: initialData,
    initialVisibility = {},
    action,
    isLoading,
    height = 'max-h-[60vh]',
    fetcher,
    filters,
  }: DataTableProps<TData>,
  ref: React.Ref<DataTableRef>
) {
  const [data, setData] = useState<TData[]>(initialData ?? []);
  const [rowCount, setRowCount] = useState(initialData?.length ?? 0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [isFetching, setIsFetching] = useState(false);
  const [filtersReady, setFiltersReady] = useState(!fetcher);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility);
  const [globalSearch, setGlobalSearch] = useState('');
  const simpleSearchFields = columns
    .filter((col) => (col as DataTableColumnDef<TData>).simpleSearch)
    .map((col) => col.accessorKey)
    .filter(Boolean) as string[];

  const load = async (overrideSorting?: SortingState) => {
    if (!fetcher || !filtersReady) return;
    const activeSorting = overrideSorting ?? sorting;

    setIsFetching(true);
    const { rows, total } = await fetcher({
      pageIndex,
      pageSize,
      sorting: Object.fromEntries(
        activeSorting.map((sort) => [sort.id, sort.desc ? 'desc' : 'asc'])
      ),
      filters: Object.fromEntries(
        columnFilters.map((filter) => [filter.id, filter.value as FilterValue])
      ),
      globalFields: columns.filter((col) => col.simpleSearch).map((col) => col.accessorKey!),
      globalSearch: globalSearch,
    });

    setData(rows);
    setRowCount(total);
    setIsFetching(false);
  };

  useEffect(() => {
    if (fetcher && filtersReady) {
      load();
    }
  }, [pageIndex, pageSize, sorting, columnFilters, globalSearch, filtersReady]);

  useEffect(() => {
    if (!fetcher && initialData) {
      setData(initialData);
      setRowCount(initialData.length);
    }
  }, [initialData]);

  useImperativeHandle(ref, () => ({
    refetch: load,
  }));

  const table = useReactTable({
    data,
    columns: columns as DataTableColumnDef<TData>[],
    manualPagination: fetcher !== undefined,
    pageCount: fetcher ? Math.ceil(rowCount / pageSize) : undefined,
    manualSorting: fetcher !== undefined,
    manualFiltering: fetcher !== undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: !fetcher
      ? setSorting
      : async (updater) => {
          const nextSorting = typeof updater === 'function' ? updater(sorting) : updater;

          setSorting(nextSorting);
        },
    getSortedRowModel: !fetcher ? getSortedRowModel() : undefined,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: !fetcher ? getFilteredRowModel() : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(newPagination.pageIndex);
      setPageSize(newPagination.pageSize);
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: { pageIndex, pageSize },
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

  const renderBody = () => {
    if (data.length === 0 && (isLoading || isFetching)) {
      return (
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className="h-32 text-center justify-center items-center border-0"
          >
            <div className="flex flex-col w-full justify-center items-center gap-3">
              <Spinner />
              <p className="text-sm text-muted-foreground">Loading data...</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!table.getRowModel().rows?.length) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-32 text-center border-0">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Grid2X2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return (
      <>
        {table.getRowModel().rows.map((row, index) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && 'selected'}
            className={cn(
              'group hover:bg-muted/50 transition-colors duration-150',
              'border-b border-border/40 last:border-b-0',
              index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
            )}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn((cell.column.columnDef as DataTableColumnDef<TData>).cellClass)}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };

  function downloadTSV() {
    const rows = table.getFilteredRowModel().rows;
    const columns = table
      .getVisibleFlatColumns()
      .map((col: DataTableColumnDef<TData>) => col.id || col.accessorKey)
      .filter(Boolean) as (keyof TData)[];
    const data = rows.map((row) => {
      const rowData: Record<string, unknown> = {};

      columns.forEach((col: keyof TData) => {
        if (!col) return;

        // Access the rendered cell value (as string)
        const cell = row.getValue(col as string);

        // You can format this here if needed
        rowData[col as string] = typeof cell === 'object' ? JSON.stringify(cell) : cell;
      });

      return rowData;
    });

    const tsv = [
      columns.join('\t'), // headers
      ...data.map((row) => columns.map((key) => row[key as string] ?? '').join('\t')),
    ].join('\n');

    const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'table-export.tsv';
    link.click();
  }

  function downloadCSV() {
    const rows = table.getFilteredRowModel().rows;
    const columns = table
      .getVisibleFlatColumns()
      .map((col: DataTableColumnDef<TData>) => col.id || col.accessorKey)
      .filter(Boolean) as (keyof TData)[];
    const data = rows.map((row) => {
      const rowData: Record<string, unknown> = {};

      columns.forEach((col: keyof TData) => {
        if (!col) return;

        // Access the rendered cell value (as string)
        const cell = row.getValue(col as string);

        // You can format this here if needed
        rowData[col as string] = typeof cell === 'object' ? JSON.stringify(cell) : cell;
      });

      return rowData;
    });

    if (!data.length) return;

    const escape = (val: unknown) => {
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const csv = [
      columns.join(','), // Header row
      ...data.map((row) => columns.map((col) => escape(row[col as string])).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'table-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadXLSX() {
    const rows = table.getFilteredRowModel().rows;
    const columns = table
      .getVisibleFlatColumns()
      .map((col: DataTableColumnDef<TData>) => col.id || col.accessorKey)
      .filter(Boolean) as (keyof TData)[];
    const data = rows.map((row) => {
      const rowData: Record<string, unknown> = {};

      columns.forEach((col: keyof TData) => {
        if (!col) return;

        // Access the rendered cell value (as string)
        const cell = row.getValue(col as string);

        // You can format this here if needed
        rowData[col as string] = typeof cell === 'object' ? JSON.stringify(cell) : cell;
      });

      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'table-export.xlsx');
  }

  return (
    <div className="flex flex-col size-full gap-4">
      {/* Header Section with improved styling */}
      <div className="flex w-full h-fit justify-between items-start">
        <div className="flex items-center w-full max-w-4xl gap-2">
          <div className="relative w-72">
            <SearchBar
              placeholder="Search..."
              onSearch={setGlobalSearch}
              delay={initialData ? 0 : 1000}
            />
            {(isLoading || isFetching) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Suspense fallback={<div className="w-8 h-8 rounded bg-muted animate-pulse" />}>
              <DataTableFilters
                filters={filters || {}}
                onInit={() => setFiltersReady(true)}
                table={table}
                sorting={sorting}
                clientSide={!fetcher}
              />
            </Suspense>
            {table.getAllColumns().filter((column) => column.getCanHide()).length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 hover:bg-muted/80 transition-colors"
                  >
                    <Grid2X2 className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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
                          {(column.columnDef as DataTableColumnDef<TData>)?.meta?.label ??
                            column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 hover:bg-muted/80 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={downloadCSV} className="gap-2">
                  <span className="font-mono text-xs">CSV</span>
                  <span className="text-muted-foreground">Comma separated</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadTSV} className="gap-2">
                  <span className="font-mono text-xs">TSV</span>
                  <span className="text-muted-foreground">Tab separated</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadXLSX} className="gap-2">
                  <span className="font-mono text-xs">XLSX</span>
                  <span className="text-muted-foreground">Excel format</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!!fetcher && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => load()}
                disabled={isLoading || isFetching}
                className="h-9 px-3 hover:bg-muted/80 transition-colors"
              >
                <RotateCw className={cn('w-4 h-4', (isLoading || isFetching) && 'animate-spin')} />
              </Button>
            )}
          </div>
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* Modern Table Card */}
      <Card className="py-0 rounded-none gap-2">
        <ScrollArea className={cn(height, 'max-w-full')}>
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/60 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-0">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'p font-semibold text-foreground/90 border-0',
                          'bg-gradient-to-b from-muted/30 to-muted/10',
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
            <TableBody className="divide-y-0">{renderBody()}</TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Enhanced Footer */}
        <DataTableFooter table={table} count={rowCount} />
      </Card>
    </div>
  );
}

const DataTable = forwardRef(DataTableInner) as <TData>(
  props: DataTableProps<TData> & { ref?: React.Ref<DataTableRef> }
) => ReturnType<typeof DataTableInner>;

export default DataTable;
