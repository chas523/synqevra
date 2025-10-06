import { Card, CardContent } from '../../../components/ui/card';

export function ErrorMessage({ message }: { message: string }) {
  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardContent className="p-4">
        <p className="text-red-600">{message}</p>
      </CardContent>
    </Card>
  );
}
