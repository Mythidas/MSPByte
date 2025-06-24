import { FilterValue } from '@/types/data-table';
import { Row } from '@tanstack/react-table';

export function booleanFilter<TData>(row: Row<TData>, colId: keyof TData, value: FilterValue) {
  return row.original[colId] === value.value;
}

export function stringFilter<TData>(row: Row<TData>, colId: keyof TData, value: FilterValue) {
  return (row.original[colId] as string).toLowerCase().includes(value.value as string);
}

export function numberFilter<TData>(row: Row<TData>, colId: keyof TData, value: FilterValue) {
  if (!value.value) return false;
  const val = (row.original[colId] as number[]).length;
  const currentValue = value.value as number;
  switch (value.op) {
    case 'eq':
      return val === currentValue;
    case 'gt':
      return val > currentValue;
    case 'lt':
      return val < currentValue;
    case 'bt':
      if (Array.isArray(value.value)) {
        return val >= (value.value[0]! as number) && val <= (value.value[1]! as number);
      }
      return false;
  }
  return true;
}

export function daysAgoFilter<TData>(row: Row<TData>, colId: keyof TData, value: FilterValue) {
  const val = new Date((row.original[colId] as string) || '');
  if (isNaN(val.getTime())) return false;

  const now = new Date();

  if (typeof value === 'object' && value.op) {
    const daysToMs = (days: number) => days * 24 * 60 * 60 * 1000;

    switch (value.op) {
      case 'eq': {
        const targetDate = new Date(now.getTime() - daysToMs(value.value as number));
        return val.toDateString() === targetDate.toDateString();
      }
      case 'gt': {
        const cutoff = new Date(now.getTime() - daysToMs(value.value as number));
        return val < cutoff;
      }
      case 'lt': {
        const cutoff = new Date(now.getTime() - daysToMs(value.value as number));
        return val > cutoff;
      }
      case 'bt': {
        if (Array.isArray(value.value)) {
          const lower = new Date(now.getTime() - daysToMs(value.value[0]! as number));
          const upper = new Date(now.getTime() - daysToMs(value.value[1]! as number));
          return val <= lower && val >= upper;
        }
      }
    }
  }

  return true;
}
