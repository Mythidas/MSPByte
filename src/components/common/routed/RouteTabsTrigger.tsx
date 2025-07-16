'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TabsTrigger } from '@/components/ui/tabs';

type Props = {} & React.ComponentProps<typeof TabsTrigger>; // inherit all Button props

export default function RouteTabsTrigger({ value, children, ...props }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    const sParams = new URLSearchParams();
    sParams.set('tab', value as string);
    router.replace(`${pathname}?${sParams}`);
  };

  return (
    <TabsTrigger onClick={handleClick} value={value} {...props} className="hover:cursor-pointer">
      {children}
    </TabsTrigger>
  );
}
