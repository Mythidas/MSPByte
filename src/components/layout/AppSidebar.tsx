'use client';

import {
  Box,
  Building,
  Building2,
  Cable,
  ChartArea,
  Logs,
  LucideProps,
  ScanText,
  Settings,
  ShieldUser,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { useSource } from '@/lib/providers/SourceContext';
import { SOURCE_TABS } from '@/config/sourceTabs';
import { useUser } from '@/lib/providers/UserContext';

type Item = {
  title: string;
  url: (sourceId: string) => string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  children?: Child[];
  modules?: string[];
  sourceOnly?: boolean;
};

type Child = Omit<Item, 'children'>;

const applicationItems: Item[] = [
  {
    title: 'Home',
    url: () => '/',
    icon: ChartArea,
  },
  {
    title: 'Source',
    url: (sourceId) => `/${sourceId}`,
    icon: Box,
    modules: ['Sources'],
    sourceOnly: true,
  },
  {
    title: 'Sites',
    url: () => '/sites',
    icon: Building,
    modules: ['Sites'],
  },
  { title: 'Groups', url: () => '/groups', icon: Building2, modules: ['Groups'] },
  {
    title: 'Actions',
    url: (sourceId) => `/actions/${sourceId}`,
    icon: ScanText,
    modules: ['Sources', 'Actions'],
    sourceOnly: true,
  },
  {
    title: 'Activity',
    url: () => '/activity',
    icon: Logs,
    modules: ['Activity'],
  },
];

const adminItems: Item[] = [
  {
    title: 'Integrations',
    url: () => '/integrations',
    icon: Cable,
    modules: ['Integrations'],
  },
  {
    title: 'Settings',
    url: () => '/settings',
    icon: Settings,
    modules: ['Settings'],
  },
  {
    title: 'Users',
    url: () => '/users',
    icon: ShieldUser,
    modules: ['Users'],
  },
];

export default function AppSidebar() {
  const pathname = usePathname(); // always safe
  const { source } = useSource();
  const { hasModule } = useUser();

  const renderItem = (item: Item) => {
    if (item.sourceOnly && !source) return null;

    const isSites = pathname.includes('/sites');
    const isIntegrations = pathname.includes('/integrations');
    const isUsers = pathname.includes('/users');
    const isActions = pathname.includes('/actions');
    const isActivity = pathname.includes('/activity');
    const isGroups = pathname.includes('/groups');
    const isSettings = pathname.includes('/settings');
    const isHome = pathname === '/';
    const isSource =
      !isSites &&
      !isIntegrations &&
      !isUsers &&
      !isActions &&
      !isSettings &&
      !isActivity &&
      !isGroups &&
      !isHome;

    const isActive =
      (item.title === 'Home' && isHome) ||
      (item.title === 'Users' && isUsers) ||
      (item.title === 'Integrations' && isIntegrations) ||
      (item.title === 'Sites' && isSites) ||
      (item.title === 'Actions' && isActions) ||
      (item.title === 'Activity' && isActivity) ||
      (item.title === 'Groups' && isGroups) ||
      (item.title === 'Settings' && isSettings) ||
      (item.title === 'Source' && isSource);
    const endRoute = item.url(source?.source_id || '');
    const tabs =
      isSource && item.title === 'Source' && source ? SOURCE_TABS[source.source_id!] : {};

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link href={`${endRoute}`}>
            <item.icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
        {Object.entries(tabs).length > 0 && (
          <SidebarMenuSub>
            {Object.entries(tabs).map(([key, value], index) => {
              const tabHref = `/${source?.source_id}${index === 0 ? '' : `/${key}`}`;
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
        {item.children && (
          <SidebarMenuSub>
            {item.children.map((child, index) => {
              const isActive = pathname.includes(child.url(source?.id || ''));

              return (
                <SidebarMenuSubItem key={index}>
                  <SidebarMenuSubButton asChild isActive={isActive}>
                    <Link href={child.url(source?.id || '')}>{child.title}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="w-48">
      <SidebarHeader>
        <span className="p-2">MSP Byte</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {applicationItems.map((item) => {
                if (item.modules && !item.modules.every((m) => hasModule(m))) return null;

                return renderItem(item);
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Backend</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => {
                if (item.modules && item.modules.every((m) => !hasModule(m))) return null;

                return renderItem(item);
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
