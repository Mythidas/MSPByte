'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import HeaderAuth from '@/components/shared/HeaderAuth';
import ModeToggle from '@/components/shared/ModeToggle';
import SearchBox from '@/components/shared/SearchBox';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSource } from '@/lib/providers/SourceContext';
import { SitesProvider } from '@/lib/providers/SitesContext';
import { Tables } from '@/db/schema';
import { updateUserOptions } from '@/services/users';
import { useUser } from '@/lib/providers/UserContext';
import { useEffect } from 'react';

type Props = {
  sites: Tables<'sites'>[];
  integrations: Tables<'source_integrations_view'>[];
  children: React.ReactNode;
};

export default function AppNavbar({ sites, integrations, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { source, setSource } = useSource();
  const { user, isLoading, refresh } = useUser();

  useEffect(() => {
    if (source?.id !== user?.selected_source && !isLoading) {
      const newSource = integrations.find((i) => i.id === user?.selected_source);
      if (newSource) setSource(newSource);
    }
  }, [user, source]);

  const handleSelect = (value: string) => {
    router.push(`/sites/${value}${source && `/${source.source_id}`}`);
  };

  const handleSource = async (value: string) => {
    const newSource = integrations.find((int) => int.source_id === value);
    if (!newSource || value === source?.source_id) return;

    if (user) await updateUserOptions(user.id!, { selected_source: newSource.id });
    refresh();

    const segments = pathname.split('?')[0].split('/').filter(Boolean);
    const knownSlugs = integrations.map((s) => s.source_id);

    // Replace the first occurrence of a known source slug
    const updatedSegments: string[] = [];

    for (const segment of segments) {
      if (knownSlugs.includes(segment)) {
        updatedSegments.push(value);
        break;
      } else {
        updatedSegments.push(segment);
      }
    }

    const newPath = `/${updatedSegments.join('/')}`;
    router.replace(newPath);
  };

  return (
    <div className="flex flex-col size-full overflow-hidden">
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
                return { label: s.name, value: s.slug };
              })}
            />
            <div className="w-80">
              <SearchBox
                placeholder={source?.source_name || 'Select Source'}
                defaultValue={source?.source_id || undefined}
                lead={<span>Source</span>}
                onSelect={handleSource}
                delay={0}
                options={integrations.map((s) => ({
                  label: s.source_name!,
                  value: s.source_id!,
                }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <HeaderAuth />
          </div>
        </div>
      </header>
      <div
        className={cn(
          'flex flex-col relative size-full space-y-6 p-6 overflow-hidden',
          pathname.includes('/sites/') && 'p-0!'
        )}
      >
        <SitesProvider value={sites}>{children}</SitesProvider>
      </div>
    </div>
  );
}
