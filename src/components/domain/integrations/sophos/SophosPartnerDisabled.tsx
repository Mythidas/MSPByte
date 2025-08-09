import { Tables } from '@/types/db';

type Props = {
  source: Tables<'public', 'sources'>;
};

export default function SophosPartnerDisabled({}: Props) {
  return <div className="p-4">Overview</div>;
}
