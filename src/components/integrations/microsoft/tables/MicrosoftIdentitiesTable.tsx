'use client';

import DataTable from '@/components/ux/table/DataTable';
import { Tables } from '@/db/schema';
import {
  booleanColumn,
  dateColumn,
  listColumn,
  textColumn,
} from '@/components/ux/table/DataTableColumn';
import { DataTableColumnDef } from '@/types/data-table';
import Link from 'next/link';
import { getSourceIdentitiesView } from '@/services/identities';
import { getSourceLicenses } from '@/services/licenses';
import { useAsync } from '@/hooks/useAsync';
import { pascalCase } from '@/lib/utils';

type TData = Tables<'source_identities_view'>;
type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
};

export default function MicrosoftIdentitiesTable({ sourceId, siteIds, siteLevel }: Props) {
  const { data, isLoading } = useAsync({
    initial: { identities: [], licenses: [] },
    fetcher: async () => {
      const identitiesRes = await getSourceIdentitiesView(sourceId, siteIds);
      if (!identitiesRes.ok) throw new Error('Failed to get identities');

      const allSkus = [...new Set(identitiesRes.data.flatMap((i) => i.license_skus!))];
      const licensesRes = await getSourceLicenses(sourceId, allSkus);
      if (!licensesRes.ok) throw new Error('Failed to get licenses');

      return {
        identities: identitiesRes.data,
        licenses: licensesRes.data,
      };
    },
    deps: [sourceId, siteIds],
  });

  const initialVisibility = {
    parent_name: !siteLevel,
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
      data={data?.identities || []}
      isLoading={isLoading}
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
          }),
          textColumn({
            key: 'email',
            label: 'Email',
            enableHiding: false,
            simpleSearch: true,
          }),
          textColumn({
            key: 'type',
            label: 'Type',
            cell: ({ row }) => <div>{pascalCase(row.original.type || '')}</div>,
            filter: {
              type: 'select',
              placeholder: 'Select Type',
              options: [
                { label: 'Member', value: 'member' },
                { label: 'Guest', value: 'guest' },
              ],
            },
          }),
          booleanColumn({
            key: 'mfa_enforced',
            label: 'MFA Enforced',
          }),
          textColumn({
            key: 'enforcement_type',
            label: 'Enforcement',
            cell: ({ row }) => <div>{getEnforcement(row.getValue('enforcement_type'))}</div>,
            filter: {
              type: 'select',
              placeholder: 'Select Enforcement',
              options: [
                { label: 'Conditional Access', value: 'conditional_access' },
                { label: 'Security Defaults', value: 'security_defaults' },
                { label: 'None', value: 'none' },
              ],
            },
          }),
          listColumn({
            key: 'mfa_methods',
            label: 'Methods',
          }),
          listColumn({
            key: 'license_skus',
            label: 'Licenses',
            filter: {
              type: 'multiselect',
              options: data?.licenses.map((lic) => {
                return { label: lic.name, value: lic.sku };
              }),
              placeholder: 'Select Licenses',
            },
            filterFn: (row, colId, value) => {
              return row.original.license_skus!.some((sku) => value.value.includes(sku));
            },
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
    />
  );
}
