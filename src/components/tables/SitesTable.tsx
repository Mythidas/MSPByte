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
import RouteButton from "@/components/ux/RouteButton";

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
        <RouteButton route={`/clients/${client.id}/create-site`} module="clients" level="edit">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Site
        </RouteButton>
      </div>

      <Card className="py-2">
        <Table>
          <TableCaption>Total Sites: {sites.length}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.filter(filterSites).map((site) => (
              <TableRow key={site.id}>
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
                        <DropDownItem type="submit" route={`/clients/site/${site.id}`} module="clients" level="read">
                          View
                        </DropDownItem>
                        <DropDownItem form={site.id} type="submit" variant="destructive" module="clients" level="full">
                          Delete
                        </DropDownItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DeleteForm>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}