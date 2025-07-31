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
import { pascalCase, prettyText } from '@/lib/utils';
import { useState } from 'react';
import { User, Mail, Key, AlertCircle, FileCheck2, CircleCheck, CircleX } from 'lucide-react';
import Display from '@/components/shared/Display';
import { MicrosoftIdentityMetadata } from '@/types/source/identities';

type Props = {
  label: string;
  identity: Tables<'source_identities_view'>;
  licenses?: Tables<'source_license_info'>[];
};

export default function SourceIdentityDrawer({ label, identity, licenses = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const metadata = identity.metadata as MicrosoftIdentityMetadata | null;

  const mfaMethods = identity.mfa_methods as
    | { id: string; type: string; displayName?: string }[]
    | null;

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
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="select-text font-semibold text-lg truncate">
                  {identity.name || metadata?.displayName || 'Unknown User'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="select-text text-sm text-muted-foreground truncate">
                  {identity.email}
                </span>
              </div>
            </div>
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground space-x-2">
            <Badge variant={identity.enabled ? 'default' : 'secondary'}>
              {identity.enabled ? 'Active' : 'Disabled'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {pascalCase(identity.type || 'member')}
            </Badge>
          </DrawerDescription>
        </DrawerHeader>

        <Separator />

        <div className="flex flex-col gap-4 p-4 overflow-y-auto">
          {/* Info Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Info
            </h3>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Aliases</Label>
              {metadata?.proxyAddresses.map((address) => {
                const segments = address.split('smtp:');
                if (address.includes('SMTP:') || !segments[1]) return;

                return (
                  <Display key={address}>
                    <span className="select-text text-sm font-medium">{segments[1]}</span>
                  </Display>
                );
              })}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Last Active</Label>
              <Display>
                {identity.last_activity_at
                  ? new Date(identity.last_activity_at).toLocaleString()
                  : 'Unavailable'}
              </Display>
            </div>
          </div>

          {/* Security Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Key className="h-4 w-4" />
              Security
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">MFA Status</Label>
                <Display
                  lead={
                    identity.mfa_enforced ? (
                      <CircleCheck className="w-4 h-4 text-green-500" />
                    ) : (
                      <CircleX className="w-4 h-4 text-red-500" />
                    )
                  }
                >
                  {identity.mfa_enforced ? 'Enforced' : 'Not Enforced'}
                </Display>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Enforcement Type
                </Label>
                <Display>{prettyText(identity.enforcement_type!)}</Display>
              </div>
            </div>

            {mfaMethods && mfaMethods.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  MFA Methods ({mfaMethods.length})
                </Label>
                <div className="space-y-2">
                  {mfaMethods.map((method) => (
                    <Display
                      key={method.id}
                      lead={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
                    >
                      <span className="select-text text-sm font-medium">
                        {pascalCase(method.type)}
                      </span>
                      {method.displayName && (
                        <span className="select-text text-sm text-muted-foreground">
                          {method.displayName}
                        </span>
                      )}
                    </Display>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Licenses Section */}
          {identity.license_skus && identity.license_skus.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <FileCheck2 className="h-4 w-4" />
                Licenses ({identity.license_skus.length})
              </h3>
              <div className="space-y-2">
                {licenses.length > 0
                  ? licenses
                      .filter((lic) => identity.license_skus?.includes(lic.sku))
                      .map((license) => <Display key={license.id}>{license.name}</Display>)
                  : identity.license_skus.map((sku) => <Display key={sku}>{sku}</Display>)}
              </div>
            </div>
          )}

          {/* Additional Info Section */}
          {metadata && (
            <div className="space-y-4">
              <h3 className="font-semibold text-base">Additional Information</h3>
              <div className="space-y-3">
                {metadata.roles && metadata.roles.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Roles ({metadata.roles.length})
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {metadata.roles.map((role, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {role.displayName || (role as unknown as string)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {metadata.groups && metadata.groups.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Groups ({metadata.groups.length})
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {metadata.groups.map((group, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {group.displayName || (group as unknown as string)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
