import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Globe,
  Lock,
  Unlock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ShieldQuestion,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { getSourceTenant, getSourceTenants } from '@/services/source/tenants';
import SourceMetricsGrid from '@/components/source/sources/SourceMetricsGrid';
import { MicrosoftTenantMetadata } from '@/types/source/tenants';
import { Tables } from '@/db/schema';
import { getSites } from '@/services/sites';
import { useState } from 'react';
import Loader from '@/components/shared/Loader';
import { getRows } from '@/db/orm';
import Display from '@/components/shared/Display';
import SearchBar from '@/components/shared/SearchBar';
import { ScrollArea } from '@/components/ui/scroll-area';

const getMfaConfig = (enforcement: string) => {
  switch (enforcement) {
    case 'conditional_access':
      return {
        label: 'Conditional Access',
        icon: ShieldCheck,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        description: 'MFA enforced through Conditional Access policies',
        status: 'secure',
      };
    case 'security_defaults':
      return {
        label: 'Security Defaults',
        icon: Shield,
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        description: 'MFA enforced through Security Defaults',
        status: 'protected',
      };
    case 'none':
      return {
        label: 'No Enforcement',
        icon: Unlock,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        description: 'No tenant-wide MFA enforcement configured',
        status: 'vulnerable',
      };
    case 'mixed':
      return {
        label: 'Mixed Configuration',
        icon: ShieldQuestion,
        color: 'bg-amber-500',
        textColor: 'text-amber-700',
        description: 'Tenant MFA enforcement varies across sites',
        status: 'warning',
      };
    default:
      return {
        label: 'Unknown Status',
        icon: Lock,
        color: 'bg-gray-500',
        textColor: 'text-gray-700',
        description: 'MFA enforcement status unknown',
        status: 'unknown',
      };
  }
};

type Props = {
  sourceId: string;
  site?: Tables<'sites'>;
  parent?: Tables<'sites'>;
  group?: Tables<'site_groups'>;
};

export default function MicrosoftDashboardTab({ sourceId, site, parent, group }: Props) {
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
      if (!data || data.total === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Microsoft Tenants Found</h3>
            <p className="text-gray-500 max-w-md">
              No Microsoft 365 tenants are configured for this scope. Connect a tenant to view
              security insights and domain information.
            </p>
          </div>
        );
      }

      const uniformOrMixed = () => {
        const arr = data.rows.map((d) => (d.metadata as MicrosoftTenantMetadata).mfa_enforcement);
        if (arr.length === 0) return 'mixed';
        const first = arr[0];
        return arr.every((val) => val === first) ? first : 'mixed';
      };

      const mfaTypes = data.rows.map(
        (d) => (d.metadata as MicrosoftTenantMetadata).mfa_enforcement || 'unknown'
      );

      const counts = {
        conditional_access: 0,
        security_defaults: 0,
        none: 0,
        unknown: 0,
      };

      for (const type of mfaTypes) {
        if (type in counts) counts[type as keyof typeof counts]++;
        else counts.unknown++;
      }

      const mfaConfig = getMfaConfig(uniformOrMixed());
      const totalTenants = data.rows.length;
      const securedTenants = counts.conditional_access + counts.security_defaults;

      const domains = data.rows.flatMap(
        (tenant) => (tenant.metadata as MicrosoftTenantMetadata).domains || []
      );

      const route =
        site || parent
          ? `/sites/${parent?.slug ?? site?.slug}/${sourceId}`
          : group
            ? `/groups/${group.id}/${sourceId}`
            : `/${sourceId}`;

      return (
        <div className="grid gap-4">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Total Tenants"
              value={totalTenants.toString()}
              icon={Building2}
              color="blue"
              description="Connected Microsoft 365 tenants"
            />
            <MetricCard
              title="Secured Tenants"
              value={securedTenants.toString()}
              icon={ShieldCheck}
              color="emerald"
              description="Tenants with MFA enforcement"
            />
            <MetricCard
              title="Total Domains"
              value={domains.length.toString()}
              icon={Globe}
              color="purple"
              description="Verified domains across all tenants"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            {/* Security Overview - Takes up 2 columns */}
            <div className="xl:col-span-2">
              <SecurityOverviewCard
                mfaConfig={mfaConfig}
                counts={counts}
                totalTenants={totalTenants}
                isSingleSite={!!site}
              />
            </div>

            {/* Domains Card - Takes up 3 columns */}
            <div className="xl:col-span-3">
              <ModernDomainsCard domains={domains} />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Detailed Analytics</h2>
                <p className="text-muted-foreground mt-1">Comprehensive metrics and insights</p>
              </div>
            </div>

            <SourceMetricsGrid
              scope={site ? 'site' : parent ? 'parent' : group ? 'group' : 'global'}
              sourceId={sourceId}
              siteId={parent?.id || site?.id}
              groupId={group?.id}
              route={route}
            />
          </div>
        </div>
      );
    },
    skeleton: () => <Loader />,
  });

  return <div className="p-6 max-w-7xl mx-auto">{content}</div>;
}

const MetricCard = ({
  title,
  value,
  icon: Icon,
  color,
  description,
}: {
  title: string;
  value: string;
  icon: any;
  color: 'blue' | 'emerald' | 'purple';
  description: string;
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    purple: 'text-purple-600',
  };

  return (
    <Card className={`${colorClasses[color]} hover:shadow-lg transition-shadow duration-200`}>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Icon className="h-8 w-8" />
          <div className="text-3xl font-bold">{value}</div>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const SecurityOverviewCard = ({
  mfaConfig,
  counts,
  totalTenants,
  isSingleSite,
}: {
  mfaConfig: any;
  counts: Record<string, number>;
  totalTenants: number;
  isSingleSite: boolean;
}) => {
  const StatusIcon =
    mfaConfig.status === 'secure'
      ? CheckCircle2
      : mfaConfig.status === 'vulnerable'
        ? AlertTriangle
        : ShieldQuestion;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className={`p-2 rounded-lg ${mfaConfig.bgColor}`}>
            <Shield className={`h-5 w-5 ${mfaConfig.color.replace('bg-', 'text-')}`} />
          </div>
          Security Posture
        </CardTitle>
        <CardDescription>Multi-factor authentication enforcement status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Banner */}
        <Display>
          <div className={`rounded-lg ${mfaConfig.bgColor}`}>
            <div className="flex items-start gap-3">
              <StatusIcon className={`h-5 w-5 ${mfaConfig.textColor}`} />
              <div>
                <h4 className={`font-semibold`}>{mfaConfig.label}</h4>
                <p className={`text-sm text-muted-foreground`}>{mfaConfig.description}</p>
              </div>
            </div>
          </div>
        </Display>

        {/* Breakdown for multiple tenants */}
        {!isSingleSite && totalTenants > 1 && (
          <div className="space-y-4">
            <h5 className="font-medium text-muted-foreground">Enforcement Breakdown</h5>
            <div className="space-y-3">
              {[
                {
                  key: 'conditional_access',
                  label: 'Conditional Access',
                  color: 'emerald',
                  icon: ShieldCheck,
                },
                {
                  key: 'security_defaults',
                  label: 'Security Defaults',
                  color: 'blue',
                  icon: Shield,
                },
                { key: 'none', label: 'No Enforcement', color: 'red', icon: Unlock },
                { key: 'unknown', label: 'Unknown Status', color: 'gray', icon: Lock },
              ].map((item) => {
                const count = counts[item.key as keyof typeof counts];
                if (count === 0) return null;

                const percentage = Math.round((count / totalTenants) * 100);

                return (
                  <Display key={item.key}>
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <item.icon className={`h-4 w-4 text-${item.color}-600`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {count} tenant{count !== 1 ? 's' : ''}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                  </Display>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ModernDomainsCard = ({ domains }: { domains: string[] }) => {
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const INITIAL_DISPLAY = 12;

  const filteredDomains = domains.filter((domain) =>
    domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasMany = filteredDomains.length > INITIAL_DISPLAY;
  const displayedDomains = showAll ? filteredDomains : filteredDomains.slice(0, INITIAL_DISPLAY);
  const remainingCount = filteredDomains.length - INITIAL_DISPLAY;

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg border p-2">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Domain Configuration</CardTitle>
              <CardDescription>
                {domains.length} verified domain{domains.length !== 1 ? 's' : ''} across all tenants
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Search/Filter */}
        {domains.length > 6 && (
          <div className="relative">
            <SearchBar
              type="text"
              placeholder="Search domains..."
              value={searchTerm}
              onSearch={setSearchTerm}
              delay={0}
              lead={<Search className="w-4 h-4" />}
            />
          </div>
        )}

        {/* Domains Grid */}
        <ScrollArea className="max-h-46 overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {displayedDomains.map((domain) => (
              <Display key={domain}>
                <Globe className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span className="text-sm font-medium text-muted-foreground truncate" title={domain}>
                  {domain}
                </span>
              </Display>
            ))}
          </div>
        </ScrollArea>

        {/* Show More/Less Button */}
        {hasMany && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium  border border-dashed hover:bg-card hover:cursor-pointer transition-colors duration-200"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show {remainingCount} More Domain{remainingCount !== 1 ? 's' : ''}
              </>
            )}
          </button>
        )}

        {filteredDomains.length === 0 && searchTerm && (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No domains match your search</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
