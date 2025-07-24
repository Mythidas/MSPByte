'use client';

import { SOURCE_ACTIONS } from '@/config/sourceActions';
import { prettyText } from '@/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const sourceId = params['source'] as string;
  const actionInfo = SOURCE_ACTIONS[sourceId];

  return (
    <div className="grid grid-cols-4">
      {Object.entries(actionInfo).length > 0 ? (
        Object.entries(actionInfo).map(([key, value]) => {
          return (
            <Link key={key} href={`/actions/${sourceId}/${key}`}>
              {value.label}
            </Link>
          );
        })
      ) : (
        <strong>No actions available for {prettyText(sourceId)}.</strong>
      )}
    </div>
  );
}
