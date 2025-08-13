'use client';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { SubmitButton } from '@/components/shared/secure/SubmitButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Form, FormField, FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Tables } from '@/types/db';
import { pascalCase } from '@/lib/utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useState } from 'react';
import EditableInput from '@/components/shared/EditableInput';
import { updateRow } from '@/db/orm';

const schema = z.object({
  name: z.string().min(1),
  role_id: z.string().uuid(),
  status: z.string(),
});

type FormSchema = z.infer<typeof schema>;

type Props = {
  user: Tables<'public', 'users'>;
  roles: Tables<'public', 'roles'>[];
  children: React.ReactNode;
  disabled?: boolean;
  onSave?: (user: Tables<'public', 'users'>) => void;
};

export default function UserTableUserDrawer({ user, roles, children, disabled, onSave }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      role_id: user.role_id,
      status: user.status || 'active',
    },
  });

  const handleSubmit = async (values: FormSchema) => {
    const changes: Partial<FormSchema> = {};
    setIsSaving(true);
    if (values.name !== user.name) changes.name = values.name;
    if (values.role_id !== user.role_id) changes.role_id = values.role_id;
    if (values.status !== user.status) changes.status = values.status;

    if (Object.keys(changes).length === 0) {
      toast.info('No changes made');
      setIsSaving(false);
      return;
    }

    const result = await updateRow('public', 'users', {
      id: user.id,
      row: { ...user, ...changes },
    });

    if (!result.error) {
      toast.success('User updated');
      setIsOpen(false);
      if (onSave) onSave(result.data);
    } else {
      toast.error(`Failed to save user: ${result.error.message}`);
    }

    setIsSaving(false);
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger className="hover:cursor-pointer hover:text-primary">{children}</DrawerTrigger>
      <DrawerContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
            <DrawerHeader className="gap-0!">
              <DrawerTitle className="flex justify-between items-center gap-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <EditableInput {...field} disabled={disabled} defaultValue={user.name} />
                  )}
                />
                <Badge
                  variant={
                    user.status === 'pending'
                      ? 'secondary'
                      : user.status === 'disabled'
                        ? 'destructive'
                        : 'default'
                  }
                  className="text-sm"
                >
                  {pascalCase(user.status || '')}
                </Badge>
              </DrawerTitle>
              <DrawerDescription>{user.email}</DrawerDescription>
            </DrawerHeader>

            <Separator />

            <div className="flex flex-col gap-6 p-4 flex-1 overflow-y-auto">
              <Label className="flex flex-col gap-2 items-start">
                <strong>Last Login</strong>
                {user.last_login_at ? new Date(user.last_login_at).toDateString() : 'Never'}
              </Label>

              <FormField
                control={form.control}
                name="role_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={disabled}
                      defaultValue={user.status || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active" disabled={user.status === 'pending'}>
                          Active
                        </SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <DrawerFooter className="flex flex-row w-full gap-2 items-end justify-start">
              <SubmitButton pending={isSaving}>Apply</SubmitButton>
              <DrawerClose asChild>
                <Button variant="secondary">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
