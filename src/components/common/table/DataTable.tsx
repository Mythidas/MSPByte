'use client';

import {
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
import { Suspense, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { DataTableColumnDef } from '@/types/data-table';
import { Spinner } from '@/components/common/Spinner';
import { DataTableFilters } from '@/components/common/table/DataTableFilters';
import { DataTableFooter } from '@/components/common/table/DataTableFooter';
import * as XLSX from 'xlsx';

interface DataTableProps<TData> {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  initialVisibility?: VisibilityState;
  action?: React.ReactNode;
  isLoading?: boolean;
}

export default function DataTable<TData>({
  columns,
  data,
  initialVisibility = {},
  action,
  isLoading,
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

  const renderBody = () => {
    if (isLoading) {
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
        <ScrollArea className="max-h-[60vh] max-w-full">
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
        <DataTableFooter table={table} />
      </Card>
    </div>
  );
}
