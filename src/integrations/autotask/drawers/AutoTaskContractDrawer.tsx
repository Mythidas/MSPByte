import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tables } from '@/types/db';
import { prettyText } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';
import Display from '@/shared/components/Display';
import Link from 'next/link';
import { useLazyLoad } from '@/shared/hooks/useLazyLoad';
import Loader from '@/shared/components/Loader';
import { getRows } from '@/db/orm';

type Props = {
  contract: Tables<'source', 'contracts_view'>;
};

export default function AutoTaskContractDrawer({ contract }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { content: Services, trigger } = useLazyLoad({
    fetcher: async () => {
      const items = await getRows('source', 'contract_items', {
        filters: [['external_contract_id', 'eq', contract.external_id]],
      });
      if (!items.error) return items.data.rows;
    },
    render: (data) => {
      if (!data) return <Display>No Services found</Display>;

      return data.map((service) => {
        return (
          <Display key={service.id}>
            <span className="text-sm text-left">{service.name}</span>
          </Display>
        );
      });
    },
    skeleton: () => <Loader />,
    lazy: true,
  });

  useEffect(() => {
    if (isOpen) trigger();
  }, [isOpen]);

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger className="hover:cursor-pointer hover:text-primary transition-colors">
        {contract.name}
      </DrawerTrigger>
      <DrawerContent
        data-vaul-no-drag
        className="h-full !max-w-[700px] !w-fit fixed right-0 top-0 mt-0 rounded-none"
      >
        <DrawerHeader className="pb-4">
          <DrawerTitle className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Newspaper className="h-5 w-5 text-muted-foreground" />
                <span className="select-text font-semibold text-lg truncate">
                  {contract.name || 'Unknown Contract'}
                </span>
              </div>
            </div>
          </DrawerTitle>
          <DrawerDescription className="flex text-sm text-muted-foreground gap-2 items-center">
            {contract.site_name}{' '}
            <Link href={`/sites/${contract.site_slug}/${contract.source_id}/contracts`}>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </DrawerDescription>
        </DrawerHeader>

        <Separator />

        <div className="flex flex-col gap-4 p-4 overflow-y-auto">
          {/* Basic Information Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Contract Information
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">External ID</Label>
                  <Display>{contract.external_id}</Display>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Display>{prettyText(contract.status || '')}</Display>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Start</Label>
                  <Display>{new Date(contract.start_at || '').toDateString()}</Display>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">End</Label>
                  <Display>{new Date(contract.end_at || '').toDateString()}</Display>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Est. Revenue</Label>
                <Display>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(contract.revenue ?? 0)}
                </Display>
              </div>
            </div>
          </div>
          {/* Services Section */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Services
            </h3>
            <div className="grid grid-cols-1 gap-2">{Services}</div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
