import Display from '@/components/shared/Display';
import Icon from '@/components/shared/Icon';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getRows } from '@/db/orm';
import { Tables } from '@/db/schema';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { cn } from '@/lib/utils';
import { Users2 } from 'lucide-react';
import Link from 'next/link';

type Props = {
  route: string;
  title: string;
  sourceId: string;
  color?: string;
  site?: Tables<'sites'>;
  parent?: Tables<'sites'>;
  group?: Tables<'site_groups'>;
  unit?: string;
};
export function SourceMetricCard({
  route,
  title,
  sourceId,
  site,
  parent,
  group,
  unit,
  color,
}: Props) {
  const { content } = useLazyLoad({
    fetcher: async () => {
      if (group) {
        const metrics = await getRows('rollup_metrics_group', {
          filters: [
            ['group_id', 'eq', group.id],
            ['source_id', 'eq', sourceId],
            unit ? ['unit', 'eq', unit] : undefined,
          ],
        });

        if (metrics.ok) {
          return metrics.data.rows;
        }
      }

      if (site) {
        const metrics = await getRows('rollup_metrics_site', {
          filters: [
            ['source_id', 'eq', sourceId],
            ['site_id', 'eq', site.id],
            unit ? ['unit', 'eq', unit] : undefined,
          ],
        });

        if (metrics.ok) {
          return metrics.data.rows;
        }
      }

      if (parent) {
        const metrics = await getRows('rollup_metrics_parent', {
          filters: [
            ['source_id', 'eq', sourceId],
            ['parent_id', 'eq', parent.id],
            unit ? ['unit', 'eq', unit] : undefined,
          ],
        });

        if (metrics.ok) {
          return metrics.data.rows;
        }
      }

      const metrics = await getRows('rollup_metrics_global', {
        filters: [['source_id', 'eq', sourceId], unit ? ['unit', 'eq', unit] : undefined],
      });

      if (metrics.ok) {
        return metrics.data.rows;
      }
    },
    render: (metrics) => {
      if (!metrics || !metrics.length) return null;

      return (
        <Card className="py-4 gap-2">
          <CardHeader className="px-4">
            <CardTitle>
              <Link href={route} className="flex gap-2 items-center hover:text-primary">
                <Users2 className={cn('h-5 w-5', color)} />
                {title}
              </Link>
            </CardTitle>
            <CardAction>{metrics[0].total}</CardAction>
          </CardHeader>
          <Separator />
          <CardContent className="px-4">
            <div className="grid gap-2">
              {metrics.map(
                ({ icon, name, value, total, description, visual, filters: _filters }, index) => {
                  const filters = _filters as Record<string, string>;

                  return (
                    <Display key={index} href={`${route}?filter=${filters.filter}`}>
                      <div className="flex w-full justify-between">
                        <span className="flex gap-2 items-center">
                          <Icon iconName={icon!} className={`w-4 h-4 ${visual}`} />
                          {name}
                          <span className="text-xs text-muted-foreground">{description}</span>
                        </span>
                        <div className="flex gap-2 font-medium text-muted-foreground">
                          {}
                          {value}
                          <Badge variant="secondary">
                            {((value! / total!) * 100).toFixed(0)} %
                          </Badge>
                        </div>
                      </div>
                    </Display>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      );
    },
    skeleton: () => {
      return (
        <Card className="py-4 gap-2">
          <CardHeader className="px-4">
            <CardTitle className="flex gap-2 items-center">
              <Users2 className="h-5 w-5" />
              Total Identities
            </CardTitle>
            <CardAction>
              <Skeleton className="w-6 h-6" />
            </CardAction>
          </CardHeader>
          <Separator />
          <CardContent className="px-4">
            <div className="grid gap-2">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
            </div>
          </CardContent>
        </Card>
      );
    },
  });

  return content;
}
