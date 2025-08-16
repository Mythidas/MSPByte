import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRows } from '@/db/orm';
import { MicrosoftPolicyMetadata } from '@/integrations/microsoft/types';
import Display from '@/shared/components/Display';
import { useAsync } from '@/shared/hooks/useAsync';
import { Info, Users, CircleCheck, CircleX } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  siteId: string;
  sourceId: string;
  metadata: MicrosoftPolicyMetadata;
};

export default function MicrosoftPolicyAssignmentsPopover({ siteId, sourceId, metadata }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { users, applications: apps } = metadata.conditions;
  const { data, refetch } = useAsync({
    initial: false,
    fetcher: async () => {
      const identities = await getRows('source', 'identities', {
        filters: [['site_id', 'eq', siteId]],
      });
      const roles = await getRows('source', 'roles', {
        filters: [['source_id', 'eq', sourceId]],
        ors: [
          [
            ['site_id', 'eq', siteId],
            ['site_id', 'is', null],
          ],
        ],
      });
      const groups = await getRows('source', 'groups', {
        filters: [
          ['source_id', 'eq', sourceId],
          ['site_id', 'eq', siteId],
        ],
      });

      if (identities.data) {
        if (users?.includeUsers) {
          users.includeUsers = users.includeUsers.map((userId) => {
            const identity = identities.data.rows.find((id) => id.external_id === userId);
            return identity?.email || userId;
          });
        }

        if (users?.excludeUsers) {
          users.excludeUsers = users.excludeUsers.map((userId) => {
            const identity = identities.data.rows.find((id) => id.external_id === userId);
            return identity?.email || userId;
          });
        }
      }

      if (roles.data) {
        if (users?.includeRoles) {
          users.includeRoles = users.includeRoles.map((roleId) => {
            const role = roles.data.rows.find((role) => role.external_id === roleId);
            return role?.name || roleId;
          });
        }

        if (users?.excludeRoles) {
          users.excludeRoles = users.excludeRoles.map((roleId) => {
            const role = roles.data.rows.find((role) => role.external_id === roleId);
            return role?.name || roleId;
          });
        }
      }

      if (groups.data) {
        if (users?.includeGroups) {
          users.includeGroups = users.includeGroups.map((groupId) => {
            const group = groups.data.rows.find((group) => group.external_id === groupId);
            return group?.name || groupId;
          });
        }

        if (users?.excludeGroups) {
          users.excludeGroups = users.excludeGroups.map((groupId) => {
            const group = groups.data.rows.find((group) => group.external_id === groupId);
            return group?.name || groupId;
          });
        }
      }

      return true;
    },
    immediate: false,
    deps: [],
  });

  useEffect(() => {
    if (isOpen && !data) {
      refetch();
    }
  });

  if (!users && !apps) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors">
          <Info className="h-4 w-4" />
          <span className="text-sm underline">View Details</span>
        </button>
      </DialogTrigger>
      <DialogContent className="!max-w-[50vw] w-full h-[50vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assignment Details
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of users, groups, roles, and applications affected by this policy
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
          </TabsList>
          {users && (
            <>
              <TabsContent value="users">
                <div className="grid grid-cols-2 divide-x h-full">
                  {/* Users */}
                  <div className="flex flex-col gap-2 h-full pr-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <CircleCheck className="text-green-500 h-3 w-3" />
                      Included ({users.includeUsers.length})
                    </Label>
                    {users.includeUsers?.includes('All') ? (
                      <div className="text-sm text-muted-foreground italic">All users</div>
                    ) : users.includeUsers?.length > 0 && !users.includeUsers.includes('All') ? (
                      <ScrollArea className="max-h-96">
                        <div className="grid gap-2">
                          {users.includeUsers.map((userId: string, index: number) => (
                            <Display key={index}>{userId}</Display>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        Users not evaluated
                      </div>
                    )}
                  </div>
                  {/* Roles */}
                  <div className="flex flex-col gap-2 h-full pl-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <CircleX className="text-red-500 h-3 w-3" />
                      Excluded ({users.excludeUsers.length})
                    </Label>
                    {users.excludeUsers?.length > 0 ? (
                      <ScrollArea className="max-h-96">
                        <div className="grid gap-2">
                          {users.excludeUsers.map((userId: string, index: number) => (
                            <Display key={index}>{userId}</Display>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        Users not evaluated
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="roles">
                <div className="grid grid-cols-2 divide-x h-full">
                  {/* Users */}
                  <div className="flex flex-col gap-2 h-full pr-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <CircleCheck className="text-green-500 h-3 w-3" />
                      Included ({users.includeRoles.length})
                    </Label>
                    {users.includeRoles?.length > 0 ? (
                      <ScrollArea className="max-h-96">
                        <div className="grid gap-2">
                          {users.includeRoles.map((userId: string, index: number) => (
                            <Display key={index}>{userId}</Display>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        Roles not evaluated
                      </div>
                    )}
                  </div>
                  {/* Roles */}
                  <div className="flex flex-col gap-2 h-full pl-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <CircleX className="text-red-500 h-3 w-3" />
                      Excluded ({users.excludeRoles.length})
                    </Label>
                    {users.excludeRoles?.length > 0 ? (
                      <ScrollArea className="max-h-96">
                        <div className="grid gap-2">
                          {users.excludeRoles.map((userId: string, index: number) => (
                            <Display key={index}>{userId}</Display>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        Roles not evaluated
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="groups">
                <div className="grid grid-cols-2 divide-x h-full">
                  {/* Users */}
                  <div className="flex flex-col gap-2 h-full pr-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <CircleCheck className="text-green-500 h-3 w-3" />
                      Included ({users.includeGroups.length})
                    </Label>
                    {users.includeGroups?.length > 0 ? (
                      <ScrollArea className="max-h-96">
                        <div className="grid gap-2">
                          {users.includeGroups.map((userId: string, index: number) => (
                            <Display key={index}>{userId}</Display>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        Groups not evaluated
                      </div>
                    )}
                  </div>
                  {/* Roles */}
                  <div className="flex flex-col gap-2 h-full pl-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <CircleX className="text-red-500 h-3 w-3" />
                      Excluded ({users.excludeGroups.length})
                    </Label>
                    {users.excludeGroups?.length > 0 ? (
                      <ScrollArea className="max-h-96">
                        <div className="grid gap-2">
                          {users.excludeGroups.map((userId: string, index: number) => (
                            <Display key={index}>{userId}</Display>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        Groups not evaluated
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </>
          )}
          {apps && (
            <>
              <TabsContent value="apps">
                <div className="grid grid-cols-2 divide-x h-full">
                  {/* Users */}
                  <div className="space-y-2 pr-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <CircleCheck className="text-green-500 h-3 w-3" />
                      Included
                    </Label>
                    <ScrollArea className="max-h-96">
                      {apps.includeApplications?.length > 0 ? (
                        <div className="grid gap-2">
                          {apps.includeApplications.map((appId: string, index: number) => {
                            const knownApps: Record<string, string> = {
                              '797f4846-ba00-4fd7-ba43-dac1f8f63013': 'Microsoft Azure Management',
                              '00000003-0000-0000-c000-000000000000': 'Microsoft Graph',
                              '00000002-0000-0000-c000-000000000000': 'Office 365 Exchange Online',
                              '00000003-0000-0ff1-ce00-000000000000':
                                'Office 365 SharePoint Online',
                              '89bee1f7-5e6e-4d8a-9f3d-ecd601259da7':
                                'Office 365 Advanced Threat Protection',
                            };
                            const appName = knownApps[appId];
                            if (appId === 'All') {
                              return (
                                <Display key={index}>
                                  <div className="text-sm font-medium">All Applications</div>
                                </Display>
                              );
                            }

                            return <Display key={index}>{appName || appId}</Display>;
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic">
                          No included applications
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                  <div className="space-y-2 pl-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <CircleX className="text-red-500 h-3 w-3" />
                      Excluded Applications
                    </Label>
                    <ScrollArea className="max-h-96">
                      {apps.excludeApplications?.length > 0 ? (
                        <div className="grid gap-2">
                          {apps.excludeApplications.map((appId: string, index: number) => (
                            <div key={index} className="p-3 bg-red-50 rounded border">
                              <div className="text-sm font-medium">Unknown Application</div>
                              <div className="text-xs font-mono text-muted-foreground mt-1">
                                {appId}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic">
                          No excluded applications
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
