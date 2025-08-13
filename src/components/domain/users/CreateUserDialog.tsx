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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubmitButton } from '@/components/shared/secure/SubmitButton';
import { Tables } from '@/types/db';
import { putUser } from '@/services/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1, 'Name is required'),
  role_id: z.string().min(1, 'Please select a role'),
  sendEmail: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  tenantId: string;
  roles: Tables<'public', 'roles'>[];
  onCreate?: (user: Tables<'public', 'users'>) => void;
};

export default function CreateUserDialog({ tenantId, roles, onCreate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      role_id: '',
      sendEmail: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);
      const { sendEmail, ...user } = data;

      const result = await putUser(
        {
          tenant_id: tenantId,
          ...user,
        },
        sendEmail
      );

      if (result.error) {
        throw result.error.message;
      }

      onCreate?.(result.data);
      setIsOpen(false);
      form.reset();
      toast.success('User created successfully');
    } catch (err) {
      toast.error(`Failed to create user: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <SubmitButton className="w-full !justify-start px-2" module="Sites.Write">
          <UserPlus className="h-4 w-4 mr-2" />
          <span>Create User</span>
        </SubmitButton>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <AlertDialogHeader>
              <AlertDialogTitle>Create User</AlertDialogTitle>
              <AlertDialogDescription>Add a new user to your organization</AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />

              <FormField
                control={form.control}
                name="role_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sendEmail"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Send invitation email
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
              <SubmitButton pending={isSaving}>Create User</SubmitButton>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
