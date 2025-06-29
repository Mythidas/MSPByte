'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsContent } from '@/components/ui/tabs';
import FormAlert from '@/components/ux/FormAlert';
import { SubmitButton } from '@/components/ux/SubmitButton';
import RouteTabsTrigger from '@/components/ux/RouteTabsTrigger';
import { useUser } from '@/lib/providers/UserContext';
import { Tables } from '@/db/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Microsoft365MappingsDialog from '@/components/dialogs/Microsoft365MappingsDiablog';
import { deleteSourceIntegrations, putSourceIntegrations } from '@/services/integrations';

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
      if (!data.client_id?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['client_id'],
          message: 'Client ID is required when enabled',
        });
      }
      if (!data.client_secret?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['client_secret'],
          message: 'Client Secret is required when enabled',
        });
      }
    }
  });

type FormData = z.infer<typeof formSchema>;

type Props = {
  source: Tables<'sources'>;
  integration?: Tables<'source_integrations'>;
};

export default function Microsoft365({ source, integration }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
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
      enabled: !!integration,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);

      if (!data.enabled && integration) {
        const result = await deleteSourceIntegrations([integration.id]);
        if (!result.ok) throw result.error.message;
        toast.success('Integration disabled');
      } else if (data.enabled) {
        const result = await putSourceIntegrations([
          {
            tenant_id: data.tenant_id,
            source_id: data.source_id,
            config: {},
          },
        ]);
        if (!result.ok) throw result.error.message;
        toast.success('Integration saved');
      }

      router.refresh();
    } catch (err) {
      toast.error(`Failed to save integration: ${err}`);
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Microsoft365MappingsDialog source={source} integration={integration} />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex justify-start">
            <SubmitButton pending={isSaving}>Save</SubmitButton>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
}
