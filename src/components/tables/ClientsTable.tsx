'use client'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import CreateClientDialog from "@/components/dialogs/CreateClientDialog";
import RouteTableRow from "@/components/ux/RouteTableRow";

type Props = {
  clients: Tables<'clients'>[];
}

export default function ClientsTable({ clients }: Props) {
  const [search, setSearch] = useState("");

  function filterClients(client: Tables<'clients'>) {
    const lowerSearch = search.toLowerCase();
    const lowerName = client.name.toLowerCase();
    return lowerName.includes(lowerSearch);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center w-full max-w-sm space-x-2">
          <Input
            placeholder="Search clients..."
            className="h-9"
            type="search"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CreateClientDialog />
      </div>

      <Card className="py-2">
        <Table>
          <TableCaption>Total Clients: {clients.length}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.filter(filterClients).map((client) => (
              <RouteTableRow key={client.id} route={`/clients/${client.id}`} module="clients" level="read">
                <TableCell>{client.name}</TableCell>
                <TableCell>
                  <DeleteForm id={client.id} action={deleteInviteAction}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropDownItem form={client.id} type="submit" variant="destructive" module="clients" level="full">
                          Delete
                        </DropDownItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DeleteForm>
                </TableCell>
              </RouteTableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}