'use client';

import MicrosoftIdentitiesTable from '@/components/tables/MicrosoftIdentitiesTable';
import { TabsContent } from '@/components/ui/tabs';
import { Tables } from '@/db/schema';
import { getSourceIdentitiesView } from '@/services/identities';
import { getSourceLicenses } from '@/services/licenses';
import { useEffect, useState } from 'react';

type Props = {
  sourceId: string;
  siteIds?: string[];
};

export default function MicrosoftIdentitiesTab({ sourceId, siteIds }: Props) {
  const [identities, setIdentities] = useState<Tables<'source_identities_view'>[]>([]);
  const [licenses, setLicenses] = useState<Tables<'source_licenses'>[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const identities = await getSourceIdentitiesView(sourceId, siteIds);
      const licenses = await getSourceLicenses(sourceId);

      if (identities.ok && licenses.ok) {
        setIdentities(identities.data);
        setLicenses(licenses.data);
      }
    };

    loadData();
  }, [sourceId]);

  return (
    <TabsContent value="identities">
      <MicrosoftIdentitiesTable
        identities={identities}
        licenses={licenses}
        siteLevel={siteIds?.length === 1}
      />
    </TabsContent>
  );
}
