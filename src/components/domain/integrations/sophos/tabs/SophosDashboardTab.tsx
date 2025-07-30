import { Tables } from '@/db/schema';
import { SourceMetricCard } from '@/components/domain/metrics/SourceMetricCard';

type Props = {
  sourceId: string;
  site?: Tables<'sites'>;
  parent?: Tables<'sites'>;
  group?: Tables<'site_groups'>;
};

export default function SophosDashboardTab({ ...props }: Props) {
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
    <div className="grid grid-cols-3 gap-2">
      <SourceMetricCard
        route={`${route}/devices`}
        {...props}
        unit="devices"
        color="text-amber-500"
      />
    </div>
  );
}
