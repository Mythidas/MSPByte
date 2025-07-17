'use client';

import DataTable from '@/components/common/table/DataTable';
import { Tables } from '@/db/schema';
import {
  booleanColumn,
  column,
  dateColumn,
  listColumn,
  textColumn,
} from '@/components/common/table/DataTableColumn';
import { DataTableColumnDef, DataTableFetcher } from '@/types/data-table';
import Link from 'next/link';
import { getSourceLicenses } from '@/services/licenses';
import { pascalCase } from '@/lib/utils';
import MicrosoftIdentityDrawer from '@/components/domains/microsoft/drawers/MicrosoftIdentityDrawer';
import { getSourceIdentitiesView } from '@/services/identities';
import { useAsync } from '@/hooks/common/useAsync';

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
  const { data: licenses } = useAsync({
    initial: [],
    fetcher: async () => {
      const licenses = await getSourceLicenses(sourceId);
      if (!licenses.ok) throw licenses.error.message;

      return licenses.data.rows;
    },
    deps: [],
  });
  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const identities = await getSourceIdentitiesView(sourceId, siteIds, {
      page: pageIndex,
      size: pageSize,
      filterMap: {
        ca_capable: 'metadata->>valid_mfa_license',
      },
      ...props,
    });

    if (!identities.ok) {
      return { rows: [], total: 0 };
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
      height="max-h-[50vh]"
      columns={
        [
          textColumn({
            key: 'site_name',
            label: 'Site',
            enableHiding: true,
            simpleSearch: true,
            cell: ({ row }) => (
              <Link
                href={`/sites/${row.original.site_id}/microsoft-365?tab=identities`}
                className="hover:text-primary"
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
                href={`/sites/${row.original.parent_id}/microsoft-365?tab=identities`}
                className="hover:text-primary"
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
            operations: ['lk'],
            simpleSearch: true,
          },
          parent_name: {
            label: 'Parent',
            type: 'text',
            placeholder: 'Search parent',
            operations: ['lk'],
            simpleSearch: true,
          },
        },
        User: {
          name: {
            label: 'Name',
            type: 'text',
            placeholder: 'Search name',
            operations: ['lk'],
            simpleSearch: true,
          },
          email: {
            label: 'Email',
            type: 'text',
            placeholder: 'Search email',
            operations: ['lk'],
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
          license_skus: {
            label: 'Licenses',
            type: 'multiselect',
            placeholder: 'Select Licenses',
            operations: ['in'],
            options: licenses.map((lic) => {
              return { label: lic.name, value: lic.sku };
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
            operations: ['gt', 'lt'],
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
