'use server'

import AppNavbar from "@/components/ux/AppNavbar";
import AppSidebar from "@/components/ux/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserProvider } from "@/lib/providers/UserProvider";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex size-full">
        <div className="w-48">
          <AppSidebar />
        </div>
        <div className="flex flex-col size-full">
          <AppNavbar />
          <UserProvider>
            <div className="flex flex-col relateive size-full space-y-6 p-6">
              {children}
            </div>
          </UserProvider>
        </div>
      </div>
    </SidebarProvider>
  );
}