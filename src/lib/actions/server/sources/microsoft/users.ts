import { getGraphClient } from "@/lib/actions/server/sources/microsoft";
import { Debug } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { Tables } from "@/types/database";
import { Microsoft } from "@/types/microsoft";

export async function getUsers(mapping: Tables<'site_source_mappings'>): Promise<ActionResponse<Microsoft.UserShape[]>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
    if (!client.ok) {
      throw new Error(client.error.message);
    }

    const users = await client.data.api('/users')
      .select(Microsoft.UserFieldsRequired.join(','))
      .header('ConsistencyLevel', 'eventual')
      .filter(`endswith(mail,\'${mapping.external_name}\')`)
      .orderby('userPrincipalName')
      .get()

    return {
      ok: true,
      data: users.value
    }
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'get-users',
      message: String(err),
      time: new Date()
    });
  }
}