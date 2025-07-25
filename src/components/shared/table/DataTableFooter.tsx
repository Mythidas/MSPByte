import { Label } from '@/components/ui/label';
import {
  PaginationItem,
  PaginationLink,
  Pagination,
  PaginationContent,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table } from '@tanstack/react-table';

type DataTableFooterProps<TData> = {
  table: Table<TData>;
  count: number;
};

export function DataTableFooter<TData>({ table, count }: DataTableFooterProps<TData>) {
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

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;
  const startItem = table.getState().pagination.pageIndex * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, count);

  return (
    <div className="p-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Stats and Controls Row */}
      <div className="flex flex-row items-center justify-between">
        {/* Left side - Results info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">
            Showing {startItem.toLocaleString()}-{endItem.toLocaleString()} of{' '}
            {count.toLocaleString()} results
          </span>
          <span className="text-muted-foreground text-sm">
            {currentPage} of {totalPages}
          </span>
        </div>

        {/* Right side - Page size selector */}
        <div className="flex items-center gap-2">
          <Label htmlFor="page-size" className="text-sm font-medium whitespace-nowrap">
            Rows per page:
          </Label>
          <Select value={pageSize.toString()} onValueChange={(v) => table.setPageSize(Number(v))}>
            <SelectTrigger id="page-size" className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pagination Row */}
      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.getCanPreviousPage() && table.previousPage()}
                className={
                  !table.getCanPreviousPage()
                    ? 'pointer-events-none opacity-50'
                    : 'hover:cursor-pointer'
                }
              />
            </PaginationItem>
            {generateLinks()}
            <PaginationItem>
              <PaginationNext
                onClick={() => table.getCanNextPage() && table.nextPage()}
                className={
                  !table.getCanNextPage()
                    ? 'pointer-events-none opacity-50'
                    : 'hover:cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
