import DataTableLoader from '@/features/data-table/components/DataTableLoader';
import AutoTaskContractsTable from '@/integrations/autotask/tables/AutoTaskContractsTable';
import MicrosoftDashboardTab from '@/integrations/microsoft/components/MicrosoftDashboardTab';
import MicrosoftLicensesTable from '@/integrations/microsoft/components/tables/MicrosoftLicensesTable';
import MicrosoftIdentitiesTable from '@/integrations/microsoft/components/tables/MicrosoftIdentitiesTable';
import MicrosoftPoliciesTable from '@/integrations/microsoft/components/tables/MicrosoftPoliciesTable';
import MicrosoftTenantsTable from '@/integrations/microsoft/components/tables/MicrosoftTenantsTable';
import SophosDevicesTable from '@/integrations/sophos/tables/SophosDevicesTable';
import SophosTenantsTable from '@/integrations/sophos/tables/SophosTenantsTable';
import SophosDashboardTab from '@/integrations/sophos/tabs/SophosDashboardTab';
import { TabProps } from '@/shared/types';
import SophosFirewallsTable from '@/integrations/sophos/tables/SophosFirewallsTable';

export const SOURCE_TABS: Record<string, Record<string, TabProps>> = {
  'sophos-partner': {
    dashboard: {
      label: 'Dashboard',
      content: (source, parent, site, group) => (
        <SophosDashboardTab sourceId={source} site={site} parent={parent} group={group} />
      ),
    },
    tenants: {
      label: 'Tenants',
      content: (source, parent, site, group) => (
        <DataTableLoader
          sourceId={source}
          parent={parent}
          site={site}
          group={group}
          TableComponent={SophosTenantsTable}
        />
      ),
    },
    devices: {
      label: 'Devices',
      content: (source, parent, site, group) => (
        <DataTableLoader
          sourceId={source}
          parent={parent}
          site={site}
          group={group}
          TableComponent={SophosDevicesTable}
        />
      ),
    },
    firewalls: {
      label: 'Firewalls',
      content: (source, parent, site, group) => (
        <DataTableLoader
          sourceId={source}
          parent={parent}
          site={site}
          group={group}
          TableComponent={SophosFirewallsTable}
        />
      ),
    },
  },
  'microsoft-365': {
    dashboard: {
      label: 'Dashboard',
      content: (source, parent, site, group) => (
        <MicrosoftDashboardTab sourceId={source} parent={parent} site={site} group={group} />
      ),
    },
    tenants: {
      label: 'Tenants',
      content: (source, parent, site, group) => (
        <DataTableLoader
          sourceId={source}
          parent={parent}
          site={site}
          group={group}
          TableComponent={MicrosoftTenantsTable}
        />
      ),
    },
    identities: {
      label: 'Identities',
      content: (source, parent, site, group) => (
        <DataTableLoader
          sourceId={source}
          parent={parent}
          site={site}
          group={group}
          TableComponent={MicrosoftIdentitiesTable}
        />
      ),
    },
    licenses: {
      label: 'Licenses',
      content: (source, parent, site, group) => (
        <DataTableLoader
          sourceId={source}
          parent={parent}
          site={site}
          group={group}
          TableComponent={MicrosoftLicensesTable}
        />
      ),
    },
    policies: {
      label: 'Policies',
      content: (source, parent, site, group) => (
        <DataTableLoader
          sourceId={source}
          parent={parent}
          site={site}
          group={group}
          TableComponent={MicrosoftPoliciesTable}
        />
      ),
    },
  },
  autotask: {
    dashboard: {
      label: 'Dashboard',
      content: () => null,
    },
    contracts: {
      label: 'Contracts',
      content: (source, parent, site, group) => (
        <DataTableLoader
          sourceId={source}
          parent={parent}
          site={site}
          group={group}
          TableComponent={AutoTaskContractsTable}
        />
      ),
    },
  },
};
