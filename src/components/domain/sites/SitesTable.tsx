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
import CreateSiteDialog from '@/components/domain/sites/CreateSiteDialog';
import { toast } from 'sonner';
import MoveSiteDialog from '@/components/domain/sites/MoveSiteDialog';
import { Tables } from '@/db/schema';
import DataTable, { DataTableRef } from '@/components/shared/table/DataTable';
import { DataTableColumnDef, DataTableFetcher } from '@/types/data-table';
import { column, textColumn } from '@/components/shared/table/DataTableColumn';
import Link from 'next/link';
import { useDelete } from '@/hooks/common/useDelete';
import { getRows } from '@/db/orm';

type Props = {
  parentId?: string;
};

export default function SitesTable({ parentId }: Props) {
  const tableRef = useRef<DataTableRef>(null);
  const { confirmAndDelete, DeleteDialog } = useDelete({
    table: 'sites',
    displayKey: 'name',
    getId: (item) => ({
      id: item.id,
    }),
    refetch: () => tableRef.current?.refetch(),
  });

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const sites = await getRows('sites_view', {
      filters: [parentId ? ['parent_id', 'eq', parentId] : undefined],
      pagination: {
        page: pageIndex,
        size: pageSize,
        ...props,
      },
    });

    if (!sites.ok) {
      return { rows: [], total: 0 };
    }

    return sites.data;
  };

  const createCallback = (site: Tables<'sites_view'>) => {
    tableRef.current?.refetch();
    toast.info(`Created site ${site.name}`);
  };

  const moveCallback = (site: Tables<'sites'>, parent: string) => {
    tableRef.current?.refetch();
    toast.info(`Moved site ${site.name} to ${parent}`);
  };

  return (
    <DataTable
      fetcher={fetcher}
      ref={tableRef}
      lead={(data) => (
        <div className="flex gap-2">
          <DeleteDialog />
          {parentId && (
            <MoveSiteDialog
              sites={data as unknown as Tables<'sites'>[]}
              parentId={parentId}
              onSuccess={moveCallback}
            />
          )}
          <CreateSiteDialog parentId={parentId} onSuccess={createCallback} />
        </div>
      )}
      initialSorting={[{ id: 'name', desc: false }]}
      columns={
        [
          textColumn({
            key: 'name',
            label: 'Name',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => (
              <Link href={`/sites/${row.original.slug}`} className="hover:text-primary">
                {row.original.name} {row.original.is_parent && '(Parent)'}
              </Link>
            ),
          }),
          textColumn({
            key: 'parent_name',
            label: 'Parent',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => (
              <Link href={`/sites/${row.original.parent_slug}`} className="hover:text-primary">
                {row.original.parent_name}
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
                    module="Sites"
                    level="Full"
                    onClick={() => confirmAndDelete(row.original as unknown as Tables<'sites'>)}
                  >
                    Delete
                  </DropDownItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          }),
        ] as DataTableColumnDef<Tables<'sites_view'>>[]
      }
      filters={{
        Site: {
          name: {
            label: 'Name',
            type: 'text',
            placeholder: 'Search name',
            simpleSearch: true,
          },
          parent_name: {
            label: 'Parent',
            type: 'text',
            placeholder: 'Search parent',
            simpleSearch: true,
          },
        },
      }}
    />
  );
}
