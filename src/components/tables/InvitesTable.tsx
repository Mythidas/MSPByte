'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tables } from "@/types/database";
import { Input } from "@/components/ui/input";
import DeleteForm from "@/components/forms/DeleteForm";
import DropDownItem from "@/components/ux/DropDownItem";
import { deleteInviteAction } from "@/lib/actions/users";
import { getInvites } from "@/lib/functions/users";
import { getRoles } from "@/lib/functions/roles";
import SkeletonTable from "@/components/ux/SkeletonTable";

export default function InvitesTable() {
  const [invites, setInvites] = useState<Tables<'invites'>[]>([]);
  const [roles, setRoles] = useState<Tables<'roles'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const invites = await getInvites();
      const roles = await getRoles();

      setInvites(invites);
      setRoles(roles);
      setIsLoading(false);
    }

    loadData();
  }, []);

  function filterInvites(invite: Tables<'invites'>) {
    const lowerSearch = search.toLowerCase();
    const lowerName = invite.name.toLowerCase();
    const lowerEmail = invite.email.toLowerCase();
    const lowerRole = roles.find((e) => e.id === invite.role_id)?.name.toLowerCase();
    return lowerEmail.includes(lowerSearch) || lowerName.includes(lowerSearch) || lowerRole?.includes(lowerSearch);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center w-full max-w-sm space-x-2">
          <Input
            placeholder="Search invites..."
            className="h-9"
            type="search"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <Card className="py-2">
        {isLoading ? <SkeletonTable /> :
          <Table>
            <TableCaption>Total Invites: {invites.length}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.filter(filterInvites).map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {invite.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">
                        {`${invite.name}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{invite.email}</TableCell>
                  <TableCell>
                    {roles.find((role) => role.id === invite.role_id)?.name}
                  </TableCell>
                  <TableCell>
                    {new Date(invite.created_at || "").toDateString() || ""}
                  </TableCell>
                  <TableCell>
                    <DeleteForm id={invite.id} action={deleteInviteAction}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropDownItem form={invite.id} type="submit" variant="destructive" module="users" level="full">
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
        }
      </Card>
    </>
  );
}