'use client'

import MicrosoftIdentitiesTable from "@/components/tables/MicrosoftIdentitiesTable";
import { TabsContent } from "@/components/ui/tabs";
import ErrorDisplay from "@/components/ux/ErrorDisplay";
import { getSourceIdentities, getSourceIdentityLicenses } from "@/lib/actions/server/sources/source-identities";
import { Tables } from "@/types/database";
import { useEffect, useState } from "react";

type Props = {
  sourceId: string;
  siteIds?: string[];
  search?: string;
}

export default function MicrosoftIdentitiesTab({ sourceId, siteIds, search }: Props) {
  const [identities, setIdentities] = useState<Tables<'source_identities'>[]>([]);
  const [licenses, setLicenses] = useState<Tables<'source_identity_licenses'>[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const identities = await getSourceIdentities(sourceId, siteIds);
      const licenses = await getSourceIdentityLicenses(sourceId, siteIds);

      if (identities.ok && licenses.ok) {
        setIdentities(identities.data);
        setLicenses(licenses.data);
      }
    }

    loadData();
  }, [sourceId])

  return (
    <TabsContent value="identities">
      <MicrosoftIdentitiesTable identities={identities} licenses={licenses} defaultSearch={search} />
    </TabsContent>
  );
}