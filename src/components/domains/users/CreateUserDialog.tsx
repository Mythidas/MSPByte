import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import FormError from '@/components/common/FormError';
import { SubmitButton } from '@/components/common/SubmitButton';
import { Tables } from '@/db/schema';
import { putUser } from '@/services/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  role_id: z.string({ message: 'Please select a role' }),
  sendEmail: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  tenantId: string;
  roles: Tables<'roles'>[];
  onCreate?: (user: Tables<'users'>) => void;
};

export default function CreateUserDialog({ tenantId, roles, onCreate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
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

      if (!result.ok) {
        throw result.error.message;
      }

      if (onCreate) onCreate(result.data);
      setIsOpen(false);
    } catch (err) {
      toast.error(`Failed to create user: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full !justify-start px-2">
          <UserPlus className="h-4 w-4 mr-2" />
          <span>Create User</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>
            <AlertDialogTitle>Create User</AlertDialogTitle>
          </AlertDialogHeader>

          <Label className="flex flex-col items-start">
            Name
            <Input placeholder="John Doe" {...register('name')} />
            <FormError name="name" errors={errors} />
          </Label>
          <Label className="flex flex-col items-start">
            Email
            <Input placeholder="John.Doe@email.com" {...register('email')} />
            <FormError name="email" errors={errors} />
          </Label>

          <Separator />

          <Label className="flex flex-col items-start">
            Role
            <Select
              onValueChange={(value) => setValue('role_id', value, { shouldValidate: true })}
              defaultValue={watch('role_id')}
            >
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
            <FormError name="role_id" errors={errors} />
          </Label>

          <Label>
            <Checkbox
              {...register('sendEmail')}
              defaultChecked={watch('sendEmail')}
              onCheckedChange={(value) => setValue('sendEmail', value as boolean)}
            />
            Send invitation email?
            <FormError name="sendEmail" errors={errors} />
          </Label>

          <Separator />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Close</AlertDialogCancel>
            <SubmitButton pending={isSaving}>Create</SubmitButton>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
