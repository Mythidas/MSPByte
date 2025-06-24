import { Row } from '@tanstack/react-table';

export function booleanSort<TData>(rowA: Row<TData>, rowB: Row<TData>, colId: keyof TData) {
  return Number(rowB.original[colId]) - Number(rowA.original[colId]);
}

export function listLengthSort<TData>(rowA: Row<TData>, rowB: Row<TData>, colId: keyof TData) {
  return (rowB.original[colId] as unknown[]).length - (rowA.original[colId] as unknown[]).length;
}
