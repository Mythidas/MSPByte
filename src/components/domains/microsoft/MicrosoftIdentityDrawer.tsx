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

type Props = {
  label: string;
  identity: Tables<'source_identities_view'>;
  licenses: Tables<'source_license_info'>[];
};

export default function MicrosoftIdentityDrawer({ label, identity, licenses }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger className="hover:cursor-pointer hover:text-primary">{label}</DrawerTrigger>
      <DrawerContent data-vaul-no-drag>
        <DrawerHeader>
          <DrawerTitle className="flex justify-between items-center">
            <span className="select-text">{identity.name}</span>
            <Badge variant={identity.enabled ? 'default' : 'secondary'}>
              {identity.enabled ? 'Active' : 'Disabled'}
            </Badge>
          </DrawerTitle>
          <DrawerDescription>
            <span className="select-text">{identity.email}</span>
          </DrawerDescription>
        </DrawerHeader>
        <Separator />

        <div className="flex flex-col gap-4 p-4">
          <div className="flex justify-between">
            <Label className="flex flex-col gap-2 items-start">
              <span className="text-base font-bold">Last Active</span>
              <span className="select-text">
                {new Date(identity.last_activity!).toLocaleString()}
              </span>
            </Label>
            <Badge variant={identity.type === 'member' ? 'default' : 'secondary'} className="h-fit">
              {pascalCase(identity.type!)}
            </Badge>
          </div>
          <div className="flex gap-4">
            <Label className="flex flex-col gap-2 items-start">
              <span className="text-base font-bold">MFA Enforced</span>
              <span>{identity.mfa_enforced ? 'True' : 'False'}</span>
            </Label>
            <Label className="flex flex-col gap-2 items-start">
              <span className="text-base font-bold">Enforcement</span>
              <span>{prettyText(identity.enforcement_type!)}</span>
            </Label>
          </div>
          <div>
            <Label className="flex flex-col gap-2 items-start">
              <span className="text-base font-bold">
                Methods ({(identity.mfa_methods as unknown[]).length})
              </span>
              <div className="grid gap-2">
                {(identity.mfa_methods as { id: string; type: string; displayName?: string }[]).map(
                  (method) => {
                    return (
                      <div key={method.id} className="flex gap-2">
                        <span className="select-text">{pascalCase(method.type)}</span>
                        <span className="select-text">{method.displayName}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </Label>
          </div>
          <div>
            <Label className="flex flex-col gap-2 items-start">
              <span className="text-base font-bold">
                Licenses ({identity.license_skus!.length})
              </span>
              <div className="grid gap-2">
                {licenses
                  .filter((lic) => identity.license_skus?.includes(lic.sku))
                  .map((license) => {
                    return (
                      <span key={license.id} className="select-text">
                        {license.name}
                      </span>
                    );
                  })}
              </div>
            </Label>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
