import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, ChevronRight, ChevronLeft, Map } from 'lucide-react';
import z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAsync } from '@/hooks/common/useAsync';
import SearchBox from '@/components/shared/SearchBox';
import { getDomains } from '@/integrations/microsoft/services/domains';
import { MSGraphDomain } from '@/integrations/microsoft/types/domains';
import { TablesInsert } from '@/types/db';
import { toast } from 'sonner';
import { useUser } from '@/lib/providers/UserContext';
import { SubmitButton } from '@/components/shared/secure/SubmitButton';
import { encrypt } from '@/db/secret';
import { getRows, insertRows } from '@/db/orm';

const credentialsSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant ID is required'),
  client_id: z.string().min(1, 'Client ID is required'),
  client_secret: z.string().min(1, 'Client Secret is required'),
});

type CredentialsData = z.infer<typeof credentialsSchema>;

type Props = {
  sourceId: string;
  parentId?: string;
  onSave?: () => void;
};

export default function Microsoft365MappingsDialog({ sourceId, parentId, onSave }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [domains, setDomains] = useState<MSGraphDomain[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [credentials, setCredentials] = useState<CredentialsData | null>(null);
  const { user } = useUser();

  const { data: sites } = useAsync({
    initial: [],
    fetcher: async () => {
      const sites = await getRows('public', 'sites_view', {
        filters: [parentId ? ['parent_id', 'eq', parentId] : undefined],
      });
      const tenants = await getRows('source', 'tenants', {
        filters: [['source_id', 'eq', sourceId]],
      });
      if (!sites.error && !tenants.error) {
        return sites.data.rows.filter(
          (site) => !tenants.data.rows.some((tenant) => tenant.site_id === site.id)
        );
      }

      return [];
    },
    deps: [],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CredentialsData>({
    resolver: zodResolver(credentialsSchema),
  });

  const handleClose = (open?: boolean) => {
    if (open) {
      setIsOpen(true);
      return;
    }

    setIsOpen(false);
    setCurrentStep(1);
    setDomains([]);
    setSelectedDomains(new Set());
    setSelectedSite('');
    setCredentials(null);
    reset();
    setIsValidating(false);
  };

  const handleCredentialsSubmit = async (data: CredentialsData) => {
    setIsValidating(true);
    setCredentials(data);

    const domains = await getDomains({
      external_id: data.tenant_id,
      metadata: {
        client_id: data.client_id,
        client_secret: data.client_secret,
      },
    });
    if (!domains.error) {
      setDomains(domains.data);
    }

    setIsValidating(false);
    setCurrentStep(2);
  };

  const handleDomainToggle = (domainId: string) => {
    const newSelected = new Set(selectedDomains);
    if (newSelected.has(domainId)) {
      newSelected.delete(domainId);
    } else {
      newSelected.add(domainId);
    }
    setSelectedDomains(newSelected);
  };

  const handleFinish = async () => {
    setIsValidating(true);
    if (!credentials || !selectedSite) return;

    const selectedDomainNames = domains.filter((d) => selectedDomains.has(d.id)).map((d) => d.id);

    const client_secret = await encrypt(credentials.client_secret);
    const mapping: TablesInsert<'source', 'tenants'> = {
      source_id: sourceId,
      tenant_id: user?.tenant_id || '',
      site_id: selectedSite,
      external_id: credentials.tenant_id,
      external_name: selectedDomainNames.join(','),
      metadata: {
        client_id: credentials.client_id,
        client_secret,
        domains: selectedDomainNames,
        mfa_enforcement: 'none',
      },
    };

    const result = await insertRows('source', 'tenants', { rows: [mapping] });
    if (result.error) {
      console.log(result);
      toast.info(`Created source tenant mapping!`);
      onSave?.();
    }

    handleClose();
    setIsValidating(false);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4">
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 1
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
        </div>
        <span className="ml-2 text-sm font-medium">Credentials</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 2
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
        </div>
        <span className="ml-2 text-sm font-medium">Select Domains</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 3
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {currentStep > 3 ? <CheckCircle className="w-5 h-5" /> : '3'}
        </div>
        <span className="ml-2 text-sm font-medium">Assign Site</span>
      </div>
    </div>
  );

  const renderCredentialsStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Microsoft Graph Credentials</h3>
        <p className="text-sm text-muted-foreground">
          Enter your Microsoft Graph application credentials to connect to your tenant.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tenant_id">Tenant ID</Label>
          <Input
            id="tenant_id"
            placeholder="Directory (tenant) ID"
            {...register('tenant_id')}
            className={errors.tenant_id ? 'border-destructive' : ''}
          />
          {errors.tenant_id && (
            <p className="text-sm text-destructive">{errors.tenant_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id">Client ID</Label>
          <Input
            id="client_id"
            placeholder="Application (client) ID"
            {...register('client_id')}
            className={errors.client_id ? 'border-destructive' : ''}
          />
          {errors.client_id && (
            <p className="text-sm text-destructive">{errors.client_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_secret">Client Secret</Label>
          <Input
            id="client_secret"
            type="password"
            placeholder="Client secret value"
            {...register('client_secret')}
            className={errors.client_secret ? 'border-destructive' : ''}
          />
          {errors.client_secret && (
            <p className="text-sm text-destructive">{errors.client_secret.message}</p>
          )}
        </div>
      </div>

      <Separator />
      <div className="flex justify-end">
        <Button onClick={handleSubmit(handleCredentialsSubmit)} disabled={isValidating}>
          {isValidating ? 'Validating...' : 'Next'}
        </Button>
      </div>
    </div>
  );

  const renderDomainsStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Select Domains</h3>
        <p className="text-sm text-muted-foreground">
          Choose which domains from your tenant you want to track. You can select multiple domains.
        </p>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {domains.map((domain) => (
          <div
            key={domain.id}
            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
            onClick={() => handleDomainToggle(domain.id)}
          >
            <Checkbox
              checked={selectedDomains.has(domain.id)}
              onChange={() => handleDomainToggle(domain.id)}
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{domain.id}</span>
                {domain.isVerified ? (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Unverified
                  </Badge>
                )}
              </div>
              {/* <p className="text-sm text-muted-foreground">
                {domain.userCount.toLocaleString()} users
              </p> */}
            </div>
          </div>
        ))}
      </div>

      <Separator />
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => setCurrentStep(3)} disabled={selectedDomains.size === 0}>
          Next ({selectedDomains.size} selected)
        </Button>
      </div>
    </div>
  );

  const renderSiteStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Assign to Site</h3>
        <p className="text-sm text-muted-foreground">
          Choose which site this tenant mapping should be associated with.
        </p>
      </div>

      <SearchBox
        options={sites.map((site) => {
          return { label: site.name!, value: site.id! };
        })}
        onSelect={setSelectedSite}
      />

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Summary</h4>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Tenant ID:</strong> {credentials?.tenant_id}
          </p>
          <p>
            <strong>Selected Domains:</strong>{' '}
            {Array.from(selectedDomains)
              .map((id) => domains.find((d) => d.id === id)?.id)
              .join(', ')}
          </p>
          <p>
            <strong>Site:</strong>{' '}
            {sites.find((s) => s.id === selectedSite)?.name || 'None selected'}
          </p>
        </div>
      </div>

      <Separator />
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <SubmitButton onClick={handleFinish} disabled={!selectedSite} pending={isValidating}>
          Create Mapping
        </SubmitButton>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button
          className="flex justify-start"
          // disabled={!hasAccess('Sources.Write')}
          variant="secondary"
        >
          <Map /> New Site Mapping
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Tenant Mapping</DialogTitle>
          <DialogDescription>Set up a new Microsoft 365 tenant mapping.</DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <Separator />
        <div>
          {currentStep === 1 && renderCredentialsStep()}
          {currentStep === 2 && renderDomainsStep()}
          {currentStep === 3 && renderSiteStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
