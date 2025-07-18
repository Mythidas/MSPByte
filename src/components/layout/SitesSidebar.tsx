'use client';

import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Tables } from '@/db/schema';
import { useSource } from '@/lib/providers/SourceContext';
import { cn } from '@/lib/utils';
import { BarChart3, Building2, Puzzle, Settings, LucideProps, Logs } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

type NavItem = {
  label: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  href: string;
  children?: NavItem[];
  parentOnly?: boolean;
  siteOnly?: boolean;
};

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: BarChart3,
    href: ``,
  },
  {
    label: 'Sites',
    icon: Building2,
    href: `/children`,
    parentOnly: true,
  },
  {
    label: 'Grouped',
    icon: Puzzle,
    href: `/grouped`,
    parentOnly: true,
  },
  {
    label: 'Activity',
    icon: Logs,
    href: `/activity`,
  },
  {
    label: 'Settings',
    icon: Settings,
    href: `/settings`,
  },
];

type Props = {
  site: Tables<'sites'>;
  children: React.ReactNode;
};

export default function SitesSidebar({ site, children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sub = searchParams.get('sub');
  const segments = pathname.split('/').filter(Boolean);
  const { source } = useSource();

  const isOnSettings = segments.includes('settings');
  const isGroupedPage = segments.includes('grouped');
  const isOnChildren = segments.includes('children');
  const isOnActivity = segments.includes('activity');
  const isDashboard = !isOnSettings && !isGroupedPage && !isOnChildren && !isOnActivity;

  return (
    <div className="flex size-full">
      <div className="w-48 flex h-full">
        <Sidebar className="relative! w-48">
          <SidebarContent className="w-48 bg-background p-2">
            <SidebarMenu>
              {navItems.map((item) => {
                if (item.parentOnly && !site.is_parent) return null;
                if (item.siteOnly && site.is_parent) return null;

                const baseHref =
                  source && (item.href === '' || item.href === '/grouped')
                    ? `/sites/${site.slug}/${source.source_id}`
                    : `/sites/${site.slug}`;

                const isActive =
                  (item.href === '' && isDashboard) ||
                  (item.href === '/settings' && isOnSettings) ||
                  (item.href === '/grouped' && isGroupedPage) ||
                  (item.href === '/children' && isOnChildren) ||
                  (item.href === '/activity' && isOnActivity);

                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={`${baseHref}${item.href}`}
                        className={cn(isActive && 'bg-primary text-primary-foreground')}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </SidebarMenuButton>

                    {item.children &&
                      isActive &&
                      site.is_parent &&
                      item.children.map((child) => {
                        const subIsActive =
                          (sub && child.href.includes(sub)) ||
                          (!sub && item.children && child.href === item.children[0].href);

                        return (
                          <SidebarMenuSub key={child.href}>
                            <SidebarMenuSubItem>
                              <SidebarMenuButton asChild>
                                <Link
                                  href={`${baseHref}${child.href}`}
                                  className={cn(
                                    'text-xs transition-colors',
                                    subIsActive
                                      ? 'text-primary font-medium'
                                      : 'text-muted-foreground hover:text-foreground'
                                  )}
                                >
                                  <child.icon className="h-3 w-3" />
                                  {child.label}
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        );
                      })}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </div>
      <Separator orientation="vertical" />

      <div className="flex flex-col relative size-full space-y-6 p-6 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
