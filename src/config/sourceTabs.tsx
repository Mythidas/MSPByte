import MicrosoftDashboardTab from '@/components/source/integrations/microsoft/tabs/MicrosoftDashboardTab';
import MicrosoftIdentitiesTab from '@/components/source/integrations/microsoft/tabs/MicrosoftIdentitiesTab';
import MicrosoftTenantsTab from '@/components/source/integrations/microsoft/tabs/MicrosoftTenantsTab';
import SophosDashboardTab from '@/components/source/integrations/sophos/tabs/SophosDashboardTab';
import SophosDevicesTab from '@/components/source/integrations/sophos/tabs/SophosDevicesTab';
import { TabProps } from '@/types';

export const SOURCE_TABS: Record<string, Record<string, TabProps>> = {
  'sophos-partner': {
    dashboard: {
      label: 'Dashboard',
      content: (source, parent, site) => (
        <SophosDashboardTab sourceId={source} site={site} parent={parent} />
      ),
    },
    devices: {
      label: 'Devices',
      content: (source, parent, site) => (
        <SophosDevicesTab sourceId={source} site={site} parent={parent} />
      ),
    },
  },
  'microsoft-365': {
    dashboard: {
      label: 'Dashboard',
      content: (source, parent, site) => (
        <MicrosoftDashboardTab sourceId={source} parent={parent} site={site} />
      ),
    },
    tenants: {
      label: 'Tenants',
      content: (source, parent, site) => (
        <MicrosoftTenantsTab sourceId={source} parent={parent} site={site} />
      ),
    },
    identities: {
      label: 'Identities',
      content: (source, parent, site) => (
        <MicrosoftIdentitiesTab sourceId={source} parent={parent} site={site} />
      ),
    },
  },
};
