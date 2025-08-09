import React, { useState } from 'react';
import { CheckCircle, ChevronRight, ChevronLeft, Plus } from 'lucide-react';
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
import { getRows, insertRows } from '@/db/orm';
import { useAsync } from '@/hooks/common/useAsync';
import { toast } from 'sonner';

type Props = {
  sourceId: string;
  onSave?: () => void;
};

export default function AutoTaskSiteMappingDialog({ sourceId, onSave }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedAutoTaskSite, setSelectedAutoTaskSite] = useState<string>('');
  const [selectedInternalSite, setSelectedInternalSite] = useState<string>('');
  const [autoTaskSites, setAutoTaskSites] = useState<any[]>([]);
  const [internalSites, setInternalSites] = useState<any[]>([]);

  const { refetch } = useAsync({
    initial: { autoTaskSites: [], internalSites: [] },
    fetcher: async () => {
      const autoTask = await getRows('source', 'sites_view', {
        filters: [['source_id', 'eq', sourceId]],
        sorting: [['name', 'asc']],
      });

      if (autoTask.ok) {
        const siteIds = autoTask.data.rows.filter((at) => !!at.site_id).map((at) => at.site_id);
        const sites = await getRows('public', 'sites', {
          filters: [['id', 'not.in', siteIds]],
          sorting: [['name', 'asc']],
        });

        if (sites.ok) {
          const filteredAutoTask = autoTask.data.rows.filter((at) => !at.source_tenant_id);
          const filteredInternal = sites.data.rows;

          // Populate local state
          setAutoTaskSites(filteredAutoTask);
          setInternalSites(filteredInternal);

          return { autoTaskSites: filteredAutoTask, internalSites: filteredInternal };
        }
      }

      setAutoTaskSites([]);
      setInternalSites([]);
      return { autoTaskSites: [], internalSites: [] };
    },
    deps: [sourceId, isOpen],
    immediate: false,
  });

  const handleClose = (open?: boolean) => {
    if (open) {
      setIsOpen(true);
      return;
    }

    setIsOpen(false);
    setCurrentStep(1);
    setSelectedAutoTaskSite('');
    setSelectedInternalSite('');
    setIsValidating(false);
    setAutoTaskSites([]);
    setInternalSites([]);
  };

  const handleLoadSites = async () => {
    setIsValidating(true);

    try {
      await refetch();
      setCurrentStep(2);
    } catch {
      toast.error('Failed to load sites');
    } finally {
      setIsValidating(false);
    }
  };

  const handleFinish = async () => {
    setIsValidating(true);

    if (!selectedAutoTaskSite || !selectedInternalSite) {
      toast.error('Please select both an AutoTask site and an internal site');
      setIsValidating(false);
      return;
    }

    try {
      const autoTaskSite = autoTaskSites.find((at) => at.id === selectedAutoTaskSite);
      const internalSite = internalSites.find((s) => s.id === selectedInternalSite);

      if (!autoTaskSite || !internalSite) {
        toast.error('Selected sites not found');
        setIsValidating(false);
        return;
      }

      const result = await insertRows('source', 'tenants', {
        rows: [
          {
            tenant_id: internalSite.tenant_id,
            source_id: sourceId,
            site_id: internalSite.id,
            external_id: autoTaskSite.external_id!,
            external_name: autoTaskSite.name!,
            metadata: autoTaskSite,
          },
        ],
      });

      if (result.ok) {
        toast.info('Site mapping created successfully!');
        onSave?.();

        // Remove the selected sites from state
        setAutoTaskSites((prev) => prev.filter((s) => s.id !== selectedAutoTaskSite));
        setInternalSites((prev) => prev.filter((s) => s.id !== selectedInternalSite));

        // Reset form
        setCurrentStep(2);
        setSelectedAutoTaskSite('');
        setSelectedInternalSite('');
      } else {
        toast.error('Failed to create mapping: ' + result.error.message);
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
        <span className="ml-2 text-sm font-medium">Load Sites</span>
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
        <h3 className="text-lg font-medium">Load Sites</h3>
        <p className="text-sm text-muted-foreground">
          Load available AutoTask sites and internal sites for mapping.
        </p>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This will load all unmapped AutoTask sites and available internal sites.
          </p>
        </div>
      </div>

      <Separator />
      <div className="flex justify-end">
        <Button onClick={handleLoadSites} disabled={isValidating}>
          {isValidating ? 'Loading...' : 'Load Sites'}
        </Button>
      </div>
    </div>
  );

  const renderSelectSitesStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Select Sites</h3>
        <p className="text-sm text-muted-foreground">
          Choose an AutoTask site and its corresponding internal site to create the mapping.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="autotask-site">AutoTask Site</Label>
          <SearchBox
            placeholder="Select an AutoTask site..."
            options={autoTaskSites.map((site) => ({
              label: site.name!,
              value: site.id!,
            }))}
            onSelect={setSelectedAutoTaskSite}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="internal-site">Internal Site</Label>
          <SearchBox
            placeholder="Select an internal site..."
            options={internalSites.map((site) => ({
              label: site.name!,
              value: site.id!,
            }))}
            onSelect={setSelectedInternalSite}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Available Sites</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-800">AutoTask Sites: {autoTaskSites.length}</p>
            <p className="text-blue-700">Unmapped AutoTask sites</p>
          </div>
          <div>
            <p className="font-medium text-blue-800">Internal Sites: {internalSites.length}</p>
            <p className="text-blue-700">Available internal sites</p>
          </div>
        </div>
      </div>

      {(autoTaskSites.length === 0 || internalSites.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800">
            {autoTaskSites.length === 0 && internalSites.length === 0
              ? 'No AutoTask sites or internal sites available for mapping.'
              : autoTaskSites.length === 0
                ? 'No unmapped AutoTask sites available.'
                : 'No internal sites available for mapping.'}
          </p>
        </div>
      )}

      <Separator />
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep(3)}
          disabled={!selectedAutoTaskSite || !selectedInternalSite}
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderCreateMappingStep = () => {
    const selectedAutoTaskData = autoTaskSites.find((s) => s.id === selectedAutoTaskSite);
    const selectedInternalData = internalSites.find((s) => s.id === selectedInternalSite);

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
              <strong>AutoTask Site:</strong> {selectedAutoTaskData?.name}
            </p>
            <p>
              <strong>AutoTask Site ID:</strong> {selectedAutoTaskData?.external_id}
            </p>
            <p>
              <strong>Internal Site:</strong> {selectedInternalData?.name}
            </p>
            <p>
              <strong>Internal Site ID:</strong> {selectedInternalData?.id}
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Ready to Create</h4>
          <p className="text-sm text-green-800">
            This will create a new mapping between your AutoTask site and the internal site. Data
            from this AutoTask site will be associated with the selected internal site.
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
            disabled={!selectedAutoTaskSite || !selectedInternalSite}
            pending={isValidating}
          >
            Create Mapping
          </SubmitButton>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="justify-start">
          <Plus className="w-4 h-4" />
          New Site Mapping
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Site Mapping</DialogTitle>
          <DialogDescription>Set up a new AutoTask site mapping.</DialogDescription>
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
