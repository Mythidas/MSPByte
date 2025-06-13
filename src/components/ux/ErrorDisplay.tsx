import { Card, CardHeader } from "@/components/ui/card";

export default function ErrorDisplay({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        {message}
      </CardHeader>
    </Card>
  );
}