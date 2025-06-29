import { FieldErrors, FieldValues } from 'react-hook-form';

type Props<T extends FieldValues> = {
  name: keyof T;
  errors: FieldErrors<T>;
};

export default function FormError<T extends FieldValues>({ name, errors }: Props<T>) {
  const error = errors?.[name];

  if (!error) return null;

  const message = typeof error === 'object' && 'message' in error ? String(error.message) : '';

  return <span className="text-red-500 text-sm">{message}</span>;
}
