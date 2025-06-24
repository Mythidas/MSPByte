import { DataTableHeader } from '@/components/ux/DataTable';
import {
  booleanFilter,
  daysAgoFilter,
  numberFilter,
  stringFilter,
} from '@/lib/helpers/data-table/filters';
import { booleanSort, listLengthSort } from '@/lib/helpers/data-table/sorting';
import { cn } from '@/lib/utils';
import { DataTableColumnDef } from '@/types/data-table';

type GenericColumnProps<TData> = {
  key: keyof TData;
  label: string;
  alignRight?: boolean;
} & Partial<DataTableColumnDef<TData>>;

type BooleanColumnProps<TData> = {
  valid?: string;
  invalid?: string;
} & GenericColumnProps<TData>;

export function column<TData>({
  key,
  label,
  alignRight,
  cellClass,
  headerClass,
  ...props
}: GenericColumnProps<TData>): DataTableColumnDef<TData> {
  return {
    accessorKey: key as string,
    header: ({ column }) => <DataTableHeader column={column} label={label} />,
    meta: {
      label: label,
    },
    cellClass: cn(cellClass, alignRight && 'text-right'),
    headerClass: cn(headerClass, alignRight && 'text-right'),
    ...props,
  };
}

export function textColumn<TData>({
  key,
  label,
  ...props
}: GenericColumnProps<TData>): DataTableColumnDef<TData> {
  return column({
    key,
    label,
    filterFn: (row, colId, value) => stringFilter(row, colId as keyof TData, value),
    filter: {
      type: 'text',
      placeholder: `Search ${label.toLowerCase()}`,
    },
    ...props,
  });
}

export function numberColumn<TData>({
  key,
  label,
  ...props
}: GenericColumnProps<TData>): DataTableColumnDef<TData> {
  return column({
    key,
    label,
    filterFn: (row, colId, value) => numberFilter(row, colId as keyof TData, value),
    filter: {
      type: 'number',
      placeholder: `Count`,
    },
    ...props,
  });
}

export function listColumn<TData>({
  key,
  label,
  ...props
}: GenericColumnProps<TData>): DataTableColumnDef<TData> {
  return column({
    key,
    label,
    cell: ({ row }) => {
      if (props.cell) return props.cell;
      return <div>{Array.isArray(row.original[key]) && Array(...row.original[key]).length}</div>;
    },
    sortingFn: (rowA, rowB, colId) => listLengthSort(rowA, rowB, colId as keyof TData),
    filterFn: (row, colId, value) => numberFilter(row, colId as keyof TData, value),
    filter: {
      type: 'number',
      placeholder: `Count`,
    },
    ...props,
  });
}

export function booleanColumn<TData>({
  key,
  label,
  valid,
  invalid,
  ...props
}: BooleanColumnProps<TData>): DataTableColumnDef<TData> {
  return column({
    key,
    label,
    cell: ({ row }) => {
      if (props.cell) return props.cell;
      return <div>{row.original[key] ? valid || 'True' : invalid || 'False'}</div>;
    },
    filterFn: (row, colId, value) => booleanFilter(row, colId as keyof TData, value),
    sortingFn: (rowA, rowB, colId) => booleanSort(rowA, rowB, colId as keyof TData),
    filter: {
      type: 'boolean',
    },
    ...props,
  });
}

export function dateColumn<TData>({
  key,
  label,
  ...props
}: GenericColumnProps<TData>): DataTableColumnDef<TData> {
  return column({
    key,
    label,
    cell: ({ row }) => {
      if (props.cell) return props.cell;
      return <div>{new Date((row.original[key] as string) || '').toLocaleString()}</div>;
    },
    filterFn: (row, colId, value) => daysAgoFilter(row, colId as keyof TData, value),
    filter: {
      type: 'date',
      placeholder: `Enter days ago`,
    },
    ...props,
  });
}
