'use client';

import { Tables } from '@/types/db';
import DataTable from '@/features/data-table/components/DataTable';
import { DataTableColumnDef, DataTableFetcher } from '@/features/data-table/types/table';
import { numberColumn, textColumn } from '@/features/data-table/components/DataTableColumn';
import { useState } from 'react';
import { getRows } from '@/db/orm';

export default function RolesTable() {
  const [users, setUsers] = useState<Tables<'public', 'users'>[]>([]);

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const roles = await getRows('public', 'roles', {
      pagination: {
        page: pageIndex,
        size: pageSize,
        ...props,
      },
    });
    const users = await getRows('public', 'users');
    if (!users.error) {
      setUsers(users.data.rows);
    }

    if (roles.error) {
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
        ] as DataTableColumnDef<Tables<'public', 'roles'>>[]
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
