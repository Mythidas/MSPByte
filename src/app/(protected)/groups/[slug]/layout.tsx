'use server';

import React from 'react';
import GroupSidebar from '@/shared/components/layout/GroupSidebar';
import { getRow } from '@/db/orm';
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import GroupHeader from '@/features/groups/components/GroupHeader';
import ErrorDisplay from '@/shared/components/ErrorDisplay';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export default async function Layout({ children, ...props }: Props) {
  const params = await props.params;
  const group = await getRow('public', 'site_groups', {
    filters: [['id', 'eq', params.slug]],
  });

  if (group.error) {
    return <ErrorDisplay message="Failed to find group" />;
  }

  return (
    <GroupSidebar group={group.data}>
      <div className="flex w-full justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbLink href={'/groups'}>Groups</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{group.data.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <GroupHeader group={group.data} />
        </div>
      </div>
      {children}
    </GroupSidebar>
  );
}
