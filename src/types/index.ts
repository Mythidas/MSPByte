export type FormState<Schema> = {
  success?: boolean;
  errors?: Record<string, string[]>;
  values?: Partial<Schema>;
  message?: string;
};

export type Option = {
  label: string;
  value: string;
};

export const accessModules = [
  'tenants',
  'users',
  'roles',
  'integrations',
  'sites',
  'devices',
] as const;
export const accessLevels = ['none', 'read', 'edit', 'full'] as const;

export type RoleAccessModule = (typeof accessModules)[number];
export type RoleAccessLevel = (typeof accessLevels)[number];

export type APIError = {
  module: string;
  context: string;
  message: string;
  time: Date;
};

export type APIResponse<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: APIError;
    };
