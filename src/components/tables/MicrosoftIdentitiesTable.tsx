'use client';

import DataTable from '@/components/ux/DataTable';
import { Tables } from '@/db/schema';
import {
  booleanColumn,
  dateColumn,
  listColumn,
  textColumn,
} from '@/lib/helpers/data-table/columns';
import { DataTableColumnDef } from '@/types/data-table';
import Link from 'next/link';

type TData = Tables<'source_identities_view'>;
type Props = {
  identities: TData[];
  licenses: Tables<'source_license_info'>[];
  siteLevel?: boolean;
};

export default function MicrosoftIdentitiesTable({ identities, licenses, siteLevel }: Props) {
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
      data={identities}
      initialVisibility={siteLevel ? { parent_name: false, site_name: false } : {}}
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
              options: licenses.map((lic) => {
                return { label: lic.name, value: lic.sku };
              }),
              placeholder: 'Select Licenses',
            },
            filterFn: (row, colId, value) => {
              return row.original.license_skus!.some((sku) => value.includes(sku));
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
