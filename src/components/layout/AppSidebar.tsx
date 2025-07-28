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

type Item = {
  title: string;
  url: (sourceId: string) => string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  children?: Child[];
};

type Child = {
  title: string;
  url: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  children?: Item[];
};

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
  },
  {
    title: 'Sites',
    url: () => '/sites',
    icon: Building,
  },
  { title: 'Groups', url: () => '/groups', icon: Building2 },
  {
    title: 'Actions',
    url: (sourceId) => `/actions/${sourceId}`,
    icon: ScanText,
  },
  {
    title: 'Activity',
    url: () => '/activity',
    icon: Logs,
  },
];

const adminItems: Item[] = [
  {
    title: 'Integrations',
    url: () => '/integrations',
    icon: Cable,
  },
  {
    title: 'Users',
    url: () => '/users',
    icon: ShieldUser,
  },
];

export default function AppSidebar() {
  const pathname = usePathname(); // always safe
  const { source } = useSource();

  const renderItem = (item: Item) => {
    const isSites = pathname.includes('/sites');
    const isIntegrations = pathname.includes('/integrations');
    const isUsers = pathname.includes('/users');
    const isActions = pathname.includes('/actions');
    const isActivity = pathname.includes('/activity');
    const isGroups = pathname.includes('/groups');
    const isHome = pathname === '/';
    const isSource =
      !isSites && !isIntegrations && !isUsers && !isActions && !isActivity && !isGroups && !isHome;

    const isActive =
      (item.title === 'Home' && isHome) ||
      (item.title === 'Users' && isUsers) ||
      (item.title === 'Integrations' && isIntegrations) ||
      (item.title === 'Sites' && isSites) ||
      (item.title === 'Actions' && isActions) ||
      (item.title === 'Activity' && isActivity) ||
      (item.title === 'Groups' && isGroups) ||
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
              const isActive = pathname.includes(child.url);

              return (
                <SidebarMenuSubItem key={index}>
                  <SidebarMenuSubButton asChild isActive={isActive}>
                    <Link href={child.url}>{child.title}</Link>
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
            <SidebarMenu>{applicationItems.map((item) => renderItem(item))}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Backend</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{adminItems.map((item) => renderItem(item))}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
