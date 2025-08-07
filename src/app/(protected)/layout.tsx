import AppNavbar from '@/components/layout/AppNavbar';
import AppSidebar from '@/components/layout/AppSidebar';
import Loader from '@/components/shared/Loader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getRow, getRows } from '@/db/orm';
import { createClient } from '@/db/server';
import { SourceProvider } from '@/lib/providers/SourceContext';
import { UserProvider } from '@/lib/providers/UserProvider';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const currentUser = await supabase.auth.getUser();
  const integrations = await getRows('source_integrations_view');
  const user = await getRow('user_view', {
    filters: [['id', 'eq', currentUser.data.user?.id]],
  });
  const options = await getRow('user_options', {
    filters: [['id', 'eq', currentUser.data.user?.id]],
  });
  const tenant = await getRow('tenants');

  if (!user.ok || !options.ok || !tenant.ok || !integrations.ok) {
    return <Loader />;
  }

  const integration = integrations.data.rows.find((int) => int.id === options.data.selected_source);

  return (
    <SidebarProvider>
      <UserProvider user={user.data} options={options.data} tenant={tenant.data}>
        <SourceProvider value={integration}>
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
