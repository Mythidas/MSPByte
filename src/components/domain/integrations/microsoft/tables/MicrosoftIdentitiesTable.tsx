'use client';

import DataTable from '@/components/shared/table/DataTable';
import { Tables } from '@/db/schema';
import {
  booleanColumn,
  column,
  dateColumn,
  listColumn,
  textColumn,
} from '@/components/shared/table/DataTableColumn';
import { DataTableColumnDef, DataTableFetcher } from '@/types/data-table';
import Link from 'next/link';
import { getSourceLicenses } from '@/services/licenses';
import { pascalCase, Timer } from '@/lib/utils';
import MicrosoftIdentityDrawer from '@/components/domain/integrations/microsoft/drawers/MicrosoftIdentityDrawer';
import { getSourceIdentitiesUniqueRolesAndGroups } from '@/services/identities';
import { useAsync } from '@/hooks/common/useAsync';
import { getRows } from '@/db/orm';

type TData = Tables<'source_identities_view'>;
type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
  parentLevel?: boolean;
};

export default function MicrosoftIdentitiesTable({
  sourceId,
  siteIds,
  siteLevel,
  parentLevel,
}: Props) {
  const {
    data: { licenses },
    refetch: fetchLicenses,
  } = useAsync({
    initial: { licenses: [] },
    fetcher: async () => {
      const licenses = await getSourceLicenses(sourceId, undefined, siteIds);
      if (!licenses.ok) throw licenses.error.message;

      return {
        licenses: licenses.data.rows,
      };
    },
    deps: [],
    immediate: false,
  });

  const {
    data: { roles, groups },
    refetch: fetchRolesAndGroups,
  } = useAsync({
    initial: { roles: [], groups: [] },
    fetcher: async () => {
      const rolesAndGroups = await getSourceIdentitiesUniqueRolesAndGroups(sourceId, siteIds);
      if (!rolesAndGroups.ok) throw rolesAndGroups.error.message;

      return {
        roles: rolesAndGroups.data.roles,
        groups: rolesAndGroups.data.groups,
      };
    },
    deps: [],
    immediate: false,
  });

  const fetcher = async ({ pageIndex, pageSize, initial, sorting, ...props }: DataTableFetcher) => {
    const timer = new Timer('Fetch identities', true);
    const identities = await getRows('source_identities_view', {
      filters: [
        ['source_id', 'eq', sourceId],
        ['site_id', 'in', siteIds],
      ],
      pagination: {
        page: pageIndex,
        size: pageSize,
        filterMap: {
          ca_capable: 'metadata->>valid_mfa_license',
        },
        sorting: Object.entries(sorting).length > 0 ? sorting : { site_name: 'asc' },
        ...props,
      },
    });

    if (!identities.ok) {
      return { rows: [], total: 0 };
    }

    timer.summary();

    if (initial) {
      fetchLicenses();
      fetchRolesAndGroups();
    }

    return identities.data;
  };

  const initialVisibility = {
    parent_name: !siteLevel && !parentLevel,
    site_name: !siteLevel,
  };

  const getEnforcement = (str: string) => {
    switch (str) {
      case 'security_defaults':
        return 'Security Defaults';
      case 'conditional_access':
        return 'Conditional Access';
      default:
        return 'None';
    }
  };

  return (
    <DataTable
      fetcher={fetcher}
      initialVisibility={initialVisibility}
      columns={
        [
          textColumn({
            key: 'site_name',
            label: 'Site',
            enableHiding: true,
            simpleSearch: true,
            cell: ({ row }) => (
              <Link
                href={`/sites/${row.original.site_id}/${sourceId}?tab=identities`}
                className="hover:text-primary"
                target="_blank"
              >
                {row.original.site_name}
              </Link>
            ),
          }),
          textColumn({
            key: 'parent_name',
            label: 'Parent',
            enableHiding: true,
            simpleSearch: true,
            cell: ({ row }) => (
              <Link
                href={`/sites/${row.original.parent_id}/${sourceId}?tab=identities`}
                className="hover:text-primary"
                target="_blank"
              >
                {row.original.parent_name}
              </Link>
            ),
          }),
          textColumn({
            key: 'name',
            label: 'Name',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => (
              <MicrosoftIdentityDrawer
                label={row.original.name!}
                identity={row.original}
                licenses={licenses}
              />
            ),
          }),
          textColumn({
            key: 'email',
            label: 'Email',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => (
              <MicrosoftIdentityDrawer
                label={row.original.email!}
                identity={row.original}
                licenses={licenses}
              />
            ),
          }),
          textColumn({
            key: 'type',
            label: 'Type',
            cell: ({ row }) => <div>{pascalCase(row.original.type || '')}</div>,
          }),
          booleanColumn({
            key: 'mfa_enforced',
            label: 'MFA Enforced',
          }),
          textColumn({
            key: 'enforcement_type',
            label: 'Enforcement',
            cell: ({ row }) => <div>{getEnforcement(row.getValue('enforcement_type'))}</div>,
          }),
          column({
            key: 'ca_capable',
            label: 'CA Capable',
            cell: ({ row }) => (
              <div>
                {(row.original.metadata as { valid_mfa_license: boolean }).valid_mfa_license
                  ? 'Yes'
                  : 'No'}
              </div>
            ),
          }),
          listColumn({
            key: 'mfa_methods',
            label: 'Methods',
          }),
          listColumn({
            key: 'license_skus',
            label: 'Licenses',
          }),
          listColumn({
            key: 'role_ids',
            label: 'Roles',
          }),
          listColumn({
            key: 'group_ids',
            label: 'Groups',
          }),
          dateColumn({
            key: 'last_activity',
            label: 'Last Activity',
          }),
          booleanColumn({
            key: 'enabled',
            label: 'Status',
            valid: 'Active',
            invalid: 'Blocked',
          }),
        ] as DataTableColumnDef<TData>[]
      }
      filters={{
        Tenant: {
          site_name: {
            label: 'Site',
            type: 'text',
            placeholder: 'Search site',
            operations: ['ilike'],
            simpleSearch: true,
          },
          parent_name: {
            label: 'Parent',
            type: 'text',
            placeholder: 'Search parent',
            operations: ['ilike'],
            simpleSearch: true,
          },
        },
        User: {
          name: {
            label: 'Name',
            type: 'text',
            placeholder: 'Search name',
            operations: ['ilike'],
            simpleSearch: true,
          },
          email: {
            label: 'Email',
            type: 'text',
            placeholder: 'Search email',
            operations: ['ilike'],
            simpleSearch: true,
          },
          type: {
            label: 'Type',
            type: 'select',
            placeholder: 'Select type',
            operations: ['eq'],
            options: [
              { label: 'Member', value: 'member' },
              { label: 'Guest', value: 'guest' },
            ],
          },
          enabled: {
            label: 'Status',
            type: 'boolean',
          },
          license_skus: {
            label: 'Licenses',
            type: 'multiselect',
            placeholder: 'Select licenses',
            operations: ['in'],
            options: licenses.map((lic) => {
              return { label: lic.name, value: lic.sku };
            }),
          },
          last_activity: {
            label: 'Last Activity',
            type: 'date',
            operations: ['gte', 'lte'],
          },
          role_ids: {
            label: 'Roles',
            type: 'multiselect',
            placeholder: 'Select roles',
            operations: ['in'],
            options: roles.map((role) => {
              return { label: role, value: role };
            }),
          },
          group_ids: {
            label: 'Groups',
            type: 'multiselect',
            placeholder: 'Select groups',
            operations: ['in'],
            options: groups.map((group) => {
              return { label: group, value: group };
            }),
          },
        },
        Security: {
          mfa_enforced: {
            label: 'MFA Enforced',
            type: 'boolean',
            placeholder: 'Search enforced',
            operations: ['eq'],
          },
          enforcement: {
            label: 'Enforcement',
            type: 'select',
            placeholder: 'Select enforcement',
            operations: ['eq'],
            options: [
              { label: 'Conditional Access', value: 'conditional_access' },
              { label: 'Security Defaults', value: 'security_defaults' },
              { label: 'None', value: 'none' },
            ],
          },
          mfa_method_count: {
            label: 'Methods',
            type: 'number',
            placeholder: 'Method count',
            operations: ['gte', 'lte'],
          },
          ca_capable: {
            label: 'CA Capable',
            type: 'boolean',
            placeholder: 'Search enforced',
            operations: ['eq'],
            serverKey: 'metadata->>valid_mfa_license',
          },
        },
      }}
    />
  );
}
