import React, { useState } from 'react';
import { CheckCircle, ChevronRight, ChevronLeft, Map } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import SearchBox from '@/components/shared/SearchBox';
import { SubmitButton } from '@/components/shared/secure/SubmitButton';
import { Tables, TablesInsert } from '@/types/db';
import { useAsync } from '@/hooks/common/useAsync';
import { getTenants } from '@/integrations/sophos/services/tenants';
import { putSourceTenant } from '@/services/source/tenants';
import { toast } from 'sonner';
import { useUser } from '@/lib/providers/UserContext';
import { getRows } from '@/db/orm';

type Props = {
  source: Tables<'public', 'sources'>;
  integration: Tables<'public', 'integrations'>;
  onSave?: () => void;
};

export default function SophosMappingsDialog({ source, integration, onSave }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [sophosData, setSophosData] = useState<{ id: string; name: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedSophosSite, setSelectedSophosSite] = useState<string>('');
  const { user } = useUser();

  const { data: availableSites, refetch } = useAsync({
    initial: [],
    fetcher: async () => {
      const sites = await getRows('public', 'sites_view', {
        sorting: [['name', 'asc']],
      });
      const existingMappings = await getRows('source', 'tenants', {
        filters: [['source_id', 'eq', source.id]],
      });

      if (sites.ok && existingMappings.ok) {
        // Filter out sites that already have mappings
        return sites.data.rows.filter(
          (site) => !existingMappings.data.rows.some((mapping) => mapping.site_id === site.id)
        );
      }
      return [];
    },
    deps: [source.id, isOpen],
  });

  const handleClose = (open?: boolean) => {
    if (open) {
      setIsOpen(true);
      return;
    }

    setCurrentStep(2);
    setSelectedSite('');
    setSelectedSophosSite('');
    setIsValidating(false);
    refetch();
  };

  const handleLoadSophosSites = async () => {
    setIsValidating(true);

    try {
      const tenants = await getTenants(integration);
      if (tenants.ok) {
        setSophosData(tenants.data);
        setCurrentStep(2);
      } else {
        toast.error('Failed to load Sophos sites');
      }
    } catch {
      toast.error('Failed to connect to Sophos');
    } finally {
      setIsValidating(false);
    }
  };

  const handleFinish = async () => {
    setIsValidating(true);

    if (!selectedSite || !selectedSophosSite) {
      toast.error('Please select both an internal site and a Sophos site');
      setIsValidating(false);
      return;
    }

    try {
      const selectedSophosData = sophosData.find((s) => s.id === selectedSophosSite);

      const mapping: TablesInsert<'source', 'tenants'> = {
        source_id: source.id,
        tenant_id: user?.tenant_id || '',
        site_id: selectedSite,
        external_id: selectedSophosSite,
        external_name: selectedSophosData?.name || '',
        metadata: selectedSophosData || {},
      };

      const result = await putSourceTenant([mapping]);
      if (result.ok) {
        toast.info('Site mapping created successfully!');
        onSave?.();
        handleClose();
      } else {
        toast.error('Failed to create mapping');
      }
    } catch {
      toast.error('Failed to save mapping');
    } finally {
      setIsValidating(false);
    }
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
        <span className="ml-2 text-sm font-medium">Load Sophos Sites</span>
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
        <span className="ml-2 text-sm font-medium">Select Sites</span>
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
        <span className="ml-2 text-sm font-medium">Create Mapping</span>
      </div>
    </div>
  );

  const renderLoadSitesStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Load Sophos Sites</h3>
        <p className="text-sm text-muted-foreground">
          Connect to your Sophos integration to load available tenant sites for mapping.
        </p>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="space-y-2">
          <p>
            <strong>Available Internal Sites:</strong> {availableSites.length}
          </p>
          <p className="text-sm text-muted-foreground">
            Only showing internal sites that dont already have mappings.
          </p>
        </div>
      </div>

      {availableSites.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800">
            No unmapped sites available. All internal sites already have Sophos mappings.
          </p>
        </div>
      )}

      <Separator />
      <div className="flex justify-end">
        <Button
          onClick={handleLoadSophosSites}
          disabled={isValidating || availableSites.length === 0}
        >
          {isValidating ? 'Loading...' : 'Load Sophos Sites'}
        </Button>
      </div>
    </div>
  );

  const renderSelectSitesStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Select Sites</h3>
        <p className="text-sm text-muted-foreground">
          Choose an internal site and its corresponding Sophos tenant site to create the mapping.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="internal-site">Internal Site</Label>
          <SearchBox
            placeholder="Select an internal site..."
            options={availableSites.map((site) => ({
              label: `${site.name}${site.parent_name ? ` (${site.parent_name})` : ''}`,
              value: site.id!,
            }))}
            onSelect={setSelectedSite}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sophos-site">Sophos Site</Label>
          <SearchBox
            placeholder="Select a Sophos site..."
            options={sophosData.map((site) => ({
              label: site.name,
              value: site.id,
            }))}
            onSelect={setSelectedSophosSite}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Available Sites</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-800">Internal Sites: {availableSites.length}</p>
            <p className="text-blue-700">Unmapped sites in your organization</p>
          </div>
          <div>
            <p className="font-medium text-blue-800">Sophos Sites: {sophosData.length}</p>
            <p className="text-blue-700">Available tenant sites</p>
          </div>
        </div>
      </div>

      <Separator />
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => setCurrentStep(3)} disabled={!selectedSite || !selectedSophosSite}>
          Next
        </Button>
      </div>
    </div>
  );

  const renderCreateMappingStep = () => {
    const selectedSiteData = availableSites.find((s) => s.id === selectedSite);
    const selectedSophosData = sophosData.find((s) => s.id === selectedSophosSite);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Create Mapping</h3>
          <p className="text-sm text-muted-foreground">
            Review the mapping details and create the site mapping.
          </p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Mapping Summary</h4>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Internal Site:</strong> {selectedSiteData?.name}
              {selectedSiteData?.parent_name && ` (${selectedSiteData.parent_name})`}
            </p>
            <p>
              <strong>Sophos Site:</strong> {selectedSophosData?.name}
            </p>
            <p>
              <strong>Sophos Site ID:</strong> {selectedSophosData?.id}
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Ready to Create</h4>
          <p className="text-sm text-green-800">
            This will create a new mapping between your internal site and the Sophos tenant site.
            Data from this Sophos site will be associated with the selected internal site.
          </p>
        </div>

        <Separator />
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <SubmitButton
            onClick={handleFinish}
            disabled={!selectedSite || !selectedSophosSite}
            pending={isValidating}
          >
            Create Mapping
          </SubmitButton>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex justify-start"
          // disabled={!hasAccess('public', 'sources', 'Write')}
          variant="secondary"
        >
          <Map /> New Site Mapping
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Site Mapping</DialogTitle>
          <DialogDescription>Set up a new Sophos tenant site mapping.</DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <Separator />
        <div>
          {currentStep === 1 && renderLoadSitesStep()}
          {currentStep === 2 && renderSelectSitesStep()}
          {currentStep === 3 && renderCreateMappingStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
