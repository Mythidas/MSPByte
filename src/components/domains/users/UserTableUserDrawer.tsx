import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  Drawer,
  DrawerClose,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import EditableInput from '@/components/common/EditableInput';
import EditableSelect from '@/components/common/EditableSelect';
import { SubmitButton } from '@/components/common/SubmitButton';
import { Tables } from '@/db/schema';
import { pascalCase } from '@/lib/utils';
import { updateUser } from '@/services/users';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

enum Fields {
  name = 'name',
  roleId = 'role_id',
  status = 'status',
}

type Props = {
  user: Tables<'users'>;
  roles: Tables<'roles'>[];
  children: React.ReactNode;
  disabled?: boolean;
  onSave?: (user: Tables<'users'>) => void;
};

export default function UserTableUserDrawer({ user, roles, children, disabled, onSave }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const refs = useRef<Record<string, [string, string]>>({});

  const handleApply = () => {
    setIsSaving(true);

    const keysToSave: Record<string, string> = {};
    for (const [key, value] of Object.entries(refs.current)) {
      if (value[0] !== value[1]) {
        keysToSave[key] = value[1];
      }
    }

    if (Object.entries(keysToSave).length > 0) {
      updateUser(user.id, {
        ...user,
        ...keysToSave,
      })
        .then((res) => {
          if (res.ok) {
            toast.info('Saved user info');
            setIsOpen(false);
            if (onSave) onSave(res.data);
          } else {
            toast.error(`Failed to save user: ${res.error.message}`);
          }
        })
        .finally(() => setIsSaving(false));
    } else {
      toast.info('No changes made');
      setIsSaving(false);
    }
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger className="hover:cursor-pointer hover:text-primary">{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-0!">
          <DrawerTitle className="flex justify-between">
            <EditableInput
              disabled={disabled}
              defaultValue={user.name}
              onChange={(e) => (refs.current[Fields.name] = [user.name, e])}
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

        <div className="flex flex-col gap-6 size-full p-4">
          <Label className="flex flex-col gap-2 items-start">
            <strong>Last Login</strong>
            {user.last_login ? new Date(user.last_login).toDateString() : 'Never'}
          </Label>
          <Label className="flex flex-col gap-2 items-start">
            <strong>Role</strong>
            <EditableSelect
              disabled={disabled}
              defaultValue={user.role_id}
              options={roles.map((role) => {
                return { label: role.name, value: role.id };
              })}
              onChange={(e) => (refs.current[Fields.roleId] = [user.role_id, e])}
            />
          </Label>
        </div>

        <DrawerFooter className="flex flex-row w-full gap-2 items-end justify-start">
          <SubmitButton onClick={handleApply} pending={isSaving}>
            Apply
          </SubmitButton>
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
