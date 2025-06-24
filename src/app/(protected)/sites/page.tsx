'use client';

import SitesTable from '@/components/tables/SitesTable';
import { Tables } from '@/db/schema';
import { getUpperSites } from 'packages/services/sites';
import { useEffect, useState } from 'react';

export default function Page() {
  const [sites, setSites] = useState<Tables<'sites'>[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const sites = await getUpperSites();
      if (sites.ok) {
        setSites(sites.data);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
      </div>
      <SitesTable sites={sites} />
    </>
  );
}
