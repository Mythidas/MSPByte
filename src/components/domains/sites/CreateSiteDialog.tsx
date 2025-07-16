'use client';

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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import RouteButton from '@/components/common/routed/RouteButton';
import { SubmitButton } from '@/components/common/SubmitButton';
import { Tables } from '@/db/schema';
import { useUser } from '@/lib/providers/UserContext';
import { getSiteView, putSite } from '@/services/sites';
import { zodResolver } from '@hookform/resolvers/zod';
import { HousePlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  isParent: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  parentId?: string;
  onSuccess?: (site: Tables<'sites_view'>) => void;
};

export default function CreateSiteDialog({ parentId, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useUser();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      isParent: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);

      const result = await putSite([
        {
          tenant_id: user?.tenant_id || '',
          parent_id: parentId,
          name: data.name,
          is_parent: !!data.isParent,
        },
      ]);

      if (!result.ok) throw result.error.message;

      const view = await getSiteView(result.data[0].id);
      if (!view.ok) throw view.error.message;

      onSuccess?.(view.data);
      setIsOpen(false);
    } catch (err) {
      toast.error(`Failed to save site: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <RouteButton module="Sites" level="Write">
          <HousePlus className="h-4 w-4 mr-2" />
          Add Site
        </RouteButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <AlertDialogHeader>
              <AlertDialogTitle>Create Site</AlertDialogTitle>
              <AlertDialogDescription>Enter a name to create a site</AlertDialogDescription>
            </AlertDialogHeader>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!parentId && (
              <FormField
                control={form.control}
                name="isParent"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                      />
                    </FormControl>
                    <FormLabel className="mb-0">Parent?</FormLabel>
                  </FormItem>
                )}
              />
            )}

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <SubmitButton pending={isSaving}>Create Site</SubmitButton>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
