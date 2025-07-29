import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tables } from '@/db/schema';
import { useState } from 'react';
import {
  Shield,
  Users,
  Smartphone,
  MapPin,
  Globe,
  Key,
  Clock,
  ExternalLink,
  CircleCheck,
  CircleX,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import Display from '@/components/shared/Display';
import SyncSourceItem from '@/components/domain/sources/SyncSourceItem';
import Link from 'next/link';
import MicrosoftPolicyAssignmentsPopover from '@/components/domain/integrations/microsoft/popovers/MicrosoftPolicyAssigntmentsPopover';
import { MicrosoftPolicyMetadata } from '@/types/source/policies';

type Props = {
  label: string;
  policy: Tables<'source_policies_view'>;
  onDelete?: () => void;
};

export default function MicrosoftPolicyDrawer({ label, policy }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const metadata = policy.metadata as MicrosoftPolicyMetadata | null;

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'enabled':
        return <CircleCheck className="h-4 w-4 text-green-500" />;
      case 'disabled':
        return <CircleX className="h-4 w-4 text-red-500" />;
      case 'report_only':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <CircleX className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'enabled':
        return 'On';
      case 'disabled':
        return 'Off';
      case 'report_only':
        return 'Report-only';
      default:
        return status;
    }
  };

  const formatUserTargetsIncluded = () => {
    const users = metadata?.conditions.users;
    if (!users) return 'Not configured';

    const targets = [];
    if (users.includeUsers?.includes('All')) targets.push('All users');
    if (users.includeUsers?.length && !users.includeUsers.includes('All')) {
      targets.push(`${users.includeUsers.length} specific users`);
    }
    if (users.includeGroups?.length) targets.push(`${users.includeGroups.length} groups`);
    if (users.includeRoles?.length) targets.push(`${users.includeRoles.length} directory roles`);

    return targets.length > 0 ? targets.join(', ') : 'Not configured';
  };

  const formatUserTargetsExcluded = () => {
    const users = metadata?.conditions.users;
    if (!users) return 'Not configured';

    const targets = [];
    if (users.excludeUsers?.length) {
      targets.push(`${users.excludeUsers.length} specific users`);
    }
    if (users.excludeGroups?.length) targets.push(`${users.excludeGroups.length} groups`);
    if (users.excludeRoles?.length) targets.push(`${users.excludeRoles.length} directory roles`);

    return targets.length > 0 ? targets.join(', ') : 'Not configured';
  };

  const formatApplications = () => {
    const applications = metadata?.conditions.applications;
    if (!applications?.includeApplications?.length) return 'Not configured';

    // Common application IDs mapping
    const knownApps: Record<string, string> = {
      '797f4846-ba00-4fd7-ba43-dac1f8f63013': 'Microsoft Azure Management',
      '00000003-0000-0000-c000-000000000000': 'Microsoft Graph',
      '00000002-0000-0000-c000-000000000000': 'Office 365 Exchange Online',
    };

    const appNames = applications.includeApplications.map(
      (appId: string) => knownApps[appId] || `App (${appId.substring(0, 8)}...)`
    );

    return appNames.join(', ');
  };

  const formatGrantControls = () => {
    const grantControls = metadata?.grantControls;
    if (!grantControls?.builtInControls?.length) return 'Not configured';

    const controlMapping: Record<string, string> = {
      mfa: 'Require multifactor authentication',
      compliantDevice: 'Require device to be marked as compliant',
      domainJoinedDevice: 'Require Hybrid Azure AD joined device',
      approvedApplication: 'Require approved client app',
      compliantApplication: 'Require app protection policy',
      passwordChange: 'Require password change',
    };

    const controls = grantControls.builtInControls.map(
      (control: string) => controlMapping[control] || control
    );

    const operator = grantControls.operator === 'AND' ? 'Require all' : 'Require one';
    return `${operator}: ${controls.join(', ')}`;
  };

  const formatPlatforms = () => {
    const platforms = metadata?.conditions.platforms;
    if (!platforms?.includePlatforms?.length) return 'Any device';
    return platforms.includePlatforms.join(', ');
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger className="hover:cursor-pointer hover:text-primary transition-colors">
        {label}
      </DrawerTrigger>
      <DrawerContent
        data-vaul-no-drag
        className="h-full w-[500px] fixed right-0 top-0 mt-0 rounded-none"
      >
        <DrawerHeader className="pb-4">
          <DrawerTitle className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="select-text font-semibold text-lg truncate">
                  {policy.name || metadata?.displayName || 'Unknown Policy'}
                </span>
              </div>
            </div>
          </DrawerTitle>
          <DrawerDescription className="flex text-sm text-muted-foreground gap-2 items-center">
            {policy.site_name}{' '}
            <Link href={`/sites/${policy.site_slug}/${policy.source_id}/policies`}>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </DrawerDescription>
        </DrawerHeader>

        <Separator />

        <div className="flex flex-col gap-4 p-4 overflow-y-auto">
          {/* Basic Information Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Policy Information
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Policy ID</Label>
                <Display>{policy.external_id!}</Display>
              </div>
              {metadata?.templateId && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Template ID</Label>
                  <Display>{metadata.templateId}</Display>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">State</Label>
                <Display lead={getStatusIcon(policy.status!)}>
                  {getStatusText(policy.status!)}
                </Display>
              </div>
            </div>
          </div>

          {/* Assignments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Assignments
              </h3>
              <MicrosoftPolicyAssignmentsPopover metadata={metadata!} siteId={policy.site_id!} />
            </div>

            {/* Users */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Included Users</Label>
              <Display lead={<Users className="h-4 w-4 text-muted-foreground" />}>
                {formatUserTargetsIncluded()}
              </Display>
              <Label className="text-sm font-medium text-muted-foreground">Excluded Users</Label>
              <Display lead={<Users className="h-4 w-4 text-muted-foreground" />}>
                {formatUserTargetsExcluded()}
              </Display>
            </div>

            {/* Cloud apps */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Cloud apps or actions
              </Label>
              <Display lead={<Globe className="h-4 w-4 text-muted-foreground" />}>
                {formatApplications()}
              </Display>
            </div>

            {/* Conditions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Conditions</Label>

              {/* User risk */}
              {metadata?.conditions?.userRiskLevels?.length ? (
                <Display lead={<AlertTriangle className="h-4 w-4 text-amber-500" />}>
                  User risk: {metadata.conditions.userRiskLevels.join(', ')}
                </Display>
              ) : null}

              {/* Sign-in risk */}
              {metadata?.conditions?.signInRiskLevels?.length ? (
                <Display lead={<AlertTriangle className="h-4 w-4 text-amber-500" />}>
                  Sign-in risk: {metadata.conditions.signInRiskLevels.join(', ')}
                </Display>
              ) : null}

              {/* Device platforms */}
              <Display lead={<Smartphone className="h-4 w-4 text-muted-foreground" />}>
                Device platforms: {formatPlatforms()}
              </Display>

              {/* Locations */}
              <Display lead={<MapPin className="h-4 w-4 text-muted-foreground" />}>
                Locations: {metadata?.conditions?.locations ? 'Configured' : 'Any location'}
              </Display>

              {/* Client apps */}
              {metadata?.conditions?.clientAppTypes?.length ? (
                <Display lead={<Smartphone className="h-4 w-4 text-muted-foreground" />}>
                  Client apps:{' '}
                  {metadata.conditions.clientAppTypes.includes('all')
                    ? 'Any client app'
                    : metadata.conditions.clientAppTypes.join(', ')}
                </Display>
              ) : null}
            </div>
          </div>

          {/* Access controls Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Key className="h-4 w-4" />
              Access controls
            </h3>

            {/* Grant */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Grant</Label>
              <Display lead={<Key className="h-4 w-4 text-green-500" />}>
                {formatGrantControls()}
              </Display>
            </div>

            {/* Session */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Session</Label>
              <Display lead={<Clock className="h-4 w-4 text-muted-foreground" />}>
                {metadata?.sessionControls ? 'Session controls configured' : 'No session controls'}
              </Display>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </h3>
            <div className="space-y-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                <Display>
                  {metadata?.createdDateTime
                    ? new Date(metadata.createdDateTime).toLocaleString()
                    : 'Unknown'}
                </Display>
              </div>

              {metadata?.modifiedDateTime && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Last Modified</Label>
                  <Display>{new Date(metadata.modifiedDateTime).toLocaleString()}</Display>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full mt-auto p-4 gap-2">
          <SyncSourceItem
            type="site"
            sourceId={policy.source_id!}
            tenantId={policy.tenant_id!}
            siteId={policy.site_id!}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
