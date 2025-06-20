"use client"

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
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import SearchBar from "@/components/ux/SearchBar"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Funnel, ArrowUpDown, MoveDown, MoveUp, Grid2X2 } from "lucide-react"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ClassValue } from "clsx"

export type DataTableColumn<TData, TValue> = {
  accessorKey?: string;
  simpleSearch?: boolean;
  headerClass?: ClassValue;
  cellClass?: ClassValue;
} & ColumnDef<TData, TValue>;

interface DataTableProps<TData, TValue> {
  columns: DataTableColumn<TData, TValue>[];
  data: TData[];
  initialVisibility?: VisibilityState;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  initialVisibility = {}
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility);

  const table = useReactTable({
    data,
    columns,
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
      columnVisibility
    }
  })

  const generateLinks = () => {
    const totalPages = table.getPageCount();
    const page = table.getState().pagination.pageIndex + 1;
    const display = page === 1 ? [1, 2, 3] : page === totalPages ? [totalPages - 2, totalPages - 1, totalPages] : [page - 1, page, page + 1];

    return display.map((index) => {
      if (index < 1 || index > totalPages) return null;
      return (
        <PaginationItem key={index}>
          <PaginationLink onClick={() => table.setPageIndex(index - 1)} isActive={page === index} className="hover:cursor-pointer">
            {index}
          </PaginationLink>
        </PaginationItem>
      )
    });
  }

  return (
    <div className="flex flex-col size-full gap-4">
      <div className="flex items-center w-full max-w-sm gap-2">
        <SearchBar
          placeholder="Search identities..."
          onSearch={(event) => {
            for (const col of columns) {
              if (col.simpleSearch) {
                table.getColumn(columns[0].accessorKey || "")?.setFilterValue(event);
              }
            }
          }}
        />
        <Drawer direction="left">
          <DrawerTrigger asChild>
            <Button variant="ghost">
              <Funnel />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>This action cannot be undone.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter className="flex flex-row w-full gap-2 items-end justify-end">
              <Button variant="destructive">Clear</Button>
              <Button>Filter</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        {table.getAllColumns().filter((column) => column.getCanHide()).length > 0 &&
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-auto">
                <Grid2X2 />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(
                  (column) => column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {(column.columnDef as any)?.meta?.label ?? column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>}
      </div>

      <Card className="py-0">
        <ScrollArea className="flex items-start overflow-auto max-h-[70vh]">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className={cn('py-1', (header.column.columnDef as any).headerClass)}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cn('py-1', (cell.column.columnDef as any).cellClass)}>
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
            <TableCaption className="sticky bottom-0 z-50 bg-card space-y-2 py-2">
              <Separator />
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => table.getCanPreviousPage() && table.previousPage()} />
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
  )
}

interface SortedHeaderProps<TValue> {
  column: Column<TValue>;
  label: string;
}

export function DataTableHeader<TValue>({ column, label }: SortedHeaderProps<TValue>) {
  return (
    <Button variant="none" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0!">
      {label}
      {column.getIsSorted() === "asc" && <MoveUp />}
      {column.getIsSorted() === "desc" && <MoveDown />}
      {!column.getIsSorted() && <ArrowUpDown />}
    </Button>
  )
}