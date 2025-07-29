import { Tables } from '@/db/schema';

type Props = {
  source: Tables<'sources'>;
};

export default function SophosPartnerDisabled({}: Props) {
  return <div className="p-4">Overview</div>;
}
