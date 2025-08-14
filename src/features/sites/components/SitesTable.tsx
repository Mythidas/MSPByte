'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useRef } from 'react';
import DropDownItem from '@/shared/components/secure/DropDownItem';
import CreateSiteDialog from '@/features/sites/components/CreateSiteDialog';
import { toast } from 'sonner';
import MoveSiteDialog from '@/features/sites/components/MoveSiteDialog';
import { Tables } from '@/types/db';
import DataTable, { DataTableRef } from '@/features/data-table/components/DataTable';
import { DataTableColumnDef, DataTableFetcher } from '@/features/data-table/types/table';
import { column, textColumn } from '@/features/data-table/components/DataTableColumn';
import Link from 'next/link';
import { useDelete } from '@/shared/hooks/useDelete';
import { getRows } from '@/db/orm';

type Props = {
  parentId?: string;
};

export default function SitesTable({ parentId }: Props) {
  const tableRef = useRef<DataTableRef>(null);
  const { confirmAndDelete, DeleteDialog } = useDelete({
    schema: 'public',
    table: 'sites',
    displayKey: 'name',
    getId: (item) => ({
      id: item.id,
    }),
    refetch: () => tableRef.current?.refetch(),
  });

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const sites = await getRows('public', 'sites_view', {
      filters: [parentId ? ['parent_id', 'eq', parentId] : undefined],
      pagination: {
        page: pageIndex,
        size: pageSize,
        ...props,
      },
    });

    if (sites.error) {
      return { rows: [], total: 0 };
    }

    return sites.data;
  };

  const createCallback = (site: Tables<'public', 'sites_view'>) => {
    tableRef.current?.refetch();
    toast.info(`Created site ${site.name}`);
  };

  const moveCallback = (site: Tables<'public', 'sites'>, parent: string) => {
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
              sites={data as unknown as Tables<'public', 'sites'>[]}
              parentId={parentId}
              onSuccess={moveCallback}
            />
          )}
          <CreateSiteDialog parentId={parentId} onSuccess={createCallback} />
        </div>
      )}
      initialPagination={{ pageSize: 1000, pageIndex: 0 }}
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
                    module="Sites.Delete"
                    onClick={() =>
                      confirmAndDelete(row.original as unknown as Tables<'public', 'sites'>)
                    }
                  >
                    Delete
                  </DropDownItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          }),
        ] as DataTableColumnDef<Tables<'public', 'sites_view'>>[]
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
