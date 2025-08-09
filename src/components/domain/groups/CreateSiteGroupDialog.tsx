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
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/shared/secure/SubmitButton';
import { Tables } from '@/types/db';
import { useUser } from '@/lib/providers/UserContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { HousePlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { insertRows } from '@/db/orm';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  onSuccess?: (group: Tables<'public', 'site_groups'>) => void;
};

export default function CreateSiteGroupDialog({ onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useUser();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);

      const result = await insertRows('public', 'site_groups', {
        rows: [
          {
            tenant_id: user?.tenant_id || '',
            name: data.name,
            description: data.description,
          },
        ],
      });

      if (!result.ok) throw result.error.message;

      onSuccess?.(result.data[0]);
      setIsOpen(false);
      form.reset();
    } catch (err) {
      toast.error(`Failed to save group: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <SubmitButton module="Groups.Write">
          <HousePlus className="h-4 w-4 mr-2" />
          Add Group
        </SubmitButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <AlertDialogHeader>
              <AlertDialogTitle>Create Group</AlertDialogTitle>
              <AlertDialogDescription>
                Enter a name and description for the group
              </AlertDialogDescription>
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description <span className="text-xs text-muted-foreground">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <SubmitButton pending={isSaving}>Create Group</SubmitButton>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
