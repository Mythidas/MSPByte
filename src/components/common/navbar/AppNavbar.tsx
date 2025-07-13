'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import HeaderAuth from '@/components/common/navbar/HeaderAuth';
import ModeToggle from '@/components/common/navbar/ModeToggle';
import SearchBox from '@/components/common/SearchBox';
import { getSites } from '@/services/sites';
import { useRouter } from 'next/navigation';
import { useAsync } from '@/hooks/common/useAsync';

export default function AppNavbar() {
  const router = useRouter();

  const {
    data: { sites },
  } = useAsync({
    initial: { sites: [] },
    fetcher: async () => {
      const sites = await getSites();
      if (!sites.ok) throw sites.error.message;

      return {
        sites: sites.data.rows,
      };
    },
    deps: [],
  });

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
            delay={0}
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
