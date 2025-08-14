import AppNavbar from '@/shared/components/layout/AppNavbar';
import AppSidebar from '@/shared/components/layout/AppSidebar';
import Loader from '@/shared/components/Loader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getRow, getRows } from '@/db/orm';
import { createClient } from '@/db/server';
import { SourceProvider } from '@/shared/lib/providers/SourceContext';
import { UserProvider } from '@/shared/lib/providers/UserProvider';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const currentUser = await supabase.auth.getUser();
  const integrations = await getRows('public', 'integrations_view');
  const user = await getRow('public', 'user_view', {
    filters: [['id', 'eq', currentUser.data.user?.id]],
  });
  const options = await getRow('public', 'user_options', {
    filters: [['id', 'eq', currentUser.data.user?.id]],
  });
  const tenant = await getRow('public', 'tenants');

  if (user.error || options.error || tenant.error || integrations.error) {
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
            <AppNavbar integrations={!integrations.error ? integrations.data.rows : []}>
              {children}
            </AppNavbar>
          </div>
        </SourceProvider>
      </UserProvider>
    </SidebarProvider>
  );
}
