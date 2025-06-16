import z from "zod";

export const sophosPartnerFormSchema = z.object({
  id: z.string().optional(),
  tenant_id: z.string(),
  source_id: z.string(),
  slug: z.string(),
  client_id: z.string().min(1, "Client ID required"),
  client_secret: z.string().min(1, "Client Secret required"),
  enabled: z.boolean()
});
export type SophosPartnerFormValues = z.infer<typeof sophosPartnerFormSchema>;

export const microsoft365FormSchema = z.object({
  id: z.string().optional(),
  tenant_id: z.string(),
  source_id: z.string(),
  enabled: z.boolean()
});
export type Microsoft365FormValues = z.infer<typeof microsoft365FormSchema>;