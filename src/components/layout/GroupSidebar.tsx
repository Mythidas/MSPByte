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
import { BarChart3, Building2, Settings, LucideProps, Logs } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  group: Tables<'site_groups'>;
  children: React.ReactNode;
};

export default function GroupSidebar({ group, children }: Props) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const { source } = useSource();

  const isOnSettings = segments.includes('settings');
  const isOnChildren = segments.includes('children');
  const isOnActivity = segments.includes('activity');
  const isDashboard = !isOnSettings && !isOnChildren && !isOnActivity;

  return (
    <div className="flex size-full">
      <div className="w-48 flex h-full">
        <Sidebar className="relative! w-48">
          <SidebarContent className="w-48 bg-background p-2">
            <SidebarMenu>
              {navItems.map((item) => {
                const baseHref =
                  source && item.href === ''
                    ? `/groups/${group.id}/${source.source_id}`
                    : `/groups/${group.id}`;

                const isActive =
                  (item.href === '' && isDashboard) ||
                  (item.href === '/settings' && isOnSettings) ||
                  (item.href === '/children' && isOnChildren) ||
                  (item.href === '/activity' && isOnActivity);
                const Icon = item.icon;
                const tabs =
                  isDashboard && isActive && source ? SOURCE_TABS[source.source_id!] : {};

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
                    {Object.entries(tabs).length > 0 && (
                      <SidebarMenuSub>
                        {Object.entries(tabs).map(([key, value], index) => {
                          const tabHref = `/groups/${group.id}/${source?.source_id}${index === 0 ? '' : `/${key}`}`;
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

      <div className="flex flex-col relative size-full space-y-6 p-6 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
