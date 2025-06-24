'use client';

import MicrosoftIdentitiesTable from '@/components/tables/MicrosoftIdentitiesTable';
import { TabsContent } from '@/components/ui/tabs';
import { Tables } from '@/db/schema';
import { Debug } from '@/lib/utils';
import { getSourceIdentitiesView } from '@/services/identities';
import { getSourceLicenses } from '@/services/licenses';
import { useEffect, useState } from 'react';

type Props = {
  sourceId: string;
  siteIds?: string[];
};

export default function MicrosoftIdentitiesTab({ sourceId, siteIds }: Props) {
  const [identities, setIdentities] = useState<Tables<'source_identities_view'>[]>([]);
  const [licenses, setLicenses] = useState<Tables<'source_license_info'>[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const identities = await getSourceIdentitiesView(sourceId, siteIds);
      if (!identities.ok) {
        Debug.warn(identities.error);
        return;
      }

      const allSkus = [...new Set(identities.data.flatMap((identity) => identity.license_skus!))];
      const licenses = await getSourceLicenses(sourceId, allSkus);

      if (licenses.ok) {
        setIdentities(identities.data);
        setLicenses(licenses.data);
      }
    };

    loadData();
  }, [sourceId, siteIds]);

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
