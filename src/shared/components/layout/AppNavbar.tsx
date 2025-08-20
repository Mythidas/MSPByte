'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import HeaderAuth from '@/shared/components/HeaderAuth';
import ModeToggle from '@/shared/components/ModeToggle';
import SearchBox from '@/shared/components/SearchBox';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { useSource } from '@/shared/lib/providers/SourceContext';
import { Tables } from '@/types/db';
import { useUser } from '@/shared/lib/providers/UserContext';
import { useAsync } from '@/shared/hooks/useAsync';
import { getRows, updateRow } from '@/db/orm';

type Props = {
  integrations: Tables<'public', 'integrations_view'>[];
  children: React.ReactNode;
};

export default function AppNavbar({ integrations, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { source, setSource } = useSource();
  const { user, hasAccess } = useUser();

  const {
    data: { sites },
    refetch,
    hasFetched,
  } = useAsync({
    initial: { sites: [] },
    fetcher: async () => {
      const sites = await getRows('public', 'sites');

      return {
        sites: !sites.error ? sites.data.rows : [],
      };
    },
    deps: [],
    immediate: false,
  });

  const handleMouseEnter = () => {
    if (!hasFetched) {
      refetch();
    }
  };

  const handleSelect = (value: string) => {
    router.push(`/sites/${value}`);
  };

  const handleSource = async (value: string) => {
    const newSource = integrations.find((int) => int.source_id === value);
    if (!newSource || value === source?.source_id) return;

    if (user)
      await updateRow('public', 'user_options', {
        id: user.id!,
        row: { selected_source: newSource.id },
      });
    setSource(newSource);

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

    if (newPath !== pathname) {
      router.replace(newPath);
    }
  };

  return (
    <div className="flex flex-col size-full overflow-hidden">
      <header className="flex h-14 z-50 w-full border-b border-border shadow">
        <div className="flex w-full h-14 px-4 items-center justify-between">
          <div className="flex items-center gap-2 w-1/2" onMouseEnter={handleMouseEnter}>
            <SidebarTrigger className="flex md:hidden" />
            {hasAccess('Sites.Read') && (
              <SearchBox
                placeholder="Search sites...."
                lead={<span>Sites</span>}
                onSelect={handleSelect}
                delay={0}
                options={sites.map((s) => {
                  return { label: s.name, value: s.slug };
                })}
              />
            )}
            {hasAccess('Sources.Read') && integrations.length && (
              <div className="w-80">
                <SearchBox
                  placeholder={source?.source_name || 'Select Source'}
                  defaultValue={source?.source_id || ''}
                  lead={<span>Source</span>}
                  onSelect={handleSource}
                  delay={0}
                  options={[
                    ...integrations.map((s) => ({
                      label: s.source_name!,
                      value: s.source_id!,
                    })),
                  ]}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <HeaderAuth />
          </div>
        </div>
      </header>
      <div
        className={cn(
          'flex flex-col relative size-full space-y-6 p-6',
          (pathname.includes('/sites/') || pathname.includes('/groups/')) && 'p-0!'
        )}
      >
        {children}
      </div>
    </div>
  );
}
