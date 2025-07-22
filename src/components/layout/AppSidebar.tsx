'use client';

import { Building2, Cable, ChartArea, LucideProps, ShieldUser } from 'lucide-react';
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
  url: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  children?: Item[];
};

const applicationItems: Item[] = [
  {
    title: 'Home',
    url: '/',
    icon: ChartArea,
  },
  {
    title: 'Sites',
    url: '/sites',
    icon: Building2,
  },
];

const adminItems: Item[] = [
  {
    title: 'Integrations',
    url: '/integrations',
    icon: Cable,
  },
  {
    title: 'Users',
    url: '/users',
    icon: ShieldUser,
  },
];

export default function AppSidebar() {
  const pathname = usePathname(); // always safe
  const { source } = useSource();

  const renderItem = (item: Item, admin?: boolean) => {
    const isSites = pathname.includes('/sites');
    const isIntegrations = pathname.includes('/integrations');
    const isUsers = pathname.includes('/users');
    const isHome = !isSites && !isIntegrations && !isUsers;

    const isActive =
      (item.url === '/' && isHome) ||
      (item.url === '/users' && isUsers) ||
      (item.url === '/integrations' && isIntegrations) ||
      (item.url === '/sites' && isSites);
    const baseRoute = source && !admin && item.url !== '/sites' ? `/${source.source_id}` : '';
    const tabs = isHome && item.url === '/' && source ? SOURCE_TABS[source.source_id!] : {};

    if (Object.entries(tabs).length > 0) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive}>
            <Link href={`${baseRoute}${item.url}`}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
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
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link href={`${baseRoute}${item.url}`}>
            <item.icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
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
            <SidebarMenu>{adminItems.map((item) => renderItem(item, true))}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
