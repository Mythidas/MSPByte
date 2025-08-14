'use client';

import CreateUserDialog from '@/features/users/components/CreateUserDialog';
import { useRef, useState } from 'react';
import UserTableUserDrawer from '@/features/users/components/UserTableUserDrawer';
import { getRows } from '@/db/orm';
import { Tables } from '@/types/db';
import { useUser } from '@/shared/lib/providers/UserContext';
import { pascalCase } from '@/shared/lib/utils';
import { DataTableFetcher, DataTableColumnDef } from '@/features/data-table/types/table';
import DataTable, { DataTableRef } from '@/features/data-table/components/DataTable';
import { textColumn, dateColumn } from '@/features/data-table/components/DataTableColumn';

export default function UsersTable() {
  const [roles, setRoles] = useState<Tables<'public', 'roles'>[]>([]);
  const tableRef = useRef<DataTableRef>(null);
  const { user: context } = useUser();

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const users = await getRows('public', 'users', {
      pagination: {
        page: pageIndex,
        size: pageSize,
        ...props,
      },
    });
    const roles = await getRows('public', 'roles');
    if (!roles.error) {
      setRoles(roles.data.rows);
    }

    if (users.error) {
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
      lead={() => (
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
            key: 'last_login_at',
            label: 'Last Login',
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
        ] as DataTableColumnDef<Tables<'public', 'users'>>[]
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
