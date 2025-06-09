import z from "zod";

export const sophosPartnerFormSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  integration_id: z.string().optional(),
  slug: z.string(),
  client_id: z.string().min(1, "Client ID required"),
  client_secret: z.string().min(1, "Client Secret required"),
  enabled: z.boolean()
});
export type SophosPartnerFormValues = z.infer<typeof sophosPartnerFormSchema>;