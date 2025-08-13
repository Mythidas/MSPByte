'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useRef } from 'react';
import DropDownItem from '@/components/shared/secure/DropDownItem';
import { toast } from 'sonner';
import { Tables } from '@/types/db';
import DataTable, { DataTableRef } from '@/components/shared/table/DataTable';
import { DataTableColumnDef, DataTableFetcher } from '@/types/data-table';
import { column, textColumn } from '@/components/shared/table/DataTableColumn';
import Link from 'next/link';
import { useDelete } from '@/hooks/common/useDelete';
import { getRows } from '@/db/orm';
import CreateGroupMembershipDialog from '@/components/domain/groups/CreateGroupMembershipDialog';

type Props = {
  group: Tables<'public', 'site_groups'>;
};

export default function GroupSiteTable({ group }: Props) {
  const tableRef = useRef<DataTableRef>(null);
  const { confirmAndDelete, DeleteDialog } = useDelete({
    schema: 'public',
    table: 'site_group_memberships',
    displayKey: 'site_id',
    getId: (item) => ({
      site_id: item.site_id,
      group_id: item.group_id,
    }),
    refetch: () => tableRef.current?.refetch(),
  });

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const memberships = await getRows('public', 'site_group_memberships_view', {
      filters: [['group_id', 'eq', group.id]],
      pagination: {
        page: pageIndex,
        size: pageSize,
        ...props,
      },
    });
    if (memberships.error) {
      return { rows: [], total: 0 };
    }

    return memberships.data;
  };

  const createCallback = (membership: Tables<'public', 'site_group_memberships_view'>) => {
    tableRef.current?.refetch();
    toast.info(`Linked site ${membership.site_name}`);
  };

  return (
    <DataTable
      fetcher={fetcher}
      ref={tableRef}
      lead={() => (
        <div className="flex gap-2">
          <DeleteDialog />
          <CreateGroupMembershipDialog group={group} onSuccess={createCallback} />
        </div>
      )}
      columns={
        [
          textColumn({
            key: 'site_name',
            label: 'Name',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => (
              <Link href={`/sites/${row.original.site_slug}`} className="hover:text-primary">
                {row.original.site_name}
              </Link>
            ),
          }),
          column({
            key: 'id',
            label: 'Actions',
            alignRight: true,
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropDownItem
                    variant="destructive"
                    module="Groups.Delete"
                    onClick={() =>
                      confirmAndDelete(
                        row.original as unknown as Tables<'public', 'site_group_memberships'>
                      )
                    }
                  >
                    Delete
                  </DropDownItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          }),
        ] as DataTableColumnDef<Tables<'public', 'site_group_memberships_view'>>[]
      }
      filters={{
        Site: {
          site_name: {
            label: 'Name',
            type: 'text',
            placeholder: 'Search name',
            simpleSearch: true,
          },
        },
      }}
    />
  );
}
