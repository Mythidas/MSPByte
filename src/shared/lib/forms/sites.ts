import z from "zod";

export const siteFormSchema = z.object({
  id: z.string().optional(),
  parent_id: z.string().optional(),
  tenant_id: z.string(),
  name: z.string(),
  is_parent: z.boolean()
});
export type SiteFormValues = z.infer<typeof siteFormSchema>;