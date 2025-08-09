'use server';

import ErrorDisplay from '@/components/shared/ErrorDisplay';
import React from 'react';
import GroupSidebar from '@/components/layout/GroupSidebar';
import { getRow } from '@/db/orm';
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import GroupHeader from '@/components/domain/groups/GroupHeader';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export default async function Layout({ children, ...props }: Props) {
  const params = await props.params;
  const group = await getRow('public', 'site_groups', {
    filters: [['id', 'eq', params.slug]],
  });

  if (!group.ok) {
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
