'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/common/SubmitButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import z from 'zod';

import {
  putSourceTenant,
  updateSourceTenant,
  deleteSourceTenant,
} from '@/services/source/tenants/tenants';
import { Tables } from '@/db/schema';
import { useState } from 'react';
import FormError from '@/components/common/FormError';

const schema = z.object({
  domains: z.string().optional(),
  tenant_id: z.string().min(1, 'Tenant ID is required'),
  client_id: z.string().min(1, 'Client ID is required'),
  client_secret: z.string().min(1, 'Client Secret is required'),
});

type FormData = z.infer<typeof schema>;

type Props = {
  site: Tables<'sites_view'>;
  mapping?: Tables<'source_tenants'>;
  onSave?: (mapping: Tables<'source_tenants'>) => void;
  onClear?: (mapping: Tables<'source_tenants'>) => void;
};

export default function Microsoft365InfoPopover({ site, mapping, onSave, onClear }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      domains: mapping?.external_name,
      tenant_id: mapping?.external_id || '',
      client_id: (mapping?.metadata as { client_id: string })?.client_id || '',
    },
  });

  const handleClear = async () => {
    if (!mapping) return;

    setIsClearing(true);
    try {
      const result = await deleteSourceTenant(mapping.id);
      if (!result.ok) throw new Error(result.error.message);

      toast.success('Mapping cleared');
      onClear?.(mapping);
      setIsOpen(false);
    } catch (err) {
      toast.error(`Failed to clear: ${err}`);
    } finally {
      setIsClearing(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      if (mapping) {
        const result = await updateSourceTenant(mapping.id, {
          ...mapping,
          external_id: data.tenant_id,
          external_name: data.domains,
          metadata: {
            client_id: data.client_id,
            client_secret: data.client_secret,
          },
        });
        if (!result.ok) throw new Error(result.error.message);

        toast.success('Mapping updated');
        onSave?.({ ...mapping, ...result.data });
      } else {
        const result = await putSourceTenant([
          {
            tenant_id: site.tenant_id!,
            site_id: site.id!,
            source_id: 'microsoft-365',
            external_id: data.tenant_id,
            external_name: data.domains || '',
            metadata: {
              client_id: data.client_id,
              client_secret: data.client_secret,
            },
          },
        ]);
        if (!result.ok) throw new Error(result.error.message);
        toast.success('Mapping created');
        onSave?.(result.data[0]);
      }
    } catch (err) {
      toast.error(`Save failed: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant={mapping?.external_id ? 'default' : 'secondary'}>
          {mapping?.external_id ? 'Edit' : 'No Info'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-card">
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Microsoft Info</h4>
            <p className="text-sm text-muted-foreground">
              Set the Tenant Application info for API access.
            </p>
          </div>

          <Label className="flex justify-between items-center gap-2">
            <span className="flex items-center gap-1">
              Domains
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  If blank, integration will sync all domains in tenant.
                </TooltipContent>
              </Tooltip>
            </span>
            <Input placeholder="Comma Separated" className="w-8/12" {...register('domains')} />
            <FormError name="domains" errors={errors} />
          </Label>

          <Label className="flex justify-between gap-2">
            Tenant ID
            <Input className="w-8/12" placeholder="Directory ID" {...register('tenant_id')} />
            <FormError name="tenant_id" errors={errors} />
          </Label>

          <Label className="flex justify-between gap-2">
            Client ID
            <Input className="w-8/12" placeholder="App ID" {...register('client_id')} />
            <FormError name="client_id" errors={errors} />
          </Label>

          <Label className="flex justify-between gap-2">
            Client Secret
            <Input className="w-8/12" placeholder="App Secret" {...register('client_secret')} />
            <FormError name="client_secret" errors={errors} />
          </Label>

          <Separator />
          <div className="flex justify-end gap-2">
            <SubmitButton
              variant="destructive"
              disabled={isSaving || isClearing || !mapping}
              onClick={handleClear}
              pending={isClearing}
              type="button"
            >
              Clear
            </SubmitButton>
            <SubmitButton pending={isSaving} disabled={isSaving || isClearing}>
              Save
            </SubmitButton>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
