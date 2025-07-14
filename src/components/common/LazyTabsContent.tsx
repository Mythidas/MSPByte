'use client';

import { TabsContent } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';

type Props = {} & React.ComponentProps<typeof TabsContent>;

export function LazyTabContent({ value, children, ...props }: Props) {
  const searchParams = useSearchParams();
  const activeValue = searchParams.get('tab');

  if (value !== activeValue && !activeValue && value !== 'dashboard') return null;

  return (
    <TabsContent value={value} {...props} className="space-y-6">
      {children}
    </TabsContent>
  );
}
