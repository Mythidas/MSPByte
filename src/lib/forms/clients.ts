import z from "zod";

export const clientFormSchema = z.object({
  id: z.string().optional(),
  tenant_id: z.string(),
  name: z.string().min(1, { message: "Name is required" })
});
export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const siteFormSchema = z.object({
  id: z.string().optional(),
  client_id: z.string(),
  tenant_id: z.string(),
  name: z.string()
});
export type SiteFormValues = z.infer<typeof siteFormSchema>;