export type FormState<Schema> = {
  success?: boolean;
  errors?: Record<string, string[]>;
  values?: Partial<Schema>;
  message?: string;
}

export type FormFooterProps = {
  cancel_route?: string;
  submit_text: string;
  pending_text: string;
}

export const accessModules = ["tenants", "users", "roles", "integrations", "clients", "devices"] as const;
export const accessLevels = ["none", "read", "edit", "full"] as const;

export type RoleAccessModule = typeof accessModules[number];
export type RoleAccessLevel = typeof accessLevels[number];

export type Error = {
  module: RoleAccessModule;
  context: string;
  message: string;
  time: Date;
}

export type ActionResponse<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: Error;
}