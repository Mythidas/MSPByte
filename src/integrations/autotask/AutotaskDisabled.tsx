import { Tables } from '@/types/db';

type Props = {
  source: Tables<'public', 'sources'>;
};

export default function AutotaskDisabled({}: Props) {
  return <div></div>;
}
