'use client';

import { Building2, Cable, ChartArea, Database, LucideProps, ShieldUser } from 'lucide-react';
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
  {
    title: 'Sources',
    url: '/sources',
    icon: Database,
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

  const renderItem = (item: Item) => {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={item.url === '/' ? pathname === '/' : pathname.includes(item.url)}
        >
          <Link href={item.url}>
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
        <span className="p-2">MSPByte</span>
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
