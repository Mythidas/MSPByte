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
import { useUser } from "@/lib/providers/UserContext";
import { Input } from "@/components/ui/input";
import RouteButton from "@/components/ux/RouteButton";
import DeleteForm from "@/components/forms/DeleteForm";
import DropDownItem from "@/components/ux/DropDownItem";
import { deleteUserAction } from "@/lib/actions/form/users";

type Props = {
  users: Tables<'users'>[];
  roles: Tables<'roles'>[];
}

export default function RolesTable({ users, roles }: Props) {
  const [search, setSearch] = useState("");
  const context = useUser();

  function filterRoles(role: Tables<'roles'>) {
    const lowerSearch = search.toLowerCase();
    const lowerName = role.name.toLowerCase();
    const lowerEmail = role.description.toLowerCase();
    return lowerEmail.includes(lowerSearch) || lowerName.includes(lowerSearch);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center w-full max-w-sm space-x-2">
          <Input
            placeholder="Search roles..."
            className="h-9"
            type="search"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <RouteButton route="/roles/create" module="roles" level="edit">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Role
        </RouteButton>
      </div>
      <Card className="py-2">
        <Table>
          <TableCaption>Total Roles: {roles.length}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.filter(filterRoles).map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  {role.name}
                </TableCell>
                <TableCell>
                  {users.filter((u) => u.role_id === role.id).length}
                </TableCell>
                <TableCell>
                  {role.description}
                </TableCell>
                <TableCell>
                  {role.tenant_id ? "Custom" : "System-Defined"}
                </TableCell>
                <TableCell>
                  <DeleteForm id={role.id} action={deleteUserAction}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropDownItem route={`/roles/${role.id}`} module="roles" level="edit" disabled={!role.tenant_id}>
                          Edit
                        </DropDownItem>
                        <DropDownItem form={role.id} type="submit" variant="destructive" module="roles" level="full" disabled={role.id === context?.id || !role.tenant_id}>
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