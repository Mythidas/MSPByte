import { FilterValue } from '@/types/data-table';
import { Row } from '@tanstack/react-table';

export function booleanFilter<TData>(row: Row<TData>, colId: keyof TData, value: FilterValue) {
  return row.original[colId] === value.value;
}

export function stringFilter<TData>(row: Row<TData>, colId: keyof TData, value: FilterValue) {
  return (row.original[colId] as string).toLowerCase().includes(value.value);
}

export function numberFilter<TData>(row: Row<TData>, colId: keyof TData, value: FilterValue) {
  const val = (row.original[colId] as any).length;
  switch (value.op) {
    case 'eq':
      return val == value.value;
    case 'gt':
      return val > value.value;
    case 'lt':
      return val < value.value;
    case 'bt':
      return val >= value.value[0] && val <= value.value[1];
  }
  return true;
}

export function daysAgoFilter<TData>(row: Row<TData>, colId: keyof TData, value: FilterValue) {
  const val = new Date((row.original[colId] as any) || '');
  if (isNaN(val.getTime())) return false;

  const now = new Date();

  if (typeof value === 'object' && value.op) {
    const daysToMs = (days: number) => days * 24 * 60 * 60 * 1000;

    switch (value.op) {
      case 'eq': {
        const targetDate = new Date(now.getTime() - daysToMs(value.value));
        return val.toDateString() === targetDate.toDateString();
      }
      case 'gt': {
        const cutoff = new Date(now.getTime() - daysToMs(value.value));
        return val < cutoff;
      }
      case 'lt': {
        const cutoff = new Date(now.getTime() - daysToMs(value.value));
        return val > cutoff;
      }
      case 'bt': {
        const lower = new Date(now.getTime() - daysToMs(value.value[0]));
        const upper = new Date(now.getTime() - daysToMs(value.value[1]));
        return val <= lower && val >= upper;
      }
    }
  }

  return true;
}
