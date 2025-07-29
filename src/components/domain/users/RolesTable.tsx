'use client';

import { Tables } from '@/db/schema';
import DataTable from '@/components/shared/table/DataTable';
import { DataTableColumnDef, DataTableFetcher } from '@/types/data-table';
import { numberColumn, textColumn } from '@/components/shared/table/DataTableColumn';
import { getRoles } from '@/services/roles';
import { getUsers } from '@/services/users';
import { useState } from 'react';

export default function RolesTable() {
  const [users, setUsers] = useState<Tables<'users'>[]>([]);

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const roles = await getRoles({
      page: pageIndex,
      size: pageSize,
      ...props,
    });
    const users = await getUsers();
    if (users.ok) {
      setUsers(users.data.rows);
    }

    if (!roles.ok) {
      return { rows: [], total: 0 };
    }

    return roles.data;
  };
  return (
    <DataTable
      fetcher={fetcher}
      columns={
        [
          textColumn({
            key: 'name',
            label: 'Name',
            enableHiding: false,
            simpleSearch: true,
          }),
          numberColumn({
            key: 'rights',
            label: 'Users',
            cell: ({ row }) => (
              <div>{users.filter((u) => u.role_id === row.original.id).length}</div>
            ),
          }),
          textColumn({
            key: 'description',
            label: 'Description',
            enableHiding: false,
            simpleSearch: true,
          }),
          textColumn({
            key: 'tenant_id',
            label: 'Custom',
            cell: ({ row }) => <div>{row.original.tenant_id ? 'True' : 'False'}</div>,
          }),
        ] as DataTableColumnDef<Tables<'roles'>>[]
      }
      filters={{
        Role: {
          name: {
            label: 'Name',
            type: 'text',
            placeholder: 'Search name',
            simpleSearch: true,
          },
          description: {
            label: 'Description',
            type: 'text',
            placeholder: 'Search description',
            simpleSearch: true,
          },
        },
      }}
    />
  );
}
