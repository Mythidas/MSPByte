'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import FormAlert from "@/components/ux/FormAlert";
import FormError from "@/components/ux/FormError";
import RouteTabsTrigger from "@/components/ux/RouteTabsTrigger";
import { SubmitButton } from "@/components/ux/SubmitButton";
import { useUser } from "@/lib/providers/UserContext";
import { FormState } from "@/types";
import { Tables } from "@/types/database";
import { useActionState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { microsoft365IntegrationAction } from "@/lib/actions/form/integrations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Microsoft365FormValues } from "@/lib/forms/sources";
import Microsoft365MappingsDialog from "@/components/dialogs/Microsoft365MappingsDiablog";

type Props = {
  source: Tables<'sources'>;
  integration: Tables<'source_integrations'> | null;
  mappings: Tables<'site_source_mappings'>[];
  sites: Tables<'sites'>[]
  searchParams: { tab?: string };
}

export default function Microsoft365({ source, integration, mappings, ...props }: Props) {
  const [state, formAction] = useActionState<FormState<Microsoft365FormValues>, FormData>(
    microsoft365IntegrationAction,
    {}
  );
  const context = useUser();
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.info('Saved integration settings');
      router.refresh();
    }
  }, [state])

  return (
    <Tabs defaultValue={props.searchParams.tab || "overview"} className="flex flex-col size-full">
      <TabsList>
        <RouteTabsTrigger value="overview">Overview</RouteTabsTrigger>
        <RouteTabsTrigger value="configuration">Configuration</RouteTabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        Overview
      </TabsContent>
      <TabsContent value="configuration">
        <form action={formAction} className="flex flex-col pt-2 gap-4 ">
          <input name="id" hidden defaultValue={integration?.id} />
          <input name="source_id" hidden defaultValue={source.id} />
          <input name="tenant_id" hidden defaultValue={context?.tenant_id} />
          <input name="slug" hidden defaultValue={source.slug} />

          <FormAlert message={state.message} />
          <div className="flex w-full justify-between">
            <Label>
              <Switch name="enabled" defaultChecked={!!integration} />
              Enabled
            </Label>
            {integration && <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Microsoft365MappingsDialog source={source} integration={integration!} />
              </DropdownMenuContent>
            </DropdownMenu>}
          </div>
          <div className="flex flex-col gap-2">
          </div>
          <div>
            <SubmitButton pendingText="Saving...">
              Save
            </SubmitButton>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
}