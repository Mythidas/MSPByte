import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationEllipsis, PaginationNext } from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCaption, TableHeader } from "@/components/ui/table";
import { useEffect, useState } from "react";

type Props<T> = {
  data: T[];
  pageSize?: number;
  head: () => React.ReactNode;
  body: (rows: T[], page: number, size: number) => React.ReactNode;
}

export default function PaginatedTable<T>({ pageSize = 25, ...props }: Props<T>) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const totalPages = Math.ceil(props.data.length / size);
    setTotalPages(totalPages);
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [props.data, size]);

  function getRows() {
    const start = (page - 1) * size;
    const end = start + size;
    return props.data.slice(start, end);
  }

  function previousPage() {
    if (page > 1) {
      setPage(page - 1);
    }
  }

  function nextPage() {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }

  const generateLinks = () => {
    const display = page === 1 ? [1, 2, 3] : page === totalPages ? [totalPages - 2, totalPages - 1, totalPages] : [page - 1, page, page + 1];

    return display.map((index) => {
      if (index < 1 || index > totalPages) return null;

      return (
        <PaginationItem key={index}>
          <PaginationLink onClick={() => setPage(index)} isActive={page === index}>
            {index}
          </PaginationLink>
        </PaginationItem>
      )
    });
  }

  return (
    <ScrollArea className="flex items-start overflow-auto max-h-[70vh]">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          {props.head()}
        </TableHeader>
        <TableBody>
          {props.body(getRows(), page, size)}
        </TableBody>
        <TableCaption className="sticky bottom-0 z-10 bg-card space-y-2">
          <Separator />
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={previousPage} />
              </PaginationItem>
              {generateLinks()}
              <PaginationItem>
                <PaginationNext onClick={nextPage} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <Separator />
          <div className="flex w-full gap-2 justify-center items-center">
            <span>Pages: {totalPages}</span>
            <Separator orientation="vertical" />
            <span>Total: {props.data.length}</span>
            <Separator orientation="vertical" />
            <Label>
              Page Size:
              <Select onValueChange={(v) => setSize(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder={pageSize} />
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
  );
}