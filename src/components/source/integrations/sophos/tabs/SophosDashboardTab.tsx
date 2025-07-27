import Loader from '@/components/shared/Loader';
import { Tables } from '@/db/schema';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import SourceMetricsGrid from '@/components/source/sources/SourceMetricsGrid';
import { getSites } from '@/services/sites';
import { getSourceTenant, getSourceTenants } from '@/services/source/tenants';
import { getRows } from '@/db/orm';

type Props = {
  sourceId: string;
  site?: Tables<'sites'>;
  parent?: Tables<'sites'>;
  group?: Tables<'site_groups'>;
};

export default function SophosDashboardTab({ sourceId, site, parent, group }: Props) {
  const { content } = useLazyLoad({
    fetcher: async () => {
      if (group) {
        const memberships = await getRows('site_group_memberships', {
          filters: [['group_id', 'eq', group.id]],
        });
        if (!memberships.ok) {
          return { rows: [], total: 0 };
        }

        const tenants = await getRows('source_tenants', {
          filters: [
            ['site_id', 'in', memberships.data.rows.map((m) => m.site_id)],
            ['source_id', 'eq', sourceId],
          ],
        });
        if (!tenants.ok) {
          return { rows: [], total: 0 };
        }

        return tenants.data;
      }

      if (site) {
        const tenant = await getSourceTenant(sourceId, site.id);
        if (tenant.ok) {
          return { rows: [tenant.data], total: 1 };
        }

        return undefined;
      }

      const sites = await getSites(parent?.id);
      if (!sites.ok) return undefined;

      const siteIds = parent
        ? [parent.id, ...sites.data.rows.map((s) => s.id)]
        : [...sites.data.rows.map((s) => s.id)];
      const tenant = await getSourceTenants(sourceId, siteIds);
      if (tenant.ok) {
        return tenant.data;
      }
    },
    render: (data) => {
      if (!data) return <strong>No Tenant(s) found</strong>;
      const route =
        site || parent
          ? `/sites/${parent?.slug ?? site?.slug}/${sourceId}`
          : group
            ? `/groups/${group.id}/${sourceId}`
            : `/${sourceId}`;

      return (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Quick Metrics</h2>
          </div>

          <SourceMetricsGrid
            scope={site ? 'site' : parent ? 'parent' : group ? 'group' : 'global'}
            sourceId={sourceId}
            siteId={parent?.id || site?.id}
            groupId={group?.id}
            route={route}
          />
        </div>
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
}
