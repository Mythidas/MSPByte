'use client'

import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tables } from "@/types/database";
import { Input } from "@/components/ui/input";
import DeleteForm from "@/components/forms/DeleteForm";
import DropDownItem from "@/components/ux/DropDownItem";
import { deleteInviteAction } from "@/lib/actions/form/users";
import RouteTableRow from "@/components/ux/RouteTableRow";
import PaginatedTable from "@/components/ux/PaginatedTable";
import CreateSiteDialog from "@/components/dialogs/CreateSiteDialog";
import { toast } from "sonner";
import { deleteSite } from "@/lib/actions/server/sites";
import { useRouter } from "next/navigation";

type Props = {
  sites: Tables<'sites'>[];
  parentId?: string;
}

export default function SitesTable({ parentId, ...props }: Props) {
  const [search, setSearch] = useState("");
  const [sites, setSites] = useState(props.sites);
  const router = useRouter();

  function filterSites(site: Tables<'sites'>) {
    const lowerSearch = search.toLowerCase();
    const lowerName = site.name.toLowerCase();
    return lowerName.includes(lowerSearch);
  }

  const handleDelete = async (e: any, site: Tables<'sites'>) => {
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
  }

  const createCallback = (site: Tables<'sites'>) => {
    setSites([...sites, site].sort((a, b) => a.name.localeCompare(b.name)));
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center w-full max-w-sm space-x-2">
          <Input
            placeholder="Search sites..."
            className="h-9"
            type="search"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CreateSiteDialog parentId={parentId} onSuccess={createCallback} />
      </div>

      <Card className="py-2">
        <PaginatedTable
          data={sites.filter(filterSites)}
          head={() =>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          }
          body={(data) =>
            <>
              {data.map((site) => (
                <RouteTableRow key={site.id} route={`/sites/${site.id}`} module="sites" level="read">
                  <TableCell>{site.name}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropDownItem onClick={(e) => handleDelete(e, site)} variant="destructive" module="sites" level="full">
                          Delete
                        </DropDownItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </RouteTableRow>
              ))}
            </>
          }
        />
      </Card>
    </>
  );
}