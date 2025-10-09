import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useEstablishMedplumConnection } from '../hooks/useConnections';
import type { EstablishMedplumConnectionInterface } from '../types';

interface EstablishMedplumConnectionFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const EstablishMedplumConnectionForm = ({
  onClose,
  onSuccess,
}: EstablishMedplumConnectionFormProps) => {
  const { establishMedplumConnection, isLoading, error, success } =
    useEstablishMedplumConnection();
  const formId = useId();

  const [formData, setFormData] = useState<EstablishMedplumConnectionInterface>(
    {
      name: 'John', // Mockowane dane
      surname: 'Doe',
      email: 'john.doe@example.com',
      password: '',
      projectName: '',
    },
  );

  const handleInputChange = (
    field: keyof EstablishMedplumConnectionInterface,
    value: string,
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await establishMedplumConnection(formData);
    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <Card className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
      <CardHeader>
        <CardTitle>Configure Medplum Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor={`${formId}-firstName`}
                  className="text-sm font-medium"
                >
                  First Name
                </label>
                <Input
                  id={`${formId}-firstName`}
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor={`${formId}-lastName`}
                  className="text-sm font-medium"
                >
                  Last Name
                </label>
                <Input
                  id={`${formId}-lastName`}
                  type="text"
                  value={formData.surname}
                  onChange={e => handleInputChange('surname', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`${formId}-email`}
                className="text-sm font-medium"
              >
                Email
              </label>
              <Input
                id={`${formId}-email`}
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`${formId}-password`}
                className="text-sm font-medium"
              >
                Password
              </label>
              <Input
                id={`${formId}-password`}
                type="password"
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold">Configure Medplum Project</h3>
            <div className="space-y-2">
              <label
                htmlFor={`${formId}-projectName`}
                className="text-sm font-medium"
              >
                Project Name
              </label>
              <Input
                id={`${formId}-projectName`}
                type="text"
                value={formData.projectName}
                onChange={e => handleInputChange('projectName', e.target.value)}
                required
                placeholder="Enter project name"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                <span className="font-medium">Error:</span> {error}
              </p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">
                <span className="font-medium">Success:</span> Connection
                established successfully!
              </p>
            </div>
          )}

          <div className="flex space-x-2 pt-4 border-t">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Establishing...' : 'Establish Connection'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EstablishMedplumConnectionForm;
