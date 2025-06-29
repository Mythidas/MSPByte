'use client';

import DeleteForm from '@/components/forms/DeleteForm';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ux/SubmitButton';
import { Tables } from '@/db/schema';
import { deleteSiteSourceMapping } from '@/lib/actions/sources';
import { Trash2 } from 'lucide-react';

export function DeleteMappingDialog({
  source,
  mapping,
  siteName,
}: {
  source: Tables<'sources'>;
  mapping: Tables<'site_source_mappings'>;
  siteName: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Mapping</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the mapping between <strong>{siteName}</strong> and
            Sophos site <strong>{mapping.external_name}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <DeleteForm
            id={mapping.id}
            url={`/integrations/source/${source.id}?tab=configuration`}
            onSuccess={() => window.location.reload()}
            action={deleteSiteSourceMapping}
          >
            <SubmitButton variant="destructive">Delete Mapping</SubmitButton>
          </DeleteForm>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
