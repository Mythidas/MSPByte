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
import FormAlert from '@/components/ux/FormAlert';
import FormError from '@/components/ux/FormError';
import { SubmitButton } from '@/components/ux/SubmitButton';
import { Tables, TablesInsert } from '@/db/schema';
import { createUserAction } from '@/lib/actions/users';
import { UserFormValues } from '@/lib/forms/users';
import { useUser } from '@/lib/providers/UserContext';
import { FormState } from '@/types';
import { UserPlus } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';

type Props = {
  user: TablesInsert<'users'>;
  roles: Tables<'roles'>[];
  onCreate?: (user: Tables<'users'>) => void;
};

export default function CreateUserDialog({ user, roles, onCreate }: Props) {
  const [state, formAction] = useActionState<FormState<UserFormValues>, FormData>(
    createUserAction,
    {}
  );
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const context = useUser();
  const tag = user.id ? 'Edit' : 'Create';

  useEffect(() => {
    if (state.success) {
      if (onCreate) onCreate(state.values as Tables<'users'>);
      setIsOpen(false);
    }
  }, [state, onCreate]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={user.id ? 'ghost' : 'default'} className="w-full !justify-start px-2">
          {!user.id && <UserPlus className="h-4 w-4 mr-2" />}
          <span>{`${tag} user`}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form className="flex flex-col gap-4" action={formAction}>
          <AlertDialogHeader>
            <AlertDialogTitle>{`${tag} user`}</AlertDialogTitle>
          </AlertDialogHeader>

          <input hidden name="tenant_id" defaultValue={user.tenant_id} />
          <input hidden id="role_id" name="role_id" defaultValue={role} />
          <input
            hidden
            id="send_email"
            name="send_email"
            type="checkbox"
            checked={sendEmail}
            readOnly
          />

          <FormAlert errors={state.errors} message={state.message} />
          <Label className="flex flex-col items-start">
            Name
            <Input
              name="name"
              placeholder="John Doe"
              defaultValue={state.values?.name || user.name}
              disabled={context?.id === user.id}
            />
            <FormError name="name" errors={state.errors} />
          </Label>
          <Label className="flex flex-col items-start">
            Email
            <Input
              name="email"
              placeholder="John.Doe@email.com"
              defaultValue={state.values?.email || user.email}
              disabled={context?.id === user.id}
            />
            <FormError name="email" errors={state.errors} />
          </Label>

          <Separator />

          <Label className="flex flex-col items-start">
            Role
            <Select
              onValueChange={(e) => setRole(e)}
              defaultValue={state.values?.role_id || user.role_id}
              disabled={context?.id === user.id}
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
            <FormError name="role_id" errors={state.errors} />
          </Label>

          {!user.id && (
            <Label>
              <Checkbox defaultChecked={sendEmail} onChange={() => setSendEmail(!sendEmail)} />
              Send invitation email?
              <FormError name="send_email" errors={state.errors} />
            </Label>
          )}

          <Separator />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <SubmitButton pendingText={`${tag} User...`}>{`${tag} User`}</SubmitButton>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
