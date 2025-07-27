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

const getMfaConfig = (enforcement: string) => {
  switch (enforcement) {
    case 'conditional_access':
      return {
        label: 'Conditional Access',
        icon: ShieldCheck,
        color: 'bg-green-100 text-green-800',
        description: 'MFA enforced through Conditional Access policies',
      };
    case 'security_defaults':
      return {
        label: 'Security Defaults',
        icon: Shield,
        color: 'bg-blue-100 text-blue-800',
        description: 'MFA enforced through Security Defaults',
      };
    case 'none':
      return {
        label: 'No Enforcement',
        icon: Unlock,
        color: 'bg-red-100 text-red-800',
        description: 'No tenant-wide MFA enforcement configured',
      };
    case 'mixed':
      return {
        label: 'Mixed',
        icon: ShieldQuestion,
        color: 'bg-yellow-500 text-white',
        description: 'Tenant MFA enforcement varies',
      };
    default:
      return {
        label: 'Unknown',
        icon: Lock,
        color: 'bg-gray-100 text-gray-800',
        description: 'MFA enforcement status unknown',
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
      if (!data || data.total === 0) return <strong>No Tenant(s) found</strong>;
      const uniformOrMixed = () => {
        const arr = data.rows.map((d) => (d.metadata as MicrosoftTenantMetadata).mfa_enforcement);
        if (arr.length === 0) return 'mixed';
        const first = arr[0];
        return arr.every((val) => val === first) ? first : 'mixed';
      };

      console.log(data);
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
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Domains Card - Takes up 2 columns on xl screens */}
            <div className="xl:col-span-2">
              <DomainsCard domains={domains} />
            </div>

            {/* MFA Enforcement Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  MFA Enforcement
                </CardTitle>
                <CardDescription>Tenant-wide multi-factor authentication policy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${mfaConfig.color} flex-shrink-0`}>
                    <mfaConfig.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{mfaConfig.label}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {mfaConfig.description}
                    </p>
                  </div>
                </div>

                {!site && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground mb-1">Enforcement Breakdown:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <div>
                        <span className="font-medium text-foreground">
                          {counts.conditional_access}
                        </span>{' '}
                        <span className="font-medium">Conditional Access</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">
                          {counts.security_defaults}
                        </span>{' '}
                        <span className="font-medium">Security Defaults</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{counts.none}</span>{' '}
                        <span className="font-medium">No Enforcement</span>
                      </div>
                      {counts.unknown > 0 && (
                        <div>
                          <span className="font-medium text-foreground">{counts.unknown}</span> with{' '}
                          <span className="font-medium">Unknown</span> status
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Metrics Grid */}
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
        </>
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
}

const DomainsCard = ({ domains }: { domains: string[] }) => {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY = 8;
  const hasMany = domains.length > INITIAL_DISPLAY;

  const displayedDomains = showAll ? domains : domains.slice(0, INITIAL_DISPLAY);
  const remainingCount = domains.length - INITIAL_DISPLAY;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domains
          </div>
          <Badge variant="outline" className="ml-2">
            {domains.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          {domains.length} domain{domains.length !== 1 ? 's' : ''} configured
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-28 overflow-auto">
          {displayedDomains.map((domain) => (
            <Badge
              key={domain}
              variant="secondary"
              className="flex items-center gap-1 justify-start px-2 py-1 text-xs"
            >
              <Globe className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{domain}</span>
            </Badge>
          ))}
        </div>

        {hasMany && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2 border border-dashed rounded-md hover:bg-muted/50"
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
      </CardContent>
    </Card>
  );
};
