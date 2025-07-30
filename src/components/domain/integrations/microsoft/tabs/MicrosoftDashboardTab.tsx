import { SourceMetricCard } from '@/components/domain/metrics/SourceMetricCard';
import Display from '@/components/shared/Display';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getRow, getRows } from '@/db/orm';
import { Tables } from '@/db/schema';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { MicrosoftTenantMetadata } from '@/types/source/tenants';
import { Group, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

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
      <div className="grid grid-cols-3 gap-2">
        <SourceMetricCard route={`${route}/identities`} {...props} unit="identities" />
      </div>
      <SourceTenantCards {...props} />
    </div>
  );
}

function SourceTenantCards({ sourceId, group, parent, site }: Props) {
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
        const tenant = await getRow('source_tenants', {
          filters: [
            ['source_id', 'eq', sourceId],
            ['site_id', 'eq', site.id],
          ],
        });
        if (tenant.ok) {
          return { rows: [tenant.data], total: 1 };
        }

        return undefined;
      }

      const sites = await getRows('sites', {
        filters: [parent ? ['parent_id', 'eq', parent.id] : undefined],
      });
      if (!sites.ok) return undefined;

      const siteIds = parent
        ? [parent.id, ...sites.data.rows.map((s) => s.id)]
        : [...sites.data.rows.map((s) => s.id)];
      const tenant = await getRows('source_tenants', {
        filters: [
          ['source_id', 'eq', sourceId],
          ['site_id', 'in', siteIds],
        ],
      });
      if (tenant.ok) {
        return tenant.data;
      }
    },
    render: (data) => {
      if (!data) return null;

      const base = group
        ? `/groups/${group.id}`
        : parent
          ? `/sites/grouped/${parent.slug}`
          : site
            ? `/sites/${site.slug}`
            : '';
      const route = `${base}/${sourceId}`;

      return (
        <div className="grid grid-cols-3">
          <SecurityPostureCard tenants={data.rows} route={`${route}/tenants`} />
        </div>
      );
    },
    skeleton: () => {
      return (
        <Card>
          <CardHeader>
            <Skeleton />
          </CardHeader>
        </Card>
      );
    },
  });

  return content;
}

type SecurityPostureProps = {
  tenants: Tables<'source_tenants'>[];
  route: string;
};
function SecurityPostureCard({ tenants, route }: SecurityPostureProps) {
  const caTenants = tenants.filter(
    (t) => (t.metadata as MicrosoftTenantMetadata).mfa_enforcement === 'conditional_access'
  );
  const defaultTenants = tenants.filter(
    (t) => (t.metadata as MicrosoftTenantMetadata).mfa_enforcement === 'security_defaults'
  );
  const noneTenants = tenants.length - (caTenants.length + defaultTenants.length);

  const metrics = [
    {
      icon: ShieldCheck,
      label: 'Conditional Access',
      color: 'text-emerald-500',
      value: caTenants.length,
      href: '?filter=mfa_enforcement+eq+conditional_access',
    },
    {
      icon: ShieldCheck,
      label: 'Security Defaults',
      color: 'text-primary',
      value: defaultTenants.length,
      href: '?filter=mfa_enforcement+eq+security_defaults',
    },
    {
      icon: ShieldCheck,
      label: 'No Enforcement',
      color: 'text-red-500',
      value: noneTenants,
      href: '?filter=mfa_enforcement+eq+none',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href={route} className="flex gap-2 items-center hover:text-primary">
            <Group className="w-5 h-5 text-amber-500" />
            Tenants
          </Link>
        </CardTitle>
        <CardAction>{tenants.length}</CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {metrics.map(({ icon: Icon, label, color, value, href }) => {
            return (
              <Display key={label} href={`${route}${href}`}>
                <div className="flex w-full justify-between">
                  <div className="flex gap-2 items-center">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span>{label}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">{value} Tenants</span>
                    <Badge variant="secondary">
                      {((value / tenants.length) * 100).toFixed(0)} %
                    </Badge>
                  </div>
                </div>
              </Display>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
