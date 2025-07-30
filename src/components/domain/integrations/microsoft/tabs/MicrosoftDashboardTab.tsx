import MicrosoftTenantMetricsCard from '@/components/domain/integrations/microsoft/tabs/MicrosoftTenantMetricsCard';
import { SourceMetricCard } from '@/components/domain/metrics/SourceMetricCard';
import { Tables } from '@/db/schema';

type Props = {
  sourceId: string;
  site?: Tables<'sites'>;
  parent?: Tables<'sites'>;
  group?: Tables<'site_groups'>;
};

export default function MicrosoftDashboardTab({ ...props }: Props) {
  const { sourceId, site, parent, group } = props;
  const base = group
    ? `/groups/${group.id}`
    : parent
      ? `/sites/grouped/${parent.slug}`
      : site
        ? `/sites/${site.slug}`
        : '';
  const route = `${base}/${sourceId}`;

  return (
    <div className="grid gap-2">
      <MicrosoftTenantMetricsCard {...props} />
      <div className="grid grid-cols-3 gap-2">
        <SourceMetricCard
          route={`${route}/identities`}
          {...props}
          unit="identities"
          color="text-emerald-500"
        />
      </div>
    </div>
  );
}
