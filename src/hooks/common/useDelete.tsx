import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { SubmitButton } from '@/components/shared/secure/SubmitButton';
import { prettyText } from '@/lib/utils';
import { deleteRows } from '@/db/orm';
import { RowFilter, Schemas, Table, Tables } from '@/types/db';

type UseDeleteOptions<S extends Schemas, T extends Table<S>> = {
  schema: S;
  table: T;
  getId: (item: Tables<S, T>) => Record<string, string>; // or string | Record<string, string>
  displayKey?: keyof Tables<S, T>;
  onDeleted?: (item: Tables<S, T>) => void;
  refetch?: () => void;
};

export function useDelete<S extends Schemas, T extends Table<S>>({
  schema,
  table,
  getId,
  displayKey,
  onDeleted,
  refetch,
}: UseDeleteOptions<S, T>) {
  const [itemToDelete, setItemToDelete] = useState<Tables<S, T> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmAndDelete = (item: Tables<S, T>) => setItemToDelete(item);

  const doDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const idFields = getId(itemToDelete) as Record<string, unknown>;
      const filters = Object.entries(idFields).map(
        ([column, value]) => [column, 'eq', value] as RowFilter<S, T>
      );

      const result = await deleteRows(schema, table, {
        filters: filters as RowFilter<S, T>[],
      });

      if (result.error) throw result.error;
      onDeleted?.(itemToDelete);
      refetch?.();
    } catch (err) {
      toast.error(`Failed to delete: ${String(err)}`);
    } finally {
      setItemToDelete(null);
      setIsDeleting(false);
    }
  };

  const DeleteDialog = () =>
    itemToDelete ? (
      <AlertDialog open={!!itemToDelete} onOpenChange={(v) => !v && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {prettyText(table as string)}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium">
                {displayKey ? (itemToDelete[displayKey] as string) : 'this item'}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <SubmitButton pending={isDeleting} variant="destructive" onClick={doDelete}>
              Delete
            </SubmitButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ) : null;

  return {
    confirmAndDelete,
    DeleteDialog,
  };
}
