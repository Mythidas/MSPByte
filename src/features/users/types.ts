export type UserMetadata = {
  selected_source: string;
};

export const accessModules = [
  'Global.Admin',
  'Integrations.Read',
  'Integrations.Write',
  'Sources.Read',
  'Tenant.Read',
  'Tenant.Write',
  'Users.Read',
  'Users.Write',
  'Users.Delete',
  'Roles.Read',
  'Roles.Write',
  'Roles.Delete',
  'Sites.Read',
  'Sites.Write',
  'Sites.Delete',
  'Groups.Read',
  'Groups.Write',
  'Groups.Delete',
  'Activity.Read',
  'Activity.Write',
  'Activity.Delete',
  'SourceTenants.Read',
  'SourceTenants.Write',
  'SourceTenants.Delete',
] as const;

export type RoleAccessKey = (typeof accessModules)[number];
