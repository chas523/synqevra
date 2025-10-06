import { useNavigate, useParams } from '@modern-js/runtime/router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDevice } from '../hooks/useDevice';
import { useUpdateDeviceAttributes } from '../hooks/useUpdateDeviceAttributes';
import { CurrentParameters } from './components/CurrentParameters';
import { AddParameterForm } from './components/AddParameterForm';
import { DeviceHeader } from './components/DeviceHeader';
import { EmptyState } from './components/EmptyState';

// Hardcoded list of medical parameters
const MEDICAL_PARAMETERS = [
  { key: 'temperature', label: 'Temperature (°C)', unit: '°C' },
  { key: 'heart_rate', label: 'Heart Rate (BPM)', unit: 'BPM' },
  { key: 'oxygen_saturation', label: 'Oxygen Saturation (%)', unit: '%' },
  { key: 'respiratory_rate', label: 'Respiratory Rate (RPM)', unit: 'RPM' },
  { key: 'is_awake', label: 'Is Awake (Yes/No)' },
];

interface THRESHOLD_OPTIONS_Interface {
  value: 'minimum' | 'maximum' | 'equal' | 'not_equal';
  label: string;
}
const THRESHOLD_OPTIONS: THRESHOLD_OPTIONS_Interface[] = [
  { value: 'minimum', label: 'Minimum' },
  { value: 'maximum', label: 'Maximum' },
  { value: 'equal', label: 'Equal' },
  { value: 'not_equal', label: 'NotEqual' },
];

const DeviceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const deviceId = id as string;

  const { device, attributes, isLoading, error, refresh } = useDevice(deviceId);
  const { updateAttributes, loading: updating } =
    useUpdateDeviceAttributes(deviceId);

  const [newParameterKey, setNewParameterKey] = useState<string>('');
  const [newParameterValue, setNewParameterValue] = useState<string>('');

  // Find current limits from attributes
  const currentLimits =
    (attributes?.find(attr => attr.key === 'limits')?.value as Record<
      string,
      number
    >) || {};

  const [limits, setLimits] =
    useState<Record<string, any>>(currentLimits);
  const [selectedThreshold, setSelectedThreshold] = useState<
    THRESHOLD_OPTIONS_Interface | undefined
  >(undefined);

  // Update local limits when attributes are loaded
  useState(() => {
    setLimits(currentLimits);
  });

  const handleRemoveLimit = (key: string) => {
    setLimits(prev => {
      const newLimits = { ...prev };
      delete newLimits[key];
      return newLimits;
    });
  };

  const handleRemoveSpecificThreshold = (parameterKey: string, thresholdType: string) => {
    setLimits(prev => {
      const newLimits = { ...prev };
      if (newLimits[parameterKey]) {
        const updatedParameter = { ...newLimits[parameterKey] };
        delete updatedParameter[thresholdType];
        
  // If there are no more thresholds, remove the entire parameter
        if (Object.keys(updatedParameter).length === 0) {
          delete newLimits[parameterKey];
        } else {
          newLimits[parameterKey] = updatedParameter;
        }
      }
      return newLimits;
    });
  };

const handleAddParameter = () => {
  if (newParameterKey && newParameterValue) {
    const numValue = parseFloat(newParameterValue);
    const selectedThresholdValue = selectedThreshold?.value;

    if (selectedThresholdValue) {
      setLimits(prev => {
        const existingParam = prev?.[newParameterKey] ?? {};

        if (!isNaN(numValue)) {
          // numeric values - we replace the threshold value
          return {
            ...prev,
            [newParameterKey]: {
              ...existingParam,
              [selectedThresholdValue]: numValue,
            },
          };
        } else {
          // text values - we store them as an array of values; we ensure a default empty array
          const existingValues = Array.isArray(existingParam[selectedThresholdValue])
            ? existingParam[selectedThresholdValue]
            : existingParam[selectedThresholdValue] !== undefined
            ? [String(existingParam[selectedThresholdValue])]
            : [];

          return {
            ...prev,
            [newParameterKey]: {
              ...existingParam,
              [selectedThresholdValue]: [...existingValues, newParameterValue],
            },
          };
        }
      });
    }

    setNewParameterKey('');
    setNewParameterValue('');
    setSelectedThreshold(undefined);
  }
};
  console.log(limits);
  const handleSaveChanges = async () => {
    try {
      await updateAttributes(limits);
  refresh(); // Refresh data after update
    } catch (error) {
      console.error('Error updating attributes:', error);
      alert('Error updating device attributes');
    }
  };

  const handleBackToList = () => {
    navigate('/device');
  };

  const handleThresholdPick = (
    threshold_object: THRESHOLD_OPTIONS_Interface,
  ) => {
    setSelectedThreshold(threshold_object);
  };
  //   const handleAddLimit = () => {
  //     const newLimit = ([limits.temperature, limits.respiratory_rate])
  //     // setLimits()
  //     console.log(newLimit)
  //   }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading device details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8 text-red-500">
          Error loading device: {error.message}
        </div>
        <div className="text-center">
          <Button onClick={handleBackToList} variant="outline">
            Back to Device List
          </Button>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8 text-gray-500">Device not found</div>
        <div className="text-center">
          <Button onClick={handleBackToList} variant="outline">
            Back to Device List
          </Button>
        </div>
      </div>
    );
  }

  // Available parameters to add (those not yet set)
  const availableParameters = MEDICAL_PARAMETERS;

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col max-w-4xl mx-auto">
        <DeviceHeader
          deviceName={device.name}
          deviceActive={device.active}
          deviceLabel={device.label}
          onBackToList={handleBackToList}
        />

  {/* Medical Parameters - main section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Medical Parameters Configuration
              <Button
                onClick={refresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                Refresh
              </Button>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Configure threshold values for medical parameters. These values
              will be used for monitoring and alerts.
              <br />
              <strong>Note:</strong> Set appropriate threshold values based on
              medical standards and patient requirements.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current parameters */}
            <CurrentParameters
              limits={limits}
              medicalParameters={MEDICAL_PARAMETERS}
              onRemoveLimit={handleRemoveLimit}
              onRemoveSpecificThreshold={handleRemoveSpecificThreshold}
            />

            {/* Add new parameter */}
            <AddParameterForm
              availableParameters={availableParameters}
              newParameterKey={newParameterKey}
              newParameterValue={newParameterValue}
              selectedThreshold={selectedThreshold}
              thresholdOptions={THRESHOLD_OPTIONS}
              onParameterKeyChange={setNewParameterKey}
              onParameterValueChange={setNewParameterValue}
              onThresholdSelect={handleThresholdPick}
              onAddParameter={handleAddParameter}
            />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                onClick={handleSaveChanges}
                disabled={updating || Object.keys(limits).length === 0}
                className="flex-1 sm:flex-none"
                size="lg"
              >
                {updating ? 'Saving Changes...' : 'Save Configuration'}
              </Button>

              <div className="text-sm text-gray-600 flex items-center">
                <span>
                  💡 Changes will update both threshold limits and telemetry
                  keys automatically
                </span>
              </div>
            </div>

            {/* Empty state */}
            {Object.keys(limits).length === 0 && <EmptyState />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeviceDetailPage;
