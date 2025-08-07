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
import { SubmitButton } from '@/components/shared/secure/SubmitButton';
import { Tables } from '@/db/schema';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getRow, insertRows } from '@/db/orm';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useEffect, useState } from 'react';
import { getRows } from '@/db/orm';
import { Plus } from 'lucide-react';
import SearchBox from '@/components/shared/SearchBox';

const formSchema = z.object({
  site_id: z.string().uuid('Site is required'),
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  group: Tables<'site_groups'>;
  onSuccess?: (view: Tables<'site_group_memberships_view'>) => void;
};

export default function CreateGroupMembershipDialog({ group, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sites, setSites] = useState<Tables<'sites'>[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      site_id: '',
    },
  });

  useEffect(() => {
    const fetchSites = async () => {
      const existing = await getRows('site_group_memberships', {
        filters: [['group_id', 'eq', group.id]],
      });
      const res = await getRows('sites', {
        filters: [
          existing.ok ? ['id', 'not.in', existing.data.rows.map((e) => e.site_id)] : undefined,
        ],
      });
      if (res.ok) setSites(res.data.rows);
      else toast.error('Failed to load sites');
    };

    if (isOpen) fetchSites();
  }, [isOpen]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);

      const result = await insertRows('site_group_memberships', {
        rows: [
          {
            site_id: data.site_id,
            group_id: group.id,
            tenant_id: group.tenant_id,
          },
        ],
      });

      if (!result.ok) throw result.error.message;

      const view = await getRow('site_group_memberships_view', {
        filters: [
          ['site_id', 'eq', result.data[0].site_id],
          ['group_id', 'eq', result.data[0].group_id],
        ],
      });

      if (view.ok) {
        onSuccess?.(view.data);
      }
      setIsOpen(false);
      form.reset();
    } catch (err) {
      toast.error(`Failed to add site to group: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <SubmitButton module="Groups.Write">
          <Plus className="h-4 w-4 mr-2" />
          Add Site to Group
        </SubmitButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Site to Group</AlertDialogTitle>
              <AlertDialogDescription>Select a site to add to this group.</AlertDialogDescription>
            </AlertDialogHeader>

            <FormField
              control={form.control}
              name="site_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site</FormLabel>
                  <FormControl>
                    <SearchBox
                      options={sites.map((site) => {
                        return { label: site.name, value: site.id };
                      })}
                      onSelect={field.onChange}
                      defaultValue={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <SubmitButton pending={isSaving}>Add Site</SubmitButton>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
