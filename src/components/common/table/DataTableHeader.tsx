import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Column } from '@tanstack/react-table';
import { MoveUp, MoveDown, ArrowUpDown } from 'lucide-react';

interface SortedHeaderProps<TValue> {
  column: Column<TValue>;
  label: string;
}

export function DataTableHeader<TValue>({ column, label }: SortedHeaderProps<TValue>) {
  const handleSort = () => {
    if (!column.getCanSort()) return;
    column.toggleSorting(column.getIsSorted() === 'asc');
  };

  return (
    <Button
      variant="none"
      onClick={handleSort}
      className={cn('px-0!', !column.getCanSort() && 'cursor-none')}
    >
      {label}
      {column.getIsSorted() === 'asc' && <MoveUp />}
      {column.getIsSorted() === 'desc' && <MoveDown />}
      {!column.getIsSorted() && column.getCanSort() && <ArrowUpDown />}
    </Button>
  );
}
