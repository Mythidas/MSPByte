import ErrorDisplay from '@/components/ux/ErrorDisplay';
import { getSources } from 'packages/services/sources';
import RouteCard from '@/components/ux/RouteCard';

export default async function Page() {
  const sources = await getSources();

  if (!sources.ok) {
    return <ErrorDisplay message="Failed to fetch data" />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Sources</h1>
      </div>

      {sources.data.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {sources.data.map((source) => {
            return (
              <RouteCard
                key={source.id}
                className="justify-center items-center"
                route={`/sources/${source.slug}`}
                module="Sources"
                level="Read"
              >
                {source.name}
              </RouteCard>
            );
          })}
        </div>
      ) : (
        <ErrorDisplay message="No sources found" />
      )}
    </>
  );
}
