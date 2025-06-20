import SitesTable from '@/components/tables/SitesTable';
import { getUpperSites } from 'packages/services/sites';

export default async function ClientsPage() {
  const sites = await getUpperSites();

  const renderBody = async () => {
    if (!sites.ok) {
      return <span>Failed to fetch data</span>;
    } else {
      return <SitesTable sites={sites.data} />;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
      </div>

      {await renderBody()}
    </>
  );
}
