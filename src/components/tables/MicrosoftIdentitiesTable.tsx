'use client'

import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tables } from "@/types/database";
import { Input } from "@/components/ui/input";
import PaginatedTable from "@/components/ux/PaginatedTable";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type Props = {
  identities: Tables<'source_identities'>[];
  licenses: Tables<'source_identity_licenses'>[];
  defaultSearch?: string;
}

export default function MicrosoftIdentitiesTable({ identities, licenses, defaultSearch }: Props) {
  const [search, setSearch] = useState(defaultSearch || "");

  function filterIdentities(identity: Tables<'source_identities'>) {
    const lowerSearch = search.toLowerCase();
    const lowerName = identity.display_name.toLowerCase();
    const lowerEmail = identity.email.toLowerCase();
    return lowerName.includes(lowerSearch) || lowerEmail.includes(lowerEmail);
  }

  function filterLicenses(id: string, license: Tables<'source_identity_licenses'>) {
    return license.identity_id === id;
  }

  const getEnforcement = (str: string) => {
    switch (str) {
      case 'security_defaults':
        return 'Security Defaults';
      case 'conditional_access':
        return 'Conditional Access';
    }
  }

  return (
    <div className="flex flex-col size-full gap-4">
      <div className="flex items-center w-full max-w-sm space-x-2">
        <Input
          placeholder="Search identities..."
          className="h-9"
          type="search"
          defaultValue={defaultSearch}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="py-2">
        <PaginatedTable
          data={identities.filter(filterIdentities)}
          head={() =>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>MFA Enforced</TableHead>
              <TableHead>Enforcement</TableHead>
              <TableHead>Methods</TableHead>
              <TableHead>Licenses</TableHead>
              <TableHead>Last Activity</TableHead>
            </TableRow>
          }
          body={(data) =>
            <>
              {data.map((identity) =>
                <TableRow key={identity.id}>
                  <TableCell>{identity.display_name}</TableCell>
                  <TableCell>{identity.email}</TableCell>
                  <TableCell>{identity.mfa_enforced ? 'True' : 'False'}</TableCell>
                  <TableCell>{getEnforcement(identity.enforcement_type)}</TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost">
                          {(identity.mfa_methods as any).length}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="grid gap-2">
                        <div className="grid grid-cols-3">
                          <div>Type</div>
                          <div className="col-span-2">Device</div>
                        </div>
                        {(identity.mfa_methods as any).map((method: any) => {
                          return (
                            <div key={method.id} className="grid grid-cols-3">
                              <div>{method.type}</div>
                              <div className="col-span-2">{method.displayName}</div>
                            </div>
                          )
                        })}
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost">
                          {licenses.filter((lic) => filterLicenses(identity.id, lic)).length}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="grid gap-2">
                        <div className="grid grid-cols-3">
                          <div>License</div>
                          <div className="col-span-2">Services</div>
                        </div>
                        {licenses.filter((lic) => filterLicenses(identity.id, lic)).map((license) => {
                          return (
                            <div key={license.id} className="">
                              <div>{license.sku}</div>
                              <div>{license.enabled_services}</div>
                            </div>
                          )
                        })}
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>{new Date(identity.last_activity || "").toLocaleString()}</TableCell>
                </TableRow>
              )}
            </>
          }
        />
      </Card>
    </div>
  );
}