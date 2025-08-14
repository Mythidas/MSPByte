'use client';

import { SOURCE_ACTIONS } from '@/config/sourceActions';
import Display from '@/shared/components/Display';
import { prettyText } from '@/shared/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const sourceId = params['source'] as string;
  const actionInfo = SOURCE_ACTIONS[sourceId];

  return (
    <div className="grid gap-2">
      <h1 className="font-bold text-xl">Actions</h1>
      <div className="grid grid-cols-4">
        {Object.entries(actionInfo).length > 0 ? (
          Object.entries(actionInfo).map(([key, value]) => {
            return (
              <Display key={key}>
                <Link href={`/actions/${sourceId}/${key}`} className="w-fit">
                  {value.label}
                </Link>
              </Display>
            );
          })
        ) : (
          <strong>No actions available for {prettyText(sourceId)}.</strong>
        )}
      </div>
    </div>
  );
}
