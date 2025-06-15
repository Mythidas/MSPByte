'use client';

import { Building2, Cable, ChartArea, FolderCog, MonitorDot, ShieldUser } from "lucide-react"
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
} from "@/components/ui/sidebar"
import { usePathname } from 'next/navigation';

const applicationItems = [
  {
    title: "Home",
    url: "/",
    icon: ChartArea,
  },
  {
    title: "Sites",
    url: "/sites",
    icon: Building2
  },
  {
    title: "Devices",
    url: "/devices",
    icon: MonitorDot
  },
]

const adminItems = [
  {
    title: "Integrations",
    url: "/integrations",
    icon: Cable
  },
  {
    title: "Users",
    url: "/users",
    icon: ShieldUser,
  },
]

export default function AppSidebar() {
  const pathname = usePathname(); // always safe

  return (
    <Sidebar className="w-48">
      <SidebarHeader>
        <span className="p-2">MSPByte</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {applicationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === '/' ? pathname === '/' : pathname.includes(item.url)}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Backend</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === '/' ? pathname === '/' : pathname.includes(item.url)}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
