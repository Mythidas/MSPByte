'use client';

import { TabsContent } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';

type Props = { isDefault?: boolean } & React.ComponentProps<typeof TabsContent>;

export function LazyTabContent({ value, isDefault, children, ...props }: Props) {
  const searchParams = useSearchParams();
  const activeValue = searchParams.get('tab');

  if (value !== activeValue && !activeValue && !isDefault) return null;

  return (
    <TabsContent value={value} {...props} className="space-y-6">
      {children}
    </TabsContent>
  );
}
