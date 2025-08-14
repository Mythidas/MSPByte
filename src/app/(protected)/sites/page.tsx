'use client';

import SitesTable from '@/features/sites/components/SitesTable';

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
      </div>
      <SitesTable />
    </>
  );
}
