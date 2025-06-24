'use client';

import CreateUserDialog from '@/components/dialogs/UserDialog';
import { Tables } from '@/db/schema';
import DataTable from '@/components/ux/DataTable';
import { dateColumn, textColumn } from '@/lib/helpers/data-table/columns';
import { DataTableColumnDef } from '@/types/data-table';
import { useUser } from '@/lib/providers/UserContext';
import { useEffect, useState } from 'react';
import { getUsers } from '@/services/users';
import { getRoles } from '@/services/roles';

export default function UsersTable() {
  const [users, setUsers] = useState<Tables<'users'>[]>([]);
  const [roles, setRoles] = useState<Tables<'roles'>[]>([]);
  const context = useUser();

  useEffect(() => {
    const loadData = async () => {
      const users = await getUsers();
      const roles = await getRoles();

      if (users.ok && roles.ok) {
        setUsers(users.data);
        setRoles(roles.data);
      }
    };

    loadData();
  }, []);

  return (
    <DataTable
      data={users}
      action={
        <CreateUserDialog
          roles={roles}
          user={{
            id: '',
            tenant_id: context?.tenant_id || '',
            role_id: '',
            name: '',
            email: '',
          }}
        />
      }
      columns={
        [
          textColumn({
            key: 'name',
            label: 'Name',
            enableHiding: false,
            simpleSearch: true,
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
        ] as DataTableColumnDef<Tables<'users'>>[]
      }
    />
  );
}
