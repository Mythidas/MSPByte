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
import { RowFilter, Table } from '@/types/db';
import { Tables } from '@/db/schema';

type UseDeleteOptions<T extends Table> = {
  table: T;
  getId: (item: Tables<T>) => Record<string, string>; // or string | Record<string, string>
  displayKey?: keyof Tables<T>;
  onDeleted?: (item: Tables<T>) => void;
  refetch?: () => void;
};

export function useDelete<T extends Table>({
  table,
  getId,
  displayKey,
  onDeleted,
  refetch,
}: UseDeleteOptions<T>) {
  const [itemToDelete, setItemToDelete] = useState<Tables<T> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmAndDelete = (item: Tables<T>) => setItemToDelete(item);

  const doDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const idFields = getId(itemToDelete) as Record<string, unknown>;
      const filters = Object.entries(idFields).map(
        ([column, value]) => [column, 'eq', value] as RowFilter<T>
      );

      const result = await deleteRows(table, {
        filters: filters as RowFilter<T>[],
      });

      if (!result.ok) throw result.error;
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
