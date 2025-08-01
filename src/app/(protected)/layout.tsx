import AppNavbar from '@/components/layout/AppNavbar';
import AppSidebar from '@/components/layout/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SourceProvider } from '@/lib/providers/SourceContext';
import { UserProvider } from '@/lib/providers/UserProvider';
import { getSourceIntegrationsView } from '@/services/integrations';
import { getCurrentUserView } from '@/services/users';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const integrations = await getSourceIntegrationsView();
  const current_user = await getCurrentUserView();

  return (
    <SidebarProvider>
      <UserProvider>
        <SourceProvider
          value={
            integrations.ok && current_user.ok
              ? integrations.data.rows.find(
                  (int) => int.source_id === current_user.data.selected_source
                )
              : undefined
          }
          integrations={integrations.ok ? integrations.data.rows : undefined}
        >
          <div className="flex size-full">
            <div className="w-48">
              <AppSidebar />
            </div>
            <AppNavbar integrations={integrations.ok ? integrations.data.rows : []}>
              {children}
            </AppNavbar>
          </div>
        </SourceProvider>
      </UserProvider>
    </SidebarProvider>
  );
}
