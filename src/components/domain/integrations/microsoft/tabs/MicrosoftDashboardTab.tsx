import { Tables } from '@/db/schema';

type Props = {
  sourceId: string;
  site?: Tables<'sites'>;
  parent?: Tables<'sites'>;
  group?: Tables<'site_groups'>;
};

export default function MicrosoftDashboardTab({}: Props) {
  return <div>Tab</div>;
}
