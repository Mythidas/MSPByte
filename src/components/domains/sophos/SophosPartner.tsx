'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FormError from '@/components/common/FormError';
import FormAlert from '@/components/common/FormAlert';
import { SubmitButton } from '@/components/common/SubmitButton';
import SophosMappingsDialog from '@/components/domains/sophos/SophosMappingsDialog';
import { useUser } from '@/lib/providers/UserContext';
import { Tables } from '@/db/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { useState } from 'react';
import { deleteSourceIntegrations, putSourceIntegrations } from '@/services/integrations';
import { Tabs, TabsList, TabsContent } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/common/routed/RouteTabsTrigger';
import { useSearchParams } from 'next/navigation';

const formSchema = z
  .object({
    id: z.string().optional(),
    source_id: z.string(),
    tenant_id: z.string(),
    client_id: z.string(),
    client_secret: z.string(),
    enabled: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.enabled) {
      if (!data.client_id || data.client_id.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['client_id'],
          message: 'Client ID is required',
        });
      }
      if (!data.client_secret || data.client_secret.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['client_secret'],
          message: 'Client Secret is required',
        });
      }
    }
  });

type FormData = z.infer<typeof formSchema>;

type SophosIntegrationConfig = {
  client_id?: string;
  client_secret?: string;
};

type Props = {
  source: Tables<'sources'>;
  integration?: Tables<'source_integrations'>;
};

export default function SophosPartnerForm({ source, integration }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const searchParams = useSearchParams();
  const { user } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: integration?.id,
      source_id: source.id,
      tenant_id: user?.tenant_id ?? '',
      client_id: (integration?.config as SophosIntegrationConfig).client_id ?? '',
      client_secret: '',
      enabled: !!integration,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);

      if (!data.enabled && integration) {
        const result = await deleteSourceIntegrations([data.id!]);

        if (!result.ok) {
          throw result.error.message;
        }

        toast.info('Integration deleted');
      } else if (data.enabled) {
        const result = await putSourceIntegrations([
          {
            tenant_id: data.tenant_id,
            source_id: data.source_id,
            config: {
              client_id: data.client_id,
              client_secret: data.client_secret,
            },
          },
        ]);

        if (!result.ok) {
          throw result.error.message;
        }

        toast.info('Integration enabled!');
      }
    } catch (err) {
      toast.error(`Failed to save: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Tabs defaultValue={searchParams.get('tab') || 'overview'} className="flex flex-col size-full">
      <TabsList>
        <RouteTabsTrigger value="overview">Overview</RouteTabsTrigger>
        <RouteTabsTrigger value="configuration">Configuration</RouteTabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="p-4">Overview</div>
      </TabsContent>
      <TabsContent value="configuration">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('id')} />
          <input type="hidden" {...register('source_id')} />
          <input type="hidden" {...register('tenant_id')} />

          <FormAlert message={errors.root?.message} />

          <div className="flex justify-between items-center">
            <Label className="flex items-center gap-2">
              <Switch
                defaultChecked={!!integration}
                onCheckedChange={(checked) => setValue('enabled', checked)}
              />
              Enabled
            </Label>

            {integration && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <SophosMappingsDialog source={source} integration={integration} />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 w-1/3">
            <Label className="flex flex-col items-start">
              Client ID
              <Input placeholder="********" {...register('client_id')} />
              <FormError name="client_id" errors={errors} />
            </Label>

            <Label className="flex flex-col items-start">
              Client Secret
              <Input placeholder="********" {...register('client_secret')} />
              <FormError name="client_secret" errors={errors} />
            </Label>
          </div>
          <div className="flex justify-start">
            <SubmitButton pending={isSaving}>Save</SubmitButton>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
}
