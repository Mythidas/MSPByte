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
import { Separator } from '@/components/ui/separator';
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

  return (
    <div className="space-y-2 pb-2 rounded">
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
        <span>Total: {count}</span>
        <Separator orientation="vertical" />
        <Label>
          Page Size:
          <Select onValueChange={(v) => table.setPageSize(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
            </SelectContent>
          </Select>
        </Label>
      </div>
    </div>
  );
}
