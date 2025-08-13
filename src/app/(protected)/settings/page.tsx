'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getRow } from '@/db/orm';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { Info } from 'lucide-react';

export default function Page() {
  const { content: Preferences } = useLazyLoad({
    fetcher: async () => {
      const tenant = await getRow('public', 'tenants');
      if (!tenant.error) {
        return tenant.data;
      }
    },
    render: (data) => {
      if (!data) return <strong>Failed to fetch tenant for preferences.</strong>;

      return (
        <div className="grid gap-2">
          <Label className="flex flex-col items-start gap-2">
            <span className="flex gap-2">
              Site Creation
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4" />
                </TooltipTrigger>
                <TooltipContent>How site creation will be managed: Manual or PSA</TooltipContent>
              </Tooltip>
            </span>

            <Select defaultValue={data.pr_create_sites}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="psa">PSA</SelectItem>
              </SelectContent>
            </Select>
          </Label>
        </div>
      );
    },
    skeleton: () => {
      return null;
    },
  });

  return (
    <div className="grid gap-2">
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>{Preferences}</CardContent>
      </Card>
    </div>
  );
}
