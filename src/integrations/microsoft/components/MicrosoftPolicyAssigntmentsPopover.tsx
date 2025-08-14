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
import { Separator } from '@/components/ui/separator';
import { getRows } from '@/db/orm';
import { MicrosoftPolicyMetadata } from '@/integrations/microsoft/types';
import { useAsync } from '@/shared/hooks/useAsync';
import { Info, Users, CircleCheck, CircleX, Globe } from 'lucide-react';

type Props = {
  siteId: string;
  metadata: MicrosoftPolicyMetadata;
};

export default function MicrosoftPolicyAssignmentsPopover({ siteId, metadata }: Props) {
  const { users, applications: apps } = metadata.conditions;
  const {
    data: { identities },
  } = useAsync({
    initial: { identities: [] },
    fetcher: async () => {
      const identities = await getRows('source', 'identities', {
        filters: [['site_id', 'eq', siteId]],
      });
      if (!identities.error) return { identities: identities.data.rows };

      return { identities: [] };
    },
    deps: [],
  });

  if (!users && !apps) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors">
          <Info className="h-4 w-4" />
          <span className="text-sm underline">View Details</span>
        </button>
      </DialogTrigger>
      <DialogContent className="!max-w-[90vw] w-fit overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assignment Details
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of users, groups, roles, and applications affected by this policy
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Users Section */}
          {users && (
            <div className="space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users & Identity
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Included Users */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <CircleCheck className="text-green-500 h-3 w-3" />
                    Included
                  </Label>
                  <div className="space-y-2 pl-4">
                    {users.includeUsers?.includes('All') && (
                      <div className="p-2 rounded border-l-2 border-green-200">
                        <div className="text-sm font-medium">All Users</div>
                        <div className="text-xs text-muted-foreground">
                          Every user in the directory
                        </div>
                      </div>
                    )}

                    {users.includeUsers?.length && !users.includeUsers.includes('All') && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Specific Users ({users.includeUsers.length})
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {users.includeUsers.map((userId: string, index: number) => (
                            <div key={index} className="p-2 rounded text-xs font-mono">
                              {identities.find((id) => id.external_id === userId)?.email || userId}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {users.includeGroups?.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Groups ({users.includeGroups.length})
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {users.includeGroups.map((groupId: string, index: number) => (
                            <div key={index} className="p-2  rounded text-xs font-mono">
                              {groupId}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {users.includeRoles?.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Directory Roles ({users.includeRoles.length})
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {users.includeRoles.map((roleId: string, index: number) => (
                            <div key={index} className="p-2  rounded text-xs font-mono">
                              {roleId}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!users.includeUsers?.length &&
                      !users.includeGroups?.length &&
                      !users.includeRoles?.length && (
                        <div className="text-sm text-muted-foreground italic">
                          No specific inclusions
                        </div>
                      )}
                  </div>
                </div>

                {/* Excluded Users */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <CircleX className="text-red-500 h-3 w-3" />
                    Excluded
                  </Label>
                  <div className="space-y-2 pl-4">
                    {users.excludeUsers?.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Specific Users ({users.excludeUsers.length})
                        </div>
                        <ScrollArea className="max-h-32 overflow-y-auto">
                          {users.excludeUsers.map((userId: string, index: number) => (
                            <div key={index} className="p-1 rounded text-xs font-mono">
                              {identities.find((id) => id.external_id === userId)?.email || userId}
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}

                    {users.excludeGroups?.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Groups ({users.excludeGroups.length})
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {users.excludeGroups.map((groupId: string, index: number) => (
                            <div key={index} className="p-2  rounded text-xs font-mono">
                              {groupId}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {users.excludeRoles?.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Directory Roles ({users.excludeRoles.length})
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {users.excludeRoles.map((roleId: string, index: number) => (
                            <div key={index} className="p-2 rounded text-xs font-mono">
                              {roleId}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!users.excludeUsers?.length &&
                      !users.excludeGroups?.length &&
                      !users.excludeRoles?.length && (
                        <div className="text-sm text-muted-foreground italic">No exclusions</div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applications Section */}
          {apps && (
            <div className="space-y-4">
              <Separator />
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Cloud Applications
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Included Apps */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <CircleCheck className="text-green-500 h-3 w-3" />
                    Included Applications
                  </Label>
                  <div className="space-y-2 pl-4">
                    {apps.includeApplications?.length > 0 ? (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {apps.includeApplications.map((appId: string, index: number) => {
                          const knownApps: Record<string, string> = {
                            '797f4846-ba00-4fd7-ba43-dac1f8f63013': 'Microsoft Azure Management',
                            '00000003-0000-0000-c000-000000000000': 'Microsoft Graph',
                            '00000002-0000-0000-c000-000000000000': 'Office 365 Exchange Online',
                            '00000003-0000-0ff1-ce00-000000000000': 'Office 365 SharePoint Online',
                            '89bee1f7-5e6e-4d8a-9f3d-ecd601259da7':
                              'Office 365 Advanced Threat Protection',
                          };
                          const appName = knownApps[appId];

                          return (
                            <div key={index} className="p-3 rounded border">
                              <div className="text-sm font-medium">
                                {appName || appId === 'All'
                                  ? 'All Applications'
                                  : 'Unknown Application'}
                              </div>
                              <div className="text-xs font-mono text-muted-foreground mt-1">
                                {appId}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        No included applications
                      </div>
                    )}
                  </div>
                </div>

                {/* Excluded Apps */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <CircleX className="text-red-500 h-3 w-3" />
                    Excluded Applications
                  </Label>
                  <div className="space-y-2 pl-4">
                    {apps.excludeApplications?.length > 0 ? (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
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
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
