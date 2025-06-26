import { Button } from '@/components/ui/button';
import { Column } from '@tanstack/react-table';
import { MoveUp, MoveDown, ArrowUpDown } from 'lucide-react';

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
