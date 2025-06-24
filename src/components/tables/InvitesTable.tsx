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
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DeleteForm from '@/components/forms/DeleteForm';
import DropDownItem from '@/components/ux/DropDownItem';
import { deleteInviteAction } from '@/lib/actions/form/users';
import { Tables } from '@/db/schema';
import DataTable from '@/components/ux/DataTable';
import { DataTableColumnDef } from '@/types/data-table';
import { dateColumn, textColumn } from '@/lib/helpers/data-table/columns';
import { getRoles } from '@/services/roles';
import { getInvites } from '@/services/users';

export default function InvitesTable() {
  const [invites, setInvites] = useState<Tables<'invites'>[]>([]);
  const [roles, setRoles] = useState<Tables<'roles'>[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const invites = await getInvites();
      const roles = await getRoles();

      if (invites.ok && roles.ok) {
        setInvites(invites.data);
        setRoles(roles.data);
      }
    };

    loadData();
  }, []);

  return (
    <DataTable
      data={invites}
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
          textColumn({
            key: 'role_id',
            label: 'Role',
            cell: ({ row }) => (
              <div>{roles.find((role) => role.id === row.original.role_id)?.name}</div>
            ),
            filter: {
              type: 'select',
              options: roles.map((role) => {
                return { label: role.name, value: role.id };
              }),
            },
            filterFn: (row, colId, value) => row.original.role_id === value.value,
          }),
          dateColumn({
            key: 'created_at',
            label: 'Created',
          }),
        ] as DataTableColumnDef<Tables<'invites'>>[]
      }
    />
  );
}
