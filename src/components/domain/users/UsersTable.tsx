'use client';

import CreateUserDialog from '@/components/domain/users/CreateUserDialog';
import { Tables } from '@/db/schema';
import DataTable, { DataTableRef } from '@/components/shared/table/DataTable';
import { DataTableColumnDef, DataTableFetcher } from '@/types/data-table';
import { useUser } from '@/lib/providers/UserContext';
import { useRef, useState } from 'react';
import { getUsers } from '@/services/users';
import { getRoles } from '@/services/roles';
import { pascalCase } from '@/lib/utils';
import { textColumn, dateColumn } from '@/components/shared/table/DataTableColumn';
import UserTableUserDrawer from '@/components/domain/users/UserTableUserDrawer';

export default function UsersTable() {
  const [roles, setRoles] = useState<Tables<'roles'>[]>([]);
  const tableRef = useRef<DataTableRef>(null);
  const { user: context } = useUser();

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const users = await getUsers({
      page: pageIndex,
      size: pageSize,
      ...props,
    });
    const roles = await getRoles();
    if (roles.ok) {
      setRoles(roles.data.rows);
    }

    if (!users.ok) {
      return { rows: [], total: 0 };
    }

    return users.data;
  };

  const handleChange = () => {
    tableRef.current?.refetch();
  };

  return (
    <DataTable
      fetcher={fetcher}
      ref={tableRef}
      action={() => (
        <CreateUserDialog
          roles={roles}
          tenantId={context?.tenant_id || ''}
          onCreate={handleChange}
        />
      )}
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
                onSave={handleChange}
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
          }),
          textColumn({
            key: 'status',
            label: 'Status',
            cell: ({ row }) => pascalCase(row.original.status || ''),
          }),
        ] as DataTableColumnDef<Tables<'users'>>[]
      }
      filters={{
        User: {
          name: {
            label: 'Name',
            type: 'text',
            placeholder: 'Search name',
            simpleSearch: true,
          },
          email: {
            label: 'Email',
            type: 'text',
            placeholder: 'Search email',
            simpleSearch: true,
          },
          role: {
            label: 'Role',
            type: 'select',
            placeholder: 'Select role',
            options: roles.map((role) => {
              return { label: role.name, value: role.id };
            }),
          },
          status: {
            label: 'Status',
            type: 'select',
            placeholder: 'Select status',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Pending', value: 'pending' },
              { label: 'Disabled', value: 'disabled' },
            ],
          },
        },
      }}
    />
  );
}
