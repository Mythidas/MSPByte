'use client'

import { useState } from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/types/database";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import DropDownItem from "@/components/ux/DropDownItem";
import { MoreHorizontal } from "lucide-react";
import { syncIntegration } from "@/lib/actions/server/sources";

type Props = {
  sources: Tables<'sources'>[];
  integrations: Tables<'source_integrations'>[];
}

export default function IntegrationsTable({ sources, integrations }: Props) {
  const [search, setSearch] = useState("");

  function filterSources(source: Tables<'sources'>) {
    const lowerSearch = search.toLowerCase();
    const lowerName = source.name.toLowerCase();
    const lowerDesc = source.description.toLowerCase();
    const lowerCat = source.category?.toLowerCase();
    return lowerName.includes(lowerSearch) || lowerDesc.includes(lowerSearch) || lowerCat?.includes(lowerSearch);
  }

  function isIntegrated(source: Tables<'sources'>) {
    return !!integrations.find((i) => i.source_id === source.id);
  }

  function lastSync(source: Tables<'sources'>) {
    const integration = integrations.find((i) => i.source_id === source.id);
    const date = integration?.last_sync_at ? new Date(integration.last_sync_at).toDateString() : "Never";
    return `Last Sync: ${date}`;
  }

  async function syncNow(source: Tables<'sources'>) {
    const integration = integrations.find((i) => i.source_id === source.id);
    if (!integration) return;

    syncIntegration(integration);
    alert('Started integration sync');
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center w-full max-w-sm space-x-2">
          <Input
            placeholder="Search sources..."
            className="h-9"
            type="search"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-3">
        {sources.filter(filterSources).map((source) => {
          return (
            <Card key={source.id}>
              <CardHeader>
                <CardTitle>
                  <div className="flex w-full gap-2 items-center">
                    <Image src={source.icon_url || ""} alt="Sophos Icon" width={32} height={32} />
                    {source.name}
                  </div>
                </CardTitle>
                <CardDescription>
                  {source.description}
                </CardDescription>
                <CardAction>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropDownItem route={`/integrations/source/${source.slug}`} module="integrations" level="read">
                        Edit
                      </DropDownItem>
                      <DropDownItem onClick={() => syncNow(source)} module="integrations" level="edit">
                        Sync
                      </DropDownItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="flex w-full justify-between">
                  {isIntegrated(source) ?
                    <Badge className="text-sm">Active</Badge>
                    : <Badge className="text-sm" variant="destructive">Inactive</Badge>}
                  {isIntegrated(source) && <span>{lastSync(source)}</span>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  );
}