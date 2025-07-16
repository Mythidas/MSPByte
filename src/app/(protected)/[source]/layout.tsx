'use server';

import SourceHydrator from '@/lib/providers/SourceContext';
import { getSourceIntegrationView } from '@/services/integrations';

type Props = {
  params: Promise<{ source: string }>;
  children: React.ReactNode;
};

export default async function Layout({ children, ...props }: Props) {
  const params = await props.params;
  const source = await getSourceIntegrationView(params.source);
  if (!source.ok) {
    return <strong>Failed to get source. Please refresh.</strong>;
  }

  return (
    <>
      <SourceHydrator source={source.data} />
      {children}
    </>
  );
}
