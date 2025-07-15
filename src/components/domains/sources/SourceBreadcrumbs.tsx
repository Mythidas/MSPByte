'use client';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';

type Props = {
  slug: string;
  sourceName: string;
};

export function SourceBreadcrumb({ slug, sourceName }: Props) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const isSettingsPage = segments.includes('settings');

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbLink href="/integrations">Integrations</BreadcrumbLink>
        <BreadcrumbSeparator />
        {isSettingsPage && (
          <>
            <BreadcrumbLink href={`/integrations/${slug}`}>{sourceName}</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </>
        )}
        {!isSettingsPage && (
          <>
            <BreadcrumbPage>{sourceName}</BreadcrumbPage>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
