'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import DropDownItem from '@/components/common/DropDownItem';
import CreateSiteDialog from '@/components/domains/sites/CreateSiteDialog';
import { toast } from 'sonner';
import MoveSiteDialog from '@/components/domains/sites/MoveSiteDialog';
import { Tables } from '@/db/schema';
import { deleteSite, getSites, getUpperSites } from '@/services/sites';
import DataTable from '@/components/common/table/DataTable';
import { DataTableColumnDef } from '@/types/data-table';
import { column, textColumn } from '@/components/common/table/DataTableColumn';
import Link from 'next/link';

type Props = {
  parentId?: string;
};

export default function SitesTable({ parentId }: Props) {
  const [sites, setSites] = useState<Tables<'sites'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        if (parentId) {
          const sites = await getSites(parentId);
          if (!sites.ok) {
            throw new Error();
          }

          setSites(sites.data);
        } else {
          const sites = await getUpperSites();
          if (!sites.ok) {
            throw new Error();
          }

          setSites(sites.data);
        }
      } catch {
        toast.error('Failed to load sites. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [parentId]);

  const handleDelete = async (e: React.MouseEvent<HTMLDivElement>, site: Tables<'sites'>) => {
    e.stopPropagation();

    try {
      const result = await deleteSite(site.id);

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      setSites([...sites.filter((s) => s.id !== site.id)]);
      toast.info(`Deleted site ${site.name}`);
    } catch (err) {
      toast.error(`Failed to delete site: ${err}`);
    }
  };

  const createCallback = (site: Tables<'sites'>) => {
    setSites([...sites, site].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const moveCallback = (site: Tables<'sites'>, parent: string) => {
    setSites([...sites.filter((s) => s.id !== site.id)]);
    toast.info(`Moved site ${site.name} to ${parent}`);
  };

  return (
    <DataTable
      data={sites}
      isLoading={isLoading}
      action={
        <div className="flex gap-2">
          {parentId && (
            <MoveSiteDialog sites={sites} parentId={parentId} onSuccess={moveCallback} />
          )}
          <CreateSiteDialog parentId={parentId} onSuccess={createCallback} />
        </div>
      }
      columns={
        [
          textColumn({
            key: 'name',
            label: 'Name',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => (
              <Link href={`/sites/${row.original.id}`} className="hover:text-primary">
                {row.original.name}
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
                    onClick={(e) => handleDelete(e, row.original)}
                    variant="destructive"
                    module="Sites"
                    level="Full"
                  >
                    Delete
                  </DropDownItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          }),
        ] as DataTableColumnDef<Tables<'sites'>>[]
      }
    />
  );
}
