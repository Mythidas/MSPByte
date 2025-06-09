'use client'

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormAlert from "@/components/ux/FormAlert";
import FormError from "@/components/ux/FormError";
import RouteTabsTrigger from "@/components/ux/RouteTabsTrigger";
import { SubmitButton } from "@/components/ux/SubmitButton";
import { createSophostIntegrationAction, editSophostIntegrationAction } from "@/lib/actions/sources";
import { SophosPartnerFormValues } from "@/lib/forms/sources";
import { useUser } from "@/lib/providers/UserContext";
import { FormState } from "@/types";
import { Tables } from "@/types/database";
import { AddMappingDialog } from "@/components/ux/AddMappingDialog";
import { DeleteMappingDialog } from "@/components/ux/DeleteMappingDialog";
import { useActionState } from "react";

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
        <Tabs defaultValue="settings" className="flex flex-col size-full">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="mappings">Mappings</TabsTrigger>
          </TabsList>
          <TabsContent value="settings">
            <form action={formAction} className="flex flex-col pt-2 gap-4 ">
              <input name="id" hidden defaultValue={props.source.id} />
              <input name="tenant_id" hidden defaultValue={context?.tenant_id} />
              <input name="integration_id" hidden defaultValue={props.integration?.id} />
              <input name="slug" hidden defaultValue={props.source.slug} />

              <FormAlert message={state.message} />
              <Label>
                <Switch name="enabled" defaultChecked={!!props.integration} />
                Enabled
              </Label>
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
          <TabsContent value="mappings">
            <TabsContent value="mappings" className="py-4">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Site Mappings</h3>
                  <AddMappingDialog
                    integration={props.integration!}
                    sites={props.sites}
                    existingMappings={props.mappings}
                  />
                </div>

                {props.mappings && props.mappings.length > 0 ? (
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">Site</th>
                          <th className="text-left p-3 font-medium">Sophos Site</th>
                          <th className="text-right p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {props.mappings.map((mapping) => (
                          <tr key={mapping.id} className="border-b">
                            <td className="p-3">{props.sites.find((s) => s.id === mapping.site_id)?.name}</td>
                            <td className="p-3">{mapping.external_name}</td>
                            <td className="p-3 text-right">
                              <DeleteMappingDialog
                                source={props.source}
                                mapping={mapping}
                                siteName={props.sites.find((s) => s.id === mapping.site_id)!.name}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border rounded-md p-6 flex flex-col items-center justify-center text-center gap-3">
                    <p className="text-muted-foreground">No site mappings found</p>
                    <p className="text-sm text-muted-foreground">
                      Create a mapping to associate your sites with corresponding sites in your Sophos Partner account
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
}