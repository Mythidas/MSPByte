import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { SubmitButton } from '@/components/ux/SubmitButton';
import { Tables } from '@/db/schema';
import {
  deleteSiteSourceMapping,
  putSiteSourceMapping,
  updateSiteSourceMapping,
} from 'packages/services/siteSourceMappings';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  mapping: Tables<'site_mappings_view'>;
  onSave?: (mapping: Tables<'site_mappings_view'>) => void;
  onClear?: (mapping: Tables<'site_mappings_view'>) => void;
};

export default function Microsoft365InfoPopover({ mapping, onSave, onClear }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [cleared, setCleared] = useState(false);
  const domainRef = useRef<HTMLInputElement>(null);
  const tenantRef = useRef<HTMLInputElement>(null);
  const clientRef = useRef<HTMLInputElement>(null);
  const secretRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: any) => {
    e.stopPropagation();
    setIsSaving(true);

    try {
      if (cleared) {
        if (
          tenantRef.current &&
          domainRef.current &&
          clientRef.current &&
          secretRef.current &&
          mapping.id
        ) {
          if (
            !tenantRef.current.value &&
            !domainRef.current.value &&
            !clientRef.current.value &&
            !secretRef.current.value
          ) {
            const result = await deleteSiteSourceMapping(mapping.id);
            if (!result.ok) throw new Error(result.error.message);
            onClear && onClear(mapping);
          }
        }
      }

      if (mapping.id) {
        if (!tenantRef.current || !domainRef.current || !clientRef.current || !secretRef.current)
          return;

        const result = await updateSiteSourceMapping(mapping.id, {
          id: mapping.id,
          tenant_id: mapping.tenant_id!,
          site_id: mapping.site_id!,
          source_id: mapping.source_id!,
          external_id: tenantRef.current.value,
          external_name: domainRef.current.value,
          metadata: {
            client_id: clientRef.current.value,
            client_secret: secretRef.current.value,
          },
        });

        if (!result.ok) throw new Error(result.error.message);

        onSave &&
          onSave({
            ...mapping,
            external_id: tenantRef.current.value,
            external_name: domainRef.current.value,
            metadata: {
              client_id: clientRef.current.value,
              client_secret: secretRef.current.value,
            },
          });
      } else {
        if (!tenantRef.current || !domainRef.current || !clientRef.current || !secretRef.current)
          return;

        const result = await putSiteSourceMapping([
          {
            tenant_id: mapping.tenant_id!,
            site_id: mapping.site_id!,
            source_id: mapping.source_id!,
            external_id: tenantRef.current.value,
            external_name: domainRef.current.value,
            metadata: {
              client_id: clientRef.current.value,
              client_secret: secretRef.current.value,
            },
          },
        ]);

        if (!result.ok) throw new Error(result.error.message);
        onSave && onSave({ ...mapping, ...result.data });
      }

      toast.info('Saved site info');
    } catch (err) {
      toast.error(`Failed to save info: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async (e: any) => {
    e.stopPropagation();

    if (domainRef.current) domainRef.current.value = '';
    if (tenantRef.current) tenantRef.current.value = '';
    if (clientRef.current) clientRef.current.value = '';
    if (secretRef.current) secretRef.current.value = '';
    setCleared(true);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={mapping.external_id ? 'default' : 'secondary'}>
          {mapping.external_id ? 'Edit' : 'No Info'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-card">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Microsoft Info</h4>
            <p className="text-muted-foreground text-sm">
              Set the Tenant Application info for API access.
            </p>
          </div>
          <form className="grid gap-2">
            <Label className="flex gap-2 whitespace-nowrap justify-between">
              Domain
              <Input
                placeholder="example.com"
                className="col-span-2 w-8/12"
                required
                defaultValue={mapping.external_name || ''}
                ref={domainRef}
              />
            </Label>
            <Label className="flex gap-2 whitespace-nowrap justify-between">
              Tenant ID
              <Input
                placeholder="*****"
                className="col-span-2 w-8/12"
                required
                defaultValue={mapping.external_id || ''}
                ref={tenantRef}
              />
            </Label>
            <Label className="flex gap-2 whitespace-nowrap justify-between">
              Client ID
              <Input
                placeholder="*****"
                className="col-span-2 w-8/12"
                required
                defaultValue={(mapping.metadata as any).client_id || ''}
                ref={clientRef}
              />
            </Label>
            <Label className="flex gap-2 whitespace-nowrap justify-between">
              Client Secret
              <Input placeholder="*****" className="col-span-2 w-8/12" required ref={secretRef} />
            </Label>
            <Separator />
            <div className="flex gap-2 w-full justify-end">
              <SubmitButton
                variant="destructive"
                onClick={handleClear}
                pendingText="Clear"
                pending={isSaving}
                disabled={!mapping.external_id || isSaving}
              >
                Clear
              </SubmitButton>
              <SubmitButton onClick={handleSave} pendingText="Saving..." pending={isSaving}>
                Save
              </SubmitButton>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
