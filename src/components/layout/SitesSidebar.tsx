'use client';

import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { SOURCE_TABS } from '@/config/sourceTabs';
import { Tables } from '@/db/schema';
import { useSource } from '@/lib/providers/SourceContext';
import { cn } from '@/lib/utils';
import { BarChart3, Building2, Puzzle, Settings, LucideProps, Logs, Box } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

type NavItem = {
  label: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  href: (sourceId: string) => string;
  children?: NavItem[];
  parentOnly?: boolean;
  siteOnly?: boolean;
  sourceOnly?: boolean;
};

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: BarChart3,
    href: () => '/',
  },
  {
    label: 'Source',
    icon: Box,
    href: (sourceId) => `/${sourceId}`,
    sourceOnly: true,
  },
  {
    label: 'Sites',
    icon: Building2,
    href: () => '/children',
    parentOnly: true,
  },
  {
    label: 'Grouped',
    icon: Puzzle,
    href: (sourceId) => `/${sourceId}/grouped`,
    parentOnly: true,
    sourceOnly: true,
  },
  {
    label: 'Activity',
    icon: Logs,
    href: () => '/activity',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: () => '/settings',
  },
];

type Props = {
  site: Tables<'sites'>;
  children: React.ReactNode;
};

export default function SitesSidebar({ site, children }: Props) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const { source } = useSource();

  const isOnSettings = segments.includes('settings');
  const isGroupedPage = segments.includes('grouped');
  const isOnChildren = segments.includes('children');
  const isOnActivity = segments.includes('activity');
  const isDashboard = pathname === `/sites/${site.slug}`;
  const isSource =
    !isOnSettings && !isGroupedPage && !isOnChildren && !isOnActivity && !isDashboard;

  return (
    <div className="flex size-full">
      <div className="flex flex-col w-40 h-full">
        <Sidebar className="relative w-40 h-fit">
          <SidebarContent className="w-40 bg-background p-2">
            <SidebarMenu>
              {navItems.map((item) => {
                if (item.sourceOnly && !source) return null;
                if (item.parentOnly && !site.is_parent) return null;
                if (item.siteOnly && site.is_parent) return null;

                const baseHref = `/sites/${site.slug}${item.href(source?.source_id || '')}`;

                const isActive =
                  (item.label === 'Dashboard' && isDashboard) ||
                  (item.label === 'Settings' && isOnSettings) ||
                  (item.label === 'Grouped' && isGroupedPage) ||
                  (item.label === 'Children' && isOnChildren) ||
                  (item.label === 'Activity' && isOnActivity) ||
                  (item.label === 'Source' && isSource);
                const Icon = item.icon;
                const tabs =
                  (isSource || isGroupedPage) && isActive && source
                    ? SOURCE_TABS[source.source_id!]
                    : {};

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={baseHref}
                        className={cn(isActive && 'bg-primary text-primary-foreground')}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                    {Object.entries(tabs).length > 0 && (
                      <SidebarMenuSub>
                        {Object.entries(tabs).map(([key, value], index) => {
                          const tabHref = `/sites/${site.slug}/${source?.source_id}${isGroupedPage ? '/grouped' : ''}${index === 0 ? '' : `/${key}`}`;
                          const isActive = pathname === tabHref;

                          return (
                            <SidebarMenuSubItem key={key}>
                              <SidebarMenuSubButton asChild isActive={isActive}>
                                <Link href={tabHref}>{value.label}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </div>
      <Separator orientation="vertical" />

      <div className="flex flex-col relative size-full gap-4 p-6 overflow-hidden">{children}</div>
    </div>
  );
}
