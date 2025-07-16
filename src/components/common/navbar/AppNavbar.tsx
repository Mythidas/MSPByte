'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import HeaderAuth from '@/components/common/navbar/HeaderAuth';
import ModeToggle from '@/components/common/navbar/ModeToggle';
import SearchBox from '@/components/common/SearchBox';
import { getSites } from '@/services/sites';
import { usePathname, useRouter } from 'next/navigation';
import { useAsync } from '@/hooks/common/useAsync';
import { getSources } from '@/services/sources';
import { cn } from '@/lib/utils';
import { getSourceIntegrationView } from '@/services/integrations';
import { useSource } from '@/lib/providers/SourceContext';

type Props = {
  children: React.ReactNode;
};

export default function AppNavbar({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { source, setSource } = useSource();

  const {
    data: { sites, sources },
  } = useAsync({
    initial: { sites: [], sources: [] },
    fetcher: async () => {
      const sites = await getSites();
      if (!sites.ok) throw sites.error.message;

      const sources = await getSources();
      if (!sources.ok) throw sources.error.message;

      return {
        sites: sites.data.rows,
        sources: sources.data.rows,
      };
    },
    deps: [],
  });

  const handleSelect = (value: string) => {
    router.push(`${source && `/${source.source_id}`}/sites/${value}`);
  };

  const handleSource = async (value: string) => {
    const newSource = await getSourceIntegrationView(value);
    if (!newSource.ok) return;
    if (newSource.data.id === source?.id) return;

    setSource(newSource.data);

    const segments = pathname.split('?')[0].split('/').filter(Boolean); // remove empty strings

    const knownSlugs = sources.map((s) => s.id);
    const currentSlug = segments[0];

    if (knownSlugs.includes(currentSlug)) {
      const newPath = `/${[newSource.data.source_id, ...segments.slice(1)].join('/')}`;
      router.replace(newPath);
    }
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
                return { label: s.name, value: s.id };
              })}
            />
            {sources.length > 0 && (
              <div className="w-80">
                <SearchBox
                  placeholder={source?.source_name || 'Select Source'}
                  defaultValue={source?.id || undefined}
                  lead={<span>Source</span>}
                  onSelect={handleSource}
                  delay={0}
                  options={sources.map((s) => ({
                    label: s.name,
                    value: s.id,
                  }))}
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
          'flex flex-col relative size-full space-y-6 p-6 overflow-hidden',
          pathname.includes('/sites/') && 'p-0!'
        )}
      >
        {children}
      </div>
    </div>
  );
}
