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
import { SubmitButton } from '@/components/common/SubmitButton';
import { Database } from '@/db/schema';
import { deleteRows } from '@/services/general';
import { prettyText } from '@/lib/utils';

type UseDeleteOptions<T> = {
  tableName: keyof Database['public']['Tables'];
  getId: (item: T) => string;
  displayKey?: keyof T;
  onDeleted?: (item: T) => void;
  refetch?: () => void;
};

export function useDelete<T>({
  tableName,
  getId,
  displayKey,
  onDeleted,
  refetch,
}: UseDeleteOptions<T>) {
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmAndDelete = (item: T) => setItemToDelete(item);

  const doDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const id = getId(itemToDelete);
      const result = await deleteRows(tableName, [id]);

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
            <AlertDialogTitle>Delete {prettyText(tableName as string)}?</AlertDialogTitle>
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
