'use server';

import { getSite } from 'packages/services/sites';
import ErrorDisplay from '@/components/shared/ErrorDisplay';
import SitesSidebar from '@/components/layout/SitesSidebar';
import SiteHeader from '@/components/source/sites/SiteHeader';
import SiteProvider from '@/lib/providers/SiteProvider';
import React from 'react';
import SiteBreadcrumbs from '@/components/source/sites/SiteBreadcrumbs';

type Props = {
  params: Promise<{ id: string; slug: string }>;
  children: React.ReactNode;
};

export default async function Layout({ children, ...props }: Props) {
  const params = await props.params;
  const site = await getSite(params.id);

  if (!site.ok) {
    return <ErrorDisplay message="Failed to find site" />;
  }

  return (
    <SitesSidebar site={site.data}>
      <SiteBreadcrumbs site={site.data} />
      <SiteHeader site={site.data} />
      <SiteProvider site={site.data}>{children}</SiteProvider>
    </SitesSidebar>
  );
}
