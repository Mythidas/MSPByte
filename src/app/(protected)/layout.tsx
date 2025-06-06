'use server'

import AppNavbar from "@/components/ux/AppNavbar";
import AppSidebar from "@/components/ux/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserProvider } from "@/lib/providers/UserProvider";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex size-full">
        <AppSidebar />
        <div className="flex flex-col size-full">
          <AppNavbar />
          <UserProvider>
            <div className="flex size-full flex-col p-6 overflow-x-hidden overflow-y-auto">
              {children}
            </div>
          </UserProvider>
        </div>
      </div>
    </SidebarProvider>
  );
}