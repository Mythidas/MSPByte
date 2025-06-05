import z from "zod";

export const deleteFormSchema = z.object({
  id: z.string(),
  url: z.string().optional()
});

export type DeleteFormValues = z.infer<typeof deleteFormSchema>;