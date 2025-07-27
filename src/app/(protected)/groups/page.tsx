'use client';

import SiteGroupsTable from '@/components/source/groups/SiteGroupsTable';

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
      </div>
      <SiteGroupsTable />
    </>
  );
}
