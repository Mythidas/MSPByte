import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Globe, Lock, Unlock, ShieldCheck } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { getSourceTenant } from '@/services/source/tenants';
import { MicrosoftTenantMetadata } from '@/types/MicrosoftTenant';
import { Skeleton } from '@/components/ui/skeleton';
import useSourceMetricGrid from '@/hooks/domains/metrics/useSourceMetricGrid';

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
  siteId: string;
};

export default function MicrosoftDashboardTab({ sourceId, siteId }: Props) {
  const { content } = useLazyLoad({
    loader: async () => {
      const tenant = await getSourceTenant(sourceId, siteId);
      if (tenant.ok) {
        return {
          ...tenant.data,
          metadata: tenant.data.metadata as MicrosoftTenantMetadata,
        };
      }
    },
    render: (data) => {
      if (!data) return null;
      const mfaConfig = getMfaConfig(data.metadata.mfa_enforcement);

      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Domains Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                Domains
              </CardTitle>
              <CardDescription>
                {data.metadata.domains.length} domain{data.metadata.domains.length !== 1 ? 's' : ''}{' '}
                configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.metadata.domains.map((domain) => (
                  <Badge key={domain} variant="secondary" className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {domain}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

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
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${mfaConfig.color}`}>
                  <mfaConfig.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{mfaConfig.label}</p>
                  <p className="text-sm text-muted-foreground">{mfaConfig.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    },
    skeleton: () => {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Domains Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                Domains
              </CardTitle>
              <CardDescription>
                <Skeleton className="w-28 h-4" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="w-28 h-4" />
            </CardContent>
          </Card>

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
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="w-32 h-6" />
                  <Skeleton className="w-48 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    },
  });

  const { content: MetricsGrid } = useSourceMetricGrid({ scope: 'site', sourceId, siteId });

  return (
    <TabsContent value="dashboard" className="space-y-6">
      {content}

      {/* Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Quick Metrics</h2>
        </div>

        {MetricsGrid}
      </div>
    </TabsContent>
  );
}
