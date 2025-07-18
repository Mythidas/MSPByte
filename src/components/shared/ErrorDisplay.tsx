import { Card, CardHeader } from "@/components/ui/card";

export default function ErrorDisplay({ message }: { message?: string }) {
  return (
    <Card>
      <CardHeader>
        {message || 'Failed to fetch data. Contact support.'}
      </CardHeader>
    </Card>
  );
}