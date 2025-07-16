import AppNavbar from '@/components/common/navbar/AppNavbar';
import AppSidebar from '@/components/common/navbar/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SourceProvider } from '@/lib/providers/SourceContext';
import { UserProvider } from '@/lib/providers/UserProvider';

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UserProvider>
        <SourceProvider value={undefined}>
          <div className="flex size-full">
            <div className="w-48">
              <AppSidebar />
            </div>
            <AppNavbar>{children}</AppNavbar>
          </div>
        </SourceProvider>
      </UserProvider>
    </SidebarProvider>
  );
}
