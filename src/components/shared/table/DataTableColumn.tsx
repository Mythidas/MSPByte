import { DataTableHeader } from '@/components/shared/table/DataTableHeader';
import { cn } from '@/lib/utils';
import { DataTableColumnDef } from '@/types/data-table';

type GenericColumnProps<TData> = {
  key: string;
  label: string;
  alignRight?: boolean;
} & Partial<DataTableColumnDef<TData>>;

type StrictGenericColumnProps<TData> = {
  key: keyof TData;
} & GenericColumnProps<TData>;

type BooleanColumnProps<TData> = {
  valid?: string;
  invalid?: string;
} & StrictGenericColumnProps<TData>;

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
}: StrictGenericColumnProps<TData>): DataTableColumnDef<TData> {
  return column({
    key,
    label,
    ...props,
  });
}

export function numberColumn<TData>({
  key,
  label,
  ...props
}: StrictGenericColumnProps<TData>): DataTableColumnDef<TData> {
  return column({
    key,
    label,
    ...props,
  });
}

export function listColumn<TData>({
  key,
  label,
  ...props
}: StrictGenericColumnProps<TData>): DataTableColumnDef<TData> {
  return column({
    key,
    label,
    cell: ({ row }) => {
      if (props.cell) return props.cell;
      return <div>{Array.isArray(row.original[key]) && Array(...row.original[key]).length}</div>;
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
    ...props,
  });
}

export function dateColumn<TData>({
  key,
  label,
  ...props
}: StrictGenericColumnProps<TData>): DataTableColumnDef<TData> {
  return column({
    key,
    label,
    cell: ({ row }) => {
      if (props.cell) return props.cell;
      return (
        <div>
          {row.original[key]
            ? new Date(row.original[key] as string).toLocaleString()
            : 'Unavailable'}
        </div>
      );
    },
    ...props,
  });
}
