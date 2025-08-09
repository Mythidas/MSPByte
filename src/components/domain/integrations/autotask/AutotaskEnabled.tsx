'use client';

import AutoTaskSiteMappingDialog from '@/components/domain/integrations/autotask/AutoTaskSiteMappingDialog';
import Display from '@/components/shared/Display';
import { LazyTabContent } from '@/components/shared/LazyTabsContent';
import Loader from '@/components/shared/Loader';
import SearchBar from '@/components/shared/SearchBar';
import SearchBox from '@/components/shared/SearchBox';
import RouteTabsTrigger from '@/components/shared/secure/RouteTabsTrigger';
import { SubmitButton } from '@/components/shared/secure/SubmitButton';
import DataTable from '@/components/shared/table/DataTable';
import { column, textColumn } from '@/components/shared/table/DataTableColumn';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList } from '@/components/ui/tabs';
import { deleteRows, getRows, insertRows, updateRows } from '@/db/orm';
import { Tables, TablesInsert, TablesUpdate } from '@/types/db';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { resolveSearch } from '@/lib/helpers/search';
import { normalizeText } from '@/lib/utils';
import { APIResponse } from '@/types';
import { DataTableColumnDef } from '@/types/data-table';
import { Building, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  source: Tables<'public', 'sources'>;
  integration: Tables<'public', 'integrations'>;
};

export default function AutotaskEnabled({ source }: Props) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <RouteTabsTrigger value="overview">Overview</RouteTabsTrigger>
        <RouteTabsTrigger value="mappings">Site Mappings</RouteTabsTrigger>
      </TabsList>
      <LazyTabContent value="overview" isDefault>
        <div className="grid grid-cols-3 gap-2">
          <AutoTaskSitesCard sourceId={source.id} />
          <AutoTaskActionsCard sourceId={source.id} />
        </div>
      </LazyTabContent>
      <LazyTabContent value="mappings">
        <AutoTaskSiteMappingsTab sourceId={source.id} />
      </LazyTabContent>
    </Tabs>
  );
}

type SourceSite = Tables<'source', 'sites_view'>;
type InternalSite = Tables<'public', 'sites'>;

export function AutoTaskSiteMappingsTab({ sourceId }: { sourceId: string }) {
  const [autoTaskSites, setAutoTaskSites] = useState<SourceSite[]>([]);
  const [internalSites, setInternalSites] = useState<InternalSite[]>([]);
  const [changedMappings, setChangedMappings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const autoMatchSites = useCallback(() => {
    const internalMap = new Map(internalSites.map((site) => [normalizeText(site.name), site]));

    autoTaskSites.forEach((site) => {
      if (site.site_id) return site; // already mapped

      const match = internalMap.get(normalizeText(site.name!));
      if (match) {
        setChangedMappings((prev) => ({ ...prev, [site.id!]: match.id }));
        return { ...site, site_id: match.id };
      }

      return site;
    });
  }, [autoTaskSites, internalSites]);

  const { content } = useLazyLoad({
    fetcher: async () => {
      const autoTask = await getRows('source', 'sites_view', {
        filters: [['source_id', 'eq', sourceId]],
        sorting: [['name', 'asc']],
      });

      const sites = await getRows('public', 'sites', {
        sorting: [['name', 'asc']],
      });

      if (autoTask.ok && sites.ok) {
        setAutoTaskSites(autoTask.data.rows);
        setInternalSites(sites.data.rows);

        return { autoTaskSites: autoTask.data.rows, internalSites: sites.data.rows };
      }
    },
    render: (data) => {
      if (!data) return <strong>Failed to fetch sites. Please refresh.</strong>;

      const options = internalSites.map((s) => ({
        label: s.name,
        value: s.id,
      }));

      const handleSiteSelect = (autoTaskSiteId: string, internalSiteId: string) => {
        if (isSaving) return;

        setChangedMappings((prev) => ({
          ...prev,
          [autoTaskSiteId]: internalSiteId,
        }));
      };

      const handleSave = async () => {
        setIsSaving(true);

        try {
          const toInsert: TablesInsert<'source', 'tenants'>[] = [];
          const toUpdate: TablesUpdate<'source', 'tenants'>[] = [];
          const toDelete: string[] = [];

          for (const [autoTaskSiteId, internalSiteId] of Object.entries(changedMappings)) {
            const autoTaskSite = autoTaskSites.find((site) => site.id === autoTaskSiteId);
            if (!autoTaskSite) continue;

            const currentSiteId = autoTaskSite.site_id;

            if (!internalSiteId || internalSiteId === '') {
              if (currentSiteId) {
                toDelete.push(autoTaskSiteId);
              }
              continue;
            }

            if (!currentSiteId) {
              toInsert.push({
                tenant_id: autoTaskSite.tenant_id!,
                source_id: autoTaskSite.source_id!,
                site_id: internalSiteId,
                external_id: autoTaskSite.external_id!,
                external_name: autoTaskSite.name!,
                metadata: autoTaskSite,
              });
              continue;
            }

            if (currentSiteId !== internalSiteId) {
              toUpdate.push({
                id: autoTaskSite.source_tenant_id!, // must exist for update
                site_id: internalSiteId,
              });
            }
          }

          const [insertResult, updateResult, deleteResult] = await Promise.all([
            toInsert.length > 0
              ? insertRows('source', 'tenants', { rows: toInsert })
              : Promise.resolve({ ok: true, data: [] } as APIResponse<[]>),
            toUpdate.length > 0
              ? updateRows('source', 'tenants', {
                  rows: toUpdate.map((to) => {
                    const key = to.id;
                    return ['id', [key!, to]];
                  }),
                })
              : Promise.resolve({ ok: true, data: [] } as APIResponse<[]>),
            toDelete.length > 0
              ? deleteRows('source', 'tenants', {
                  filters: [['id', 'in', toDelete]],
                })
              : Promise.resolve({ ok: true, data: null } as APIResponse<null>),
          ]);

          if (!insertResult.ok) throw new Error(`Insert failed: ${insertResult.error.message}`);
          if (!updateResult.ok) throw new Error(`Update failed: ${updateResult.error.message}`);
          if (!deleteResult.ok) throw new Error(`Delete failed: ${deleteResult.error.message}`);

          toast.success('Mappings saved successfully.');
          setChangedMappings({});
        } catch (error: any) {
          toast.error(error?.message || 'Failed to save mappings.');
        } finally {
          setIsSaving(false);
        }
      };

      const changeMappingsLength = Object.entries(changedMappings).length;

      return (
        <DataTable
          initialPagination={{ pageIndex: 0, pageSize: 1000 }}
          data={autoTaskSites}
          lead={() => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={autoMatchSites}>
                Auto Match Sites
              </Button>
              <SubmitButton
                disabled={changeMappingsLength === 0}
                pending={isSaving}
                onClick={handleSave}
              >
                Save Changes ({changeMappingsLength})
              </SubmitButton>
            </div>
          )}
          columns={
            [
              textColumn({
                key: 'name',
                label: 'AutoTask Site',
                simpleSearch: true,
                enableHiding: false,
              }),
              column({
                key: 'internal',
                label: 'Internal Site',
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }) => {
                  const selectedId = changedMappings[row.original.id!] ?? row.original.site_id;
                  return (
                    <SearchBox
                      options={options}
                      defaultValue={selectedId || ''}
                      onSelect={(val) => handleSiteSelect(row.original.id!, val)}
                    />
                  );
                },
              }),
            ] as DataTableColumnDef<SourceSite>[]
          }
        />
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
}

function AutoTaskActionsCard({ sourceId }: { sourceId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span>Actions</span>
          </div>
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <AutoTaskSiteMappingDialog sourceId={sourceId} />
        </div>
      </CardContent>
    </Card>
  );
}

function AutoTaskSitesCard({ sourceId }: { sourceId: string }) {
  const [search, setSearch] = useState('');

  const { content } = useLazyLoad({
    fetcher: async () => {
      const sites = await getRows('source', 'sites_view', {
        filters: [['source_id', 'eq', sourceId]],
        sorting: [['name', 'asc']],
      });

      if (sites.ok) {
        return sites.data.rows;
      }
    },
    render: (data) => {
      if (!data) return null;

      const mappedSites = data.filter((site) => !!site.source_tenant_id);
      const missingSites = data.filter((site) => !site.source_tenant_id);

      return (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Sites
              </div>
            </CardTitle>
            <CardAction>{data.length}</CardAction>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Display onClick={() => {}}>
                  <div className="flex w-full justify-between">
                    <span>Mapped Sites</span>
                    <span>{mappedSites.length}</span>
                  </div>
                </Display>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mapped Sites</DialogTitle>
                  <DialogDescription>AutoTask sites mapped to internal sites</DialogDescription>
                </DialogHeader>

                <SearchBar placeholder="Search sites..." onSearch={setSearch} delay={0} />
                <ScrollArea className="max-h-96">
                  <div className="grid gap-2">
                    {mappedSites
                      .filter((site) => resolveSearch(search, [site.name!]))
                      .map((site) => {
                        return <Display key={site.id}>{site.name}</Display>;
                      })}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Display onClick={() => {}}>
                  <div className="flex w-full justify-between">
                    <span>Missing Sites</span>
                    <span>{missingSites.length}</span>
                  </div>
                </Display>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Missing Sites</DialogTitle>
                  <DialogDescription>AutoTask sites not mapped to internal sites</DialogDescription>
                </DialogHeader>

                <SearchBar placeholder="Search sites..." onSearch={setSearch} delay={0} />
                <ScrollArea className="max-h-96">
                  <div className="grid gap-2">
                    {missingSites
                      .filter((site) => resolveSearch(search, [site.name!]))
                      .map((site) => {
                        return <Display key={site.id}>{site.name}</Display>;
                      })}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
}
