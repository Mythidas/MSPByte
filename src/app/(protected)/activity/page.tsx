'use client';

import DataTable, { DataTableRef } from '@/components/shared/table/DataTable';
import { Tables } from '@/db/schema';
import { dateColumn, textColumn } from '@/components/shared/table/DataTableColumn';
import { DataTableColumnDef, DataTableFetcher } from '@/types/data-table';
import Link from 'next/link';
import { prettyText } from '@/lib/utils';
import { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getRows } from '@/db/orm';
import ActivityFeedDrawer from '@/components/domain/activity/ActivityDrawer';
import { Button } from '@/components/ui/button';

type TData = Tables<'activity_feeds_view'>;

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'completed':
      return 'default';
    case 'failed':
    case 'error':
      return 'destructive';
    case 'pending':
    case 'in_progress':
      return 'secondary';
    case 'warning':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getTypeBadgeColor = (type: string) => {
  const colors: Record<string, string> = {
    auth: 'bg-blue-100 text-blue-800',
    sync: 'bg-green-100 text-green-800',
    integration: 'bg-purple-100 text-purple-800',
    user: 'bg-orange-100 text-orange-800',
    system: 'bg-gray-100 text-gray-800',
    security: 'text-red-500',
  };
  return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

export default function ActivityFeedTable() {
  const ref = useRef<DataTableRef>(null);

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const activities = await getRows('activity_feeds_view', {
      filters: [],
      pagination: {
        page: pageIndex,
        size: pageSize,
        ...props,
        sorting: Object.entries(props.sorting).length > 0 ? props.sorting : { created_at: 'desc' },
        filterMap: {
          status: 'status',
          type: 'type',
          action: 'action',
          trigger_source: 'trigger_source',
          is_admin: 'is_admin',
        },
      },
    });

    if (!activities.ok) {
      return { rows: [], total: 0 };
    }

    return activities.data;
  };

  return (
    <DataTable
      fetcher={fetcher}
      ref={ref}
      columns={
        [
          textColumn({
            key: 'type',
            label: 'Type',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => (
              <Badge
                className={cn('font-medium', getTypeBadgeColor(row.original.type!))}
                variant="secondary"
              >
                {prettyText(row.original.type!)}
              </Badge>
            ),
          }),
          textColumn({
            key: 'action',
            label: 'Action',
            enableHiding: true,
            simpleSearch: true,
            cell: ({ row }) => (
              <div className="font-medium">{prettyText(row.original.action!)}</div>
            ),
          }),
          textColumn({
            key: 'status',
            label: 'Status',
            enableHiding: false,
            cell: ({ row }) => (
              <Badge variant={getStatusBadgeVariant(row.original.status!)}>
                {prettyText(row.original.status!)}
              </Badge>
            ),
          }),
          textColumn({
            key: 'summary',
            label: 'Summary',
            enableHiding: true,
            cell: ({ row }) => (
              <ActivityFeedDrawer activity={row.original}>
                <Button className="p-0 hover:text-primary" variant="none">
                  {row.original.summary}
                </Button>
              </ActivityFeedDrawer>
            ),
          }),
          textColumn({
            key: 'trigger_source',
            label: 'Trigger',
            enableHiding: true,
            simpleSearch: true,
            cell: ({ row }) => (
              <div className="text-sm text-muted-foreground">
                {prettyText(row.original.trigger_source!)}
              </div>
            ),
          }),
          textColumn({
            key: 'site_name',
            label: 'Site',
            enableHiding: true,
            simpleSearch: true,
            cell: ({ row }) => {
              if (!row.original.site_name) return <span className="text-muted-foreground">-</span>;

              return (
                <Link
                  href={`/sites/${row.original.site_slug}`}
                  className="hover:text-primary text-sm"
                  target="_blank"
                >
                  {row.original.site_name}
                </Link>
              );
            },
          }),
          textColumn({
            key: 'user_email',
            label: 'User',
            enableHiding: true,
            simpleSearch: true,
            cell: ({ row }) => {
              if (!row.original.user_email)
                return <span className="text-muted-foreground">System</span>;

              return row.original.user_email;
            },
          }),
          dateColumn({
            key: 'created_at',
            label: 'Created',
          }),
          dateColumn({
            key: 'updated_at',
            label: 'Updated',
            enableHiding: true,
          }),
        ] as DataTableColumnDef<TData>[]
      }
      filters={{
        Activity: {
          type: {
            label: 'Type',
            type: 'select',
            placeholder: 'Select type',
            options: [
              { label: 'System', value: 'system' },
              { label: 'Security', value: 'security' },
            ],
          },
          action: {
            label: 'Action',
            type: 'text',
            placeholder: 'Search action',
            operations: ['ilike'],
            simpleSearch: true,
          },
          status: {
            label: 'Status',
            type: 'select',
            placeholder: 'Select status',
            options: [
              { label: 'Success', value: 'success' },
              { label: 'Failed', value: 'failed' },
              { label: 'Pending', value: 'pending' },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Warning', value: 'warning' },
              { label: 'Completed', value: 'completed' },
              { label: 'Error', value: 'error' },
            ],
          },
          trigger_source: {
            label: 'Trigger Source',
            type: 'select',
            placeholder: 'Select trigger',
            options: [
              { label: 'User', value: 'user' },
              { label: 'Scheduled', value: 'scheduled' },
              { label: 'System', value: 'system' },
            ],
          },
        },
      }}
    />
  );
}
