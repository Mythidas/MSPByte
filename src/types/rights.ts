export const accessModules = ['Tenants', 'Users', 'Roles', 'Sources', 'Sites'] as const;
export const accessLevels = ['None', 'Read', 'Write', 'Full'] as const;

export type RoleAccessModule = (typeof accessModules)[number];
export type RoleAccessLevel = (typeof accessLevels)[number];
