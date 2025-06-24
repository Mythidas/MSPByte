'use client';

import { Tables } from '@/db/schema';
import DataTable from '@/components/ux/DataTable';
import { DataTableColumnDef } from '@/types/data-table';
import { booleanColumn, numberColumn, textColumn } from '@/lib/helpers/data-table/columns';
import { getRoles } from '@/services/roles';
import { getUsers } from '@/services/users';
import { useState, useEffect } from 'react';

export default function RolesTable() {
  const [users, setUsers] = useState<Tables<'users'>[]>([]);
  const [roles, setRoles] = useState<Tables<'roles'>[]>([]);

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
      data={roles}
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
            filter: undefined,
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
            filter: undefined,
          }),
        ] as DataTableColumnDef<Tables<'roles'>>[]
      }
    />
  );
}
