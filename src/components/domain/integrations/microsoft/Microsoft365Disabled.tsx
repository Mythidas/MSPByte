import { Tables } from '@/types/db';

type Props = {
  source: Tables<'public', 'sources'>;
};

export default function Microsoft365Disabled({}: Props) {
  return <div className="p-4">Overview</div>;
}
