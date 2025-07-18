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
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { useSource } from '@/lib/providers/SourceContext';

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
    const isActive =
      item.url === '/'
        ? pathname === '/' || pathname.split('?')[0] === `/${source?.source_id}`
        : pathname.includes(item.url);
    const baseRoute = source && !admin && item.url !== '/sites' ? `/${source.source_id}` : '';

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
