'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useUser } from '@/lib/providers/UserContext';
import { Input } from '@/components/ui/input';
import DeleteForm from '@/components/forms/DeleteForm';
import DropDownItem from '@/components/ux/DropDownItem';
import { deleteUserAction } from '@/lib/actions/form/users';
import CreateUserDialog from '@/components/dialogs/UserDialog';
import { Tables } from '@/db/schema';

type Props = {
  users: Tables<'users'>[];
  roles: Tables<'roles'>[];
};

export default function UsersTable({ users, roles }: Props) {
  const [search, setSearch] = useState('');
  const context = useUser();

  function filterUsers(user: Tables<'users'>) {
    const lowerSearch = search.toLowerCase();
    const lowerName = user.name.toLowerCase();
    const lowerEmail = user.email.toLowerCase();
    return lowerEmail.includes(lowerSearch) || lowerName.includes(lowerSearch);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center w-full max-w-sm space-x-2">
          <Input
            placeholder="Search users..."
            className="h-9"
            type="search"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex max-w-sm space-x-2">
          <CreateUserDialog
            roles={roles}
            user={{
              id: '',
              tenant_id: context?.tenant_id || '',
              role_id: '',
              name: '',
              email: '',
              last_login: '',
            }}
          />
        </div>
      </div>
      <Card className="py-2">
        <Table>
          <TableCaption>Total Users: {users.length}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.filter(filterUsers).map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{`${user.name}`}</div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.last_login || '').toDateString() || ''}</TableCell>
                <TableCell>{roles.find((role) => role.id === user.role_id)?.name}</TableCell>
                <TableCell>
                  <DeleteForm id={user.id} action={deleteUserAction}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <CreateUserDialog user={user} roles={roles} />
                        <DropDownItem
                          form={user.id}
                          type="submit"
                          variant="destructive"
                          module="users"
                          level="full"
                          disabled={user.id === context?.id}
                        >
                          Delete
                        </DropDownItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DeleteForm>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
