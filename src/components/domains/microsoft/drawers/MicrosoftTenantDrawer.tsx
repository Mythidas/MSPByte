import { Badge } from '@/components/ui/badge';
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
import { prettyText } from '@/lib/utils';
import { useState } from 'react';
import {
  Building2,
  Globe,
  Key,
  Shield,
  Clock,
  Database,
  ExternalLink,
  CircleCheck,
  CircleX,
} from 'lucide-react';
import Display from '@/components/common/Display';
import { differenceInHours, parseISO } from 'date-fns';
import Link from 'next/link';
import { useDelete } from '@/hooks/common/useDelete';
import { SubmitButton } from '@/components/common/SubmitButton';
import SyncSourceItem from '@/components/domains/sources/SyncSourceItem';
import { MicrosoftTenantMetadata } from '@/types/source/tenants';

type Props = {
  label: string;
  tenant: Tables<'source_tenants_view'>;
  onDelete?: () => void;
};

export default function MicrosoftTenantDrawer({ label, tenant, onDelete }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { confirmAndDelete, DeleteDialog } = useDelete<Tables<'source_tenants'>>({
    tableName: 'source_tenants',
    getId: (item) => item.id,
    onDeleted: () => {
      setIsOpen(false);
      onDelete?.();
    },
  });
  const metadata = tenant.metadata as MicrosoftTenantMetadata | null;
  const lastSyncWithin24Hours = tenant.last_sync
    ? differenceInHours(new Date(), parseISO(tenant.last_sync)) <= 24
    : false;

  const getSourceIcon = (sourceId: string) => {
    switch (sourceId) {
      case 'sophos-partner':
        return <Shield className="h-4 w-4" />;
      case 'microsoft-365':
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const maskSecret = (secret: string) => {
    if (!secret) return '';
    const visibleChars = 8;
    const masked = '•'.repeat(Math.max(0, secret.length - visibleChars));
    return masked + secret.slice(-visibleChars);
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
        <DeleteDialog />
        <DrawerHeader className="pb-4">
          <DrawerTitle className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="select-text font-semibold text-lg truncate">
                  {tenant.site_name || 'Unknown Tenant'}
                </span>
                <Link
                  href={`/${tenant.source_id}/sites/${tenant.site_id}?tab=dashboard`}
                  target="_blank"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </DrawerTitle>
          <DrawerDescription className="flex text-sm text-muted-foreground space-x-2">
            <Badge variant="outline" className="text-sm flex items-center gap-1">
              {getSourceIcon(tenant.source_id!)}
              {prettyText(tenant.source_id!)}
            </Badge>
            {tenant.last_sync && (
              <Badge variant="secondary" className="text-xs">
                Synced
              </Badge>
            )}
          </DrawerDescription>
        </DrawerHeader>

        <Separator />

        <div className="flex flex-col gap-4 p-4 overflow-y-auto">
          {/* Basic Information Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Tenant Information
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">External ID</Label>
                <Display>{tenant.external_id}</Display>
              </div>
            </div>
          </div>

          {/* Domains Section */}
          {metadata?.domains && metadata.domains.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Domains ({metadata.domains.length})
              </h3>
              <div className="space-y-2">
                {metadata.domains.map((domain, index) => (
                  <Display key={index} lead={<Globe className="h-4 w-4 text-muted-foreground" />}>
                    <span className="select-text text-sm font-medium">{domain}</span>
                    {domain.includes('.onmicrosoft.com') && (
                      <Badge variant="secondary" className="text-xs">
                        Microsoft
                      </Badge>
                    )}
                  </Display>
                ))}
              </div>
            </div>
          )}

          {/* Security Configuration Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Configuration
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {metadata?.mfa_enforcement && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    MFA Enforcement
                  </Label>
                  <Display
                    lead={
                      metadata.mfa_enforcement !== 'none' ? (
                        <CircleCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <CircleX className="w-4 h-4 text-red-500" />
                      )
                    }
                  >
                    {prettyText(metadata.mfa_enforcement)}
                  </Display>
                </div>
              )}
            </div>
          </div>

          {/* Authentication Section */}
          {(metadata?.client_id || metadata?.client_secret) && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Key className="h-4 w-4" />
                Authentication
              </h3>
              <div className="space-y-2">
                {metadata?.client_id && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Client ID</Label>
                    <Display>{metadata.client_id}</Display>
                  </div>
                )}

                {metadata?.client_secret && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Client Secret
                    </Label>
                    <Display>{maskSecret(metadata.client_secret)}</Display>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sync Information Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Synchronization
            </h3>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Last Sync</Label>
              <Display
                lead={
                  lastSyncWithin24Hours ? (
                    <CircleCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <CircleX className="w-4 h-4 text-amber-500" />
                  )
                }
              >
                {tenant.last_sync
                  ? new Date(tenant.last_sync).toLocaleString()
                  : 'Never synchronized'}
              </Display>
            </div>
          </div>
        </div>

        <div className="flex w-full mt-auto p-4 gap-2">
          <SyncSourceItem
            type="site"
            sourceId={tenant.source_id!}
            tenantId={tenant.tenant_id!}
            siteId={tenant.site_id!}
          />
          <SubmitButton
            variant="destructive"
            onClick={() => confirmAndDelete(tenant as Tables<'source_tenants'>)}
            module="Sources"
            level="Full"
          >
            Delete
          </SubmitButton>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
