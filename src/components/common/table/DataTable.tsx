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
import SearchBar from '@/components/common/SearchBar';
import { Button } from '@/components/ui/button';
import { Download, Grid2X2 } from 'lucide-react';
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
import { Spinner } from '@/components/common/Spinner';
import { DataTableFilters } from '@/components/common/table/DataTableFilters';
import { DataTableFooter } from '@/components/common/table/DataTableFooter';
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
  const [pageSize, setPageSize] = useState(10);
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

  const load = async () => {
    if (!fetcher || !filtersReady) return;

    setIsFetching(true);
    const { rows, total } = await fetcher({
      pageIndex,
      pageSize,
      sorting: Object.fromEntries(sorting.map((sort) => [sort.id, sort.desc ? 'desc' : 'asc'])),
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
    if (fetcher) {
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
    onSortingChange: setSorting,
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
    if (isLoading || isFetching) {
      return (
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className="h-24 text-center justify-center items-center"
          >
            <div className="flex w-full justify-center items-center">
              <Spinner />
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!table.getRowModel().rows?.length) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      );
    }

    return (
      <>
        {table.getRowModel().rows.map((row) => (
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
      <div className="flex w-full h-fit justify-between">
        <div className="flex items-center w-full max-w-sm gap-2">
          <SearchBar placeholder="Search..." onSearch={setGlobalSearch} delay={1000} />
          <Suspense fallback={<div>Loading...</div>}>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-auto">
                <Download />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={downloadCSV}>.csv</DropdownMenuItem>
              <DropdownMenuItem onClick={downloadTSV}>.tsv</DropdownMenuItem>
              <DropdownMenuItem onClick={downloadXLSX}>.xlsx</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>{action}</div>
      </div>

      <Card className="py-0 gap-2 rounded-none bg-linear-to-t from-primary/5 to-card">
        <ScrollArea className={cn(height && height, 'max-w-full')}>
          <Table>
            <TableHeader className="sticky top-0 bg-card rounded z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          'py-1',
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
            <TableBody>{renderBody()}</TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <DataTableFooter table={table} count={rowCount} />
      </Card>
    </div>
  );
}

const DataTable = forwardRef(DataTableInner) as <TData>(
  props: DataTableProps<TData> & { ref?: React.Ref<DataTableRef> }
) => ReturnType<typeof DataTableInner>;

export default DataTable;
