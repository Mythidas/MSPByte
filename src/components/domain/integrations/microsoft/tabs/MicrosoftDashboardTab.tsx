import { SourceMetricCard } from '@/components/domain/metrics/SourceMetricCard';
import Display from '@/components/shared/Display';
import SearchBar from '@/components/shared/SearchBar';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getRow, getRows } from '@/db/orm';
import { Tables } from '@/db/schema';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { resolveSearch } from '@/lib/helpers/search';
import { MicrosoftTenantMetadata } from '@/types/source/tenants';
import { Globe, Group, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
        <SourceMetricCard
          route={`${route}/identities`}
          {...props}
          unit="identities"
          color="text-emerald-500"
        />
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
        <div className="grid grid-cols-3 gap-2">
          <SecurityPostureCard tenants={data.rows} route={`${route}/tenants`} />
          <DomainsCard tenants={data.rows} route="" />
        </div>
      );
    },
    skeleton: () => {
      return (
        <div className="grid grid-cols-3 gap-2">
          <Card className="gap-2 py-4">
            <CardHeader>
              <CardTitle>
                <div className="flex gap-2 items-center">
                  <Group className="w-5 h-5 text-amber-500" />
                  Tenants
                </div>
              </CardTitle>
              <CardAction>
                <Skeleton className="w-6 h-6" />
              </CardAction>
            </CardHeader>
            <Separator />
            <CardContent>
              <div className="grid gap-2">
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
              </div>
            </CardContent>
          </Card>
          <Card className="gap-2 py-4 col-span-2">
            <CardHeader>
              <CardTitle>
                <div className="flex gap-2 items-center">
                  <Globe className="w-5 h-5 text-cyan-500" />
                  Domains
                </div>
              </CardTitle>
              <CardAction>
                <Skeleton className="w-6 h-6" />
              </CardAction>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-2">
              <Skeleton className="w-full h-10" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    },
  });

  return content;
}

type SourceTenantCardsProps = {
  tenants: Tables<'source_tenants'>[];
  route: string;
};
function SecurityPostureCard({ tenants, route }: SourceTenantCardsProps) {
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
    <Card className="gap-2 py-4">
      <CardHeader>
        <CardTitle>
          <Link href={route} className="flex gap-2 items-center hover:text-primary">
            <Group className="w-5 h-5 text-amber-500" />
            Tenants
          </Link>
        </CardTitle>
        <CardAction>{tenants.length}</CardAction>
      </CardHeader>
      <Separator />
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

function DomainsCard({ tenants }: SourceTenantCardsProps) {
  const [search, setSearch] = useState('');
  const domains = tenants
    .flatMap((t) => (t.metadata as MicrosoftTenantMetadata).domains)
    .filter((d) => d !== undefined);

  return (
    <Card className="gap-2 col-span-2 py-4">
      <CardHeader>
        <CardTitle>
          <Dialog>
            <DialogTrigger className="flex gap-2 items-center hover:text-primary hover:cursor-pointer">
              <Globe className="w-5 h-5 text-cyan-500" />
              Domains
            </DialogTrigger>
            <DialogContent className="!max-w-2/5">
              <DialogHeader>
                <DialogTitle>All Domains</DialogTitle>
                <DialogDescription>Search for all domains in the current view</DialogDescription>
              </DialogHeader>

              <SearchBar
                lead={<Search className="w-4 h-4" />}
                onSearch={setSearch}
                placeholder="Search domains..."
              />
              <ScrollArea className="max-h-72">
                <div className="grid grid-cols-2 gap-2">
                  {domains
                    .filter((d) => resolveSearch(search, [d]))
                    .map((domain, index) => (
                      <Display key={index}>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-cyan-500" />
                          {domain}
                        </div>
                      </Display>
                    ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardAction>{domains.length}</CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-2">
        <SearchBar
          lead={<Search className="w-4 h-4" />}
          onSearch={setSearch}
          placeholder="Search domains..."
        />
        <div className="grid grid-cols-3 gap-2">
          {domains
            .filter((d) => resolveSearch(search, [d]))
            .slice(0, 5)
            .map((domain, index) => (
              <Display key={index}>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  {domain}
                </div>
              </Display>
            ))}
          {domains.length > 5 && <Display>+{domains.length - 5} more</Display>}
        </div>
      </CardContent>
    </Card>
  );
}
