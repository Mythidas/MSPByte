'use client'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tables } from "@/types/database";
import { Input } from "@/components/ui/input";
import DeleteForm from "@/components/forms/DeleteForm";
import DropDownItem from "@/components/ux/DropDownItem";
import { deleteInviteAction } from "@/lib/actions/users";
import CreateSiteDialog from "@/components/dialogs/CreateSiteDialog";
import RouteTableRow from "@/components/ux/RouteTableRow";
import PaginatedTable from "@/components/ux/PaginatedTable";

type Props = {
  client: Tables<'clients'>;
  sites: Tables<'sites'>[];
}

export default function SitesTable({ client, sites }: Props) {
  const [search, setSearch] = useState("");

  function filterSites(site: Tables<'sites'>) {
    const lowerSearch = search.toLowerCase();
    const lowerName = site.name.toLowerCase();
    return lowerName.includes(lowerSearch);
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
        <CreateSiteDialog client={client} />
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
          body={(rows) =>
            rows.map((site) =>
              <RouteTableRow key={site.id} route={`/clients/site/${site.id}`} module="clients" level="read">
                <TableCell>{site.name}</TableCell>
                <TableCell>
                  <DeleteForm id={site.id} action={deleteInviteAction}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropDownItem form={site.id} type="submit" variant="destructive" module="clients" level="full">
                          Delete
                        </DropDownItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DeleteForm>
                </TableCell>
              </RouteTableRow>
            )
          }
        />
      </Card>
    </>
  );
}