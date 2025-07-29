import { Tables } from '@/db/schema';

type Props = {
  source: Tables<'sources'>;
};

export default function Microsoft365Disabled({}: Props) {
  return <div className="p-4">Overview</div>;
}
