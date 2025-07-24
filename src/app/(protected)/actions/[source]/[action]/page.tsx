'use client';

import { useParams } from 'next/navigation';
import { SOURCE_ACTIONS } from '@/config/sourceActions';
import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function Page() {
  const { source, action } = useParams();
  const actionInfo = SOURCE_ACTIONS[source as string];

  if (!actionInfo[action as string])
    return <strong>No {action} tab defined for this source.</strong>;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbLink href={`/actions/${source}`}>Actions</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{actionInfo[action as string].label}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      {actionInfo[action as string].content(source as string)}
    </div>
  );
}
