import AppNavbar from '@/components/common/navbar/AppNavbar';
import AppSidebar from '@/components/common/navbar/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SourceProvider } from '@/lib/providers/SourceContext';
import { UserProvider } from '@/lib/providers/UserProvider';
import { getSourceIntegrationsView } from '@/services/integrations';
import { getSites } from '@/services/sites';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const sites = await getSites();
  const integrations = await getSourceIntegrationsView();

  return (
    <SidebarProvider>
      <UserProvider>
        <SourceProvider value={undefined}>
          <div className="flex size-full">
            <div className="w-48">
              <AppSidebar />
            </div>
            <AppNavbar
              sites={sites.ok ? sites.data.rows : []}
              integrations={integrations.ok ? integrations.data.rows : []}
            >
              {children}
            </AppNavbar>
          </div>
        </SourceProvider>
      </UserProvider>
    </SidebarProvider>
  );
}
