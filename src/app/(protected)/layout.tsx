'use server';

import AppNavbar from '@/components/common/navbar/AppNavbar';
import AppSidebar from '@/components/common/navbar/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { UserProvider } from '@/lib/providers/UserProvider';

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UserProvider>
        <div className="flex size-full">
          <div className="w-48">
            <AppSidebar />
          </div>
          <div className="flex flex-col size-full overflow-hidden">
            <AppNavbar />
            <div className="flex flex-col relative size-full space-y-6 p-6 overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </UserProvider>
    </SidebarProvider>
  );
}
