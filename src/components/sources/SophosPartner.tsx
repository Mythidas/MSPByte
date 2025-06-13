'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import FormAlert from "@/components/ux/FormAlert";
import FormError from "@/components/ux/FormError";
import RouteTabsTrigger from "@/components/ux/RouteTabsTrigger";
import { SubmitButton } from "@/components/ux/SubmitButton";
import { createSophostIntegrationAction, editSophostIntegrationAction } from "@/lib/actions/form/sources";
import { SophosPartnerFormValues } from "@/lib/forms/sources";
import { useUser } from "@/lib/providers/UserContext";
import { FormState } from "@/types";
import { Tables } from "@/types/database";
import { useActionState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";
import SophosMappingsDialog from "@/components/dialogs/SophosMappingsDialog";

type Props = {
  source: Tables<'sources'>;
  integration: Tables<'source_integrations'> | null;
  mappings: Tables<'site_source_mappings'>[];
  sites: Tables<'sites'>[]
  searchParams: { tab?: string };
}

export default function SophosPartner(props: Props) {
  const [state, formAction] = useActionState<FormState<SophosPartnerFormValues>, FormData>(
    props.integration ? createSophostIntegrationAction : editSophostIntegrationAction,
    {}
  );
  const context = useUser();

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
          <input name="id" hidden defaultValue={props.source.id} />
          <input name="tenant_id" hidden defaultValue={context?.tenant_id} />
          <input name="integration_id" hidden defaultValue={props.integration?.id} />
          <input name="slug" hidden defaultValue={props.source.slug} />

          <FormAlert message={state.message} />
          <div className="flex w-full justify-between">
            <Label>
              <Switch name="enabled" defaultChecked={!!props.integration} />
              Enabled
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Cog className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <SophosMappingsDialog source={props.source} integration={props.integration!} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-nowrap">
              <span className="w-32">Client ID</span>
              <Input name="client_id" placeholder="**************" defaultValue={state.values?.client_id} />
            </Label>
            <FormError name="client_id" errors={state.errors} />
            <Label className="text-nowrap">
              <span className="w-32">Client Secret</span>
              <Input name="client_secret" placeholder="**************" defaultValue={state.values?.client_secret} />
            </Label>
            <FormError name="client_secret" errors={state.errors} />
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