import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SkeletonTable() {
  return (
    <Table>
      <TableCaption>
        <Skeleton className="w-24 h-4" />
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Skeleton className="w-24 h-4" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-24 h-4" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-24 h-4" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-24 h-4" />
          </TableHead>
          <TableHead className="justify-right">
            <Skeleton className="w-24 h-4" />
          </TableHead>
        </TableRow>
      </TableHeader>
    </Table>
  );
}