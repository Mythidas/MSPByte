'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import HeaderAuth from '@/components/ux/HeaderAuth';
import ModeToggle from '@/components/ux/ModeToggle';
import SearchBox from '@/components/ux/SearchBox';
import { Tables } from '@/db/schema';
import { getSites } from '@/services/sites';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppNavbar() {
  const [sites, setSites] = useState<Tables<'sites'>[]>([]);
  const router = useRouter();

  useEffect(() => {
    getSites().then((res) => {
      if (res.ok) {
        setSites(res.data);
      }
    });
  }, []);

  const handleSelect = (value: string) => {
    router.push(`/sites/${value}`);
  };

  return (
    <header className="flex h-14 z-50 w-full border-b border-border shadow">
      <div className="flex w-full h-14 px-4 items-center justify-between">
        <div className="flex items-center gap-2 w-1/2">
          <SidebarTrigger className="flex md:hidden" />
          <SearchBox
            placeholder="Search sites...."
            lead={<span>Sites</span>}
            onSelect={handleSelect}
            options={sites.map((s) => {
              return { label: s.name, value: s.id };
            })}
          />
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
