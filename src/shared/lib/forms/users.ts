import z from "zod";

export const userFormSchema = z.object({
  id: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(1, { message: "Name is required" }),
  role_id: z.string(),
  send_email: z.boolean(),
  tenant_id: z.string()
});
export type UserFormValues = z.infer<typeof userFormSchema>;

export const inviteFormSchema = z.object({
  code: z.string(),
  password: z.string()
});
export type InviteFormValues = z.infer<typeof inviteFormSchema>;