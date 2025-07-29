'use client';

import { SubmitButton } from '@/components/shared/secure/SubmitButton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tables } from '@/db/schema';
import { Power } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { deleteRows, insertRows } from '@/db/orm';
import { useUser } from '@/lib/providers/UserContext';

type Props = {
  source: Tables<'sources'>;
  integration?: Tables<'source_integrations'>;
};

export default function ToggleIntegration({ source, integration }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const schema = source.config_schema as Record<string, string>;

  const configSchema = z.object(
    Object.fromEntries(
      Object.entries(schema).map(([key, label]) => [key, z.string().min(1, `${label} is required`)])
    )
  );

  const form = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: Object.fromEntries(Object.keys(schema).map((k) => [k, ''])),
  });
  type FormData = z.infer<typeof configSchema>;

  const handleDisable = async () => {
    setIsLoading(true);

    try {
      const result = await deleteRows('source_integrations', {
        filters: [['id', 'eq', integration?.id]],
      });

      if (!result.ok) throw result.error.message;

      toast.info('Disabled integration succesfully');
      window.location.reload();
      setIsOpen(false);
    } catch (err) {
      toast.error(err as string);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      const result = await insertRows('source_integrations', {
        rows: [
          {
            source_id: source.id,
            tenant_id: user?.tenant_id || '',
            config: {
              ...data,
            },
          },
        ],
      });

      if (!result.ok) throw result.error.message;

      toast.info('Enabled integration succesfully!');
      window.location.reload();
      setIsOpen(false);
    } catch (err) {
      toast.error(err as string);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={!integration ? 'default' : 'destructive'}
          className="rounded-l-none py-1! h-full!"
        >
          <Power />
        </Button>
      </DialogTrigger>
      {integration ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Source Integration</DialogTitle>
            <DialogDescription>{source.name} data will be removed in 30 days.</DialogDescription>
          </DialogHeader>
          <span>
            Are you sure you want to disable this integration? Data could be lost within 30 days of
            this action.
          </span>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <SubmitButton
              variant="destructive"
              pending={isLoading}
              onClick={handleDisable}
              module="Sources"
              level="Full"
            >
              Disable
            </SubmitButton>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Source Integration</DialogTitle>
            <DialogDescription>
              Enter required information to start using {source.name}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {Object.entries(schema).map(([key, label]) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input placeholder={label} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
                <SubmitButton type="submit" pending={isLoading} module="Sources" level="Full">
                  Save
                </SubmitButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      )}
    </Dialog>
  );
}
