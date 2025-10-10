import { Button } from '@/components/ui/button';

interface SubmitActionsProps {
  isLoading: boolean;
  onCancel: () => void;
  isValid: boolean;
}

export const SubmitActions = ({
  isLoading,
  onCancel,
  isValid,
}: SubmitActionsProps) => {
  return (
    <div className="flex space-x-2 pt-4 border-t">
      <Button type="submit" className="flex-1" disabled={isLoading || !isValid}>
        {isLoading ? 'Creating...' : 'Add Tenant & User'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
    </div>
  );
};
