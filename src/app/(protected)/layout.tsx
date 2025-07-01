'use client';

import AppNavbar from '@/components/common/navbar/AppNavbar';
import AppSidebar from '@/components/common/navbar/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { UserProvider } from '@/lib/providers/UserProvider';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <UserProvider>
        <div className="flex size-full">
          <div className="w-48">
            <AppSidebar />
          </div>
          <div className="flex flex-col size-full overflow-hidden">
            <AppNavbar />
            <div
              className={cn(
                'flex flex-col relative size-full space-y-6 p-6 overflow-hidden',
                pathname.includes('/sites/') && 'p-0!'
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </UserProvider>
    </SidebarProvider>
  );
}
