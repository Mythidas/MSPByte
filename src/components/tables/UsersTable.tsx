'use client';

import CreateUserDialog from '@/components/dialogs/CreateUserDialog';
import { Tables } from '@/db/schema';
import DataTable from '@/components/ux/table/DataTable';
import { DataTableColumnDef } from '@/types/data-table';
import { useUser } from '@/lib/providers/UserContext';
import { useEffect, useState } from 'react';
import { getUsers } from '@/services/users';
import { getRoles } from '@/services/roles';
import { pascalCase } from '@/lib/utils';
import { textColumn, dateColumn } from '@/components/ux/table/DataTableColumn';
import UserTableUserDrawer from '@/components/drawers/UserTableUserDrawer';

export default function UsersTable() {
  const [users, setUsers] = useState<Tables<'users'>[]>([]);
  const [roles, setRoles] = useState<Tables<'roles'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: context } = useUser();

  useEffect(() => {
    setIsLoading(true);

    const loadData = async () => {
      const users = await getUsers();
      const roles = await getRoles();

      if (users.ok && roles.ok) {
        setUsers(users.data);
        setRoles(roles.data);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleCreate = (user: Tables<'users'>) => {
    setUsers([...users, user]);
  };

  const handleSave = (user: Tables<'users'>) => {
    const zUsers = [...users].filter((u) => u.id !== user.id);
    setUsers([...zUsers, user]);
  };

  return (
    <DataTable
      data={users}
      isLoading={isLoading}
      action={
        <CreateUserDialog
          roles={roles}
          tenantId={context?.tenant_id || ''}
          onCreate={handleCreate}
        />
      }
      columns={
        [
          textColumn({
            key: 'name',
            label: 'Name',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => (
              <UserTableUserDrawer
                user={row.original}
                disabled={row.original.id === context?.id}
                roles={roles}
                onSave={handleSave}
              >
                {row.original.name}
              </UserTableUserDrawer>
            ),
          }),
          textColumn({
            key: 'email',
            label: 'Email',
            enableHiding: false,
            simpleSearch: true,
          }),
          dateColumn({
            key: 'last_login',
            label: 'Last Activity',
          }),
          textColumn({
            key: 'role_id',
            label: 'Role',
            cell: ({ row }) => (
              <div>{roles.find((role) => role.id === row.original.role_id)?.name}</div>
            ),
            filter: {
              type: 'select',
              options: roles.map((role) => {
                return { label: role.name, value: role.name };
              }),
              placeholder: 'Select role',
            },
            filterFn: (row, colId, value) => {
              const role = roles.find((role) => role.id === row.original.role_id)?.name;
              return role ? role === value.value : false;
            },
          }),
          textColumn({
            key: 'status',
            label: 'Status',
            cell: ({ row }) => pascalCase(row.original.status || ''),
          }),
        ] as DataTableColumnDef<Tables<'users'>>[]
      }
    />
  );
}
