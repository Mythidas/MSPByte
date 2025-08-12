import AutoTaskContractsTable from '@/components/domain/integrations/autotask/tables/AutoTaskContractsTable';
import MicrosoftIdentitiesTable from '@/components/domain/integrations/microsoft/tables/MicrosoftIdentitiesTable';
import MicrosoftLicensesTable from '@/components/domain/integrations/microsoft/tables/MicrosoftLicensesTable';
import MicrosoftPoliciesTable from '@/components/domain/integrations/microsoft/tables/MicrosoftPoliciesTable';
import MicrosoftTenantsTable from '@/components/domain/integrations/microsoft/tables/MicrosoftTenantsTable';
import MicrosoftDashboardTab from '@/components/domain/integrations/microsoft/tabs/MicrosoftDashboardTab';
import SophosDevicesTable from '@/components/domain/integrations/sophos/SophosDevicesTable';
import SophosDashboardTab from '@/components/domain/integrations/sophos/tabs/SophosDashboardTab';
import DataTableLoader from '@/components/shared/table/DataTableLoader';
import { TabProps } from '@/types';

export const SOURCE_TABS: Record<string, Record<string, TabProps>> = {
  'sophos-partner': {
    dashboard: {
      label: 'Dashboard',
      content: (source, parent, site, group) => (
        <SophosDashboardTab sourceId={source} site={site} parent={parent} group={group} />
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
