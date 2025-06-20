'use client';

import { ColumnDef } from '@tanstack/react-table';
import DataTable, { DataTableHeader } from '@/components/ux/DataTable';
import { Tables } from '@/db/schema';

type Props = {
  identities: Tables<'source_identities'>[];
  licenses: Tables<'source_licenses'>[];
  defaultSearch?: string;
};

export default function MicrosoftIdentitiesTable({ identities, licenses, defaultSearch }: Props) {
  const getEnforcement = (str: string) => {
    switch (str) {
      case 'security_defaults':
        return 'Security Defaults';
      case 'conditional_access':
        return 'Conditional Access';
    }
  };

  return (
    <DataTable
      columns={
        [
          {
            accessorKey: 'name',
            header: ({ column }) => <DataTableHeader column={column} label="Name" />,
            enableHiding: false,
            simpleSearch: true,
          },
          {
            accessorKey: 'email',
            header: ({ column }) => <DataTableHeader column={column} label="Email" />,
            enableHiding: false,
            simpleSearch: true,
          },
          {
            accessorKey: 'mfa_enforced',
            header: ({ column }) => <DataTableHeader column={column} label="MFA Enforced" />,
            cell: ({ row }) => <div>{row.getValue('mfa_enforced') ? 'True' : 'False'}</div>,
            meta: {
              label: 'MFA Enforced',
            },
          },
          {
            accessorKey: 'enforcement_type',
            header: ({ column }) => <DataTableHeader column={column} label="Enforcement" />,
            cell: ({ row }) => <div>{getEnforcement(row.getValue('enforcement_type'))}</div>,
            meta: {
              label: 'Enforcement',
            },
          },
          {
            accessorKey: 'mfa_methods',
            header: ({ column }) => <DataTableHeader column={column} label="Methods" />,
            cell: ({ row }) => {
              return <div>{(row.getValue('mfa_methods')! as any).length}</div>;
            },
            meta: {
              label: 'Methods',
            },
          },
          {
            accessorKey: 'license_skus',
            header: ({ column }) => <DataTableHeader column={column} label="Licenses" />,
            cell: ({ row }) => {
              return <div>{(row.getValue('license_skus')! as any).length}</div>;
            },
            sortingFn: (rowA, rowB) => {
              return rowB.original.license_skus.length - rowA.original.license_skus.length;
            },
            meta: {
              label: 'Licenses',
            },
          },
          {
            accessorKey: 'last_activity',
            header: ({ column }) => <DataTableHeader column={column} label="Last Activity" />,
            cell: ({ row }) => {
              return <div>{new Date(row.getValue('last_activity') || '').toLocaleString()}</div>;
            },
            meta: {
              label: 'Last Activity',
            },
          },
        ] as ColumnDef<Tables<'source_identities'>>[]
      }
      data={identities}
      initialVisibility={{}}
    />
  );
}
