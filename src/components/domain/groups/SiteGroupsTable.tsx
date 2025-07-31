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
import { Tables } from '@/db/schema';
import DataTable, { DataTableRef } from '@/components/shared/table/DataTable';
import { DataTableColumnDef, DataTableFetcher } from '@/types/data-table';
import { column, textColumn } from '@/components/shared/table/DataTableColumn';
import Link from 'next/link';
import { useDelete } from '@/hooks/common/useDelete';
import { getRows } from '@/db/orm';
import CreateSiteGroupDialog from '@/components/domain/groups/CreateSiteGroupDialog';
import { useSource } from '@/lib/providers/SourceContext';

export default function SiteGroupsTable() {
  const { source } = useSource();
  const tableRef = useRef<DataTableRef>(null);
  const { confirmAndDelete, DeleteDialog } = useDelete({
    table: 'site_groups',
    displayKey: 'name',
    getId: (item) => ({
      id: item.id,
    }),
    refetch: () => tableRef.current?.refetch(),
  });

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const groups = await getRows('site_groups', {
      pagination: {
        page: pageIndex,
        size: pageSize,
        ...props,
      },
    });

    if (!groups.ok) {
      return { rows: [], total: 0 };
    }

    return groups.data;
  };

  const createCallback = (group: Tables<'site_groups'>) => {
    tableRef.current?.refetch();
    toast.info(`Created group ${group.name}`);
  };

  return (
    <DataTable
      fetcher={fetcher}
      ref={tableRef}
      lead={() => (
        <div className="flex gap-2">
          <DeleteDialog />
          <CreateSiteGroupDialog onSuccess={createCallback} />
        </div>
      )}
      columns={
        [
          textColumn({
            key: 'name',
            label: 'Name',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => (
              <Link
                href={`/groups/${row.original.id}/${source?.source_id}`}
                className="hover:text-primary"
              >
                {row.original.name}
              </Link>
            ),
          }),
          textColumn({
            key: 'description',
            label: 'Description',
            enableHiding: false,
            simpleSearch: true,
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
                    module="Sites"
                    level="Full"
                    onClick={() =>
                      confirmAndDelete(row.original as unknown as Tables<'site_groups'>)
                    }
                  >
                    Delete
                  </DropDownItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          }),
        ] as DataTableColumnDef<Tables<'site_groups'>>[]
      }
      filters={{
        Site: {
          name: {
            label: 'Name',
            type: 'text',
            placeholder: 'Search name',
            simpleSearch: true,
          },
          description: {
            label: 'Sescription',
            type: 'text',
            placeholder: 'Search description',
            simpleSearch: true,
          },
        },
      }}
    />
  );
}
