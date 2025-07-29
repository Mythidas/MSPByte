import { Tables } from '@/db/schema';

type Props = {
  source: Tables<'sources'>;
  integration: Tables<'source_integrations'>;
};

export default function AutotaskEnabled({}: Props) {
  return <div></div>;
}
