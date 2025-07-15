'use client';

import { Tables } from '@/db/schema';
import { SourceProvider } from '@/lib/providers/SourceContext';
export default function SourceProviderClient({
  source,
  integration,
  children,
}: {
  source: Tables<'sources'>;
  integration?: Tables<'source_integrations'>;
  children: React.ReactNode;
}) {
  return <SourceProvider value={{ source, integration }}>{children}</SourceProvider>;
}
