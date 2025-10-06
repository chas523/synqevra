import { useNavigate } from '@modern-js/runtime/router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCreateDevice } from './hooks/useCreateDevice';
import { useDevices } from './hooks/useDevices';
import type { CreateDeviceRequest, Device } from './types';

const DevicePage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 3;

  const { devices, totalPages, isLoading, error } = useDevices(
    currentPage,
    pageSize,
  );
  const { createDevice, loading: creating } = useCreateDevice();

  const [formData, setFormData] = useState<CreateDeviceRequest>({
    name: '',
    label: null,
  });

  const handleInputChange = (
    field: keyof CreateDeviceRequest,
    value: string,
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Device name is required');
      return;
    }

    try {
      const newDevice = await createDevice(formData);
      setFormData({ name: '', label: null });
      // Przekieruj na stronę szczegółów nowo utworzonego urządzenia
      if (newDevice && newDevice.id?.id) {
        navigate(`/device/${newDevice.id.id}`);
      }
    } catch (error) {
      console.error('Error creating device:', error);
      alert('Error creating device');
    }
  };

  const handleDeviceClick = (device: Device) => {
    navigate(`/device/${device.id?.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i);

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Previous
        </Button>

        {pages.map(page => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePageChange(page)}
          >
            {page + 1}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Device Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lewa kolumna - formularz tworzenia urządzenia */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Device</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  type="text"
                  placeholder="Enter device name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="device-label">Label (optional)</Label>
                <Input
                  id="device-label"
                  type="text"
                  placeholder="Enter device label"
                  value={formData.label || ''}
                  onChange={e => handleInputChange('label', e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? 'Creating...' : 'Create Device'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Prawa kolumna - lista urządzeń */}
        <Card>
          <CardHeader>
            <CardTitle>Device List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading devices...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">
                Error loading devices
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No devices to display
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Label</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.map(device => (
                      <TableRow
                        key={device.id?.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleDeviceClick(device)}
                      >
                        <TableCell className="font-medium">
                          {device.name}
                        </TableCell>
                        <TableCell>{device.type || 'N/A'}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              device.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {device.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>{device.label || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {renderPagination()}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DevicePage;
