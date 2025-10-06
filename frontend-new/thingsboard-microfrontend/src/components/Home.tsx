import { useNavigate } from '@modern-js/runtime/router';
import type React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-500">
            ThingsBoard Navigation
          </h1>
        </header>

        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-3">
          <Button
            variant="default"
            className="w-32"
            onClick={() => {
              navigate('/device');
            }}
          >
            Create device
          </Button>
        </div>
      </div>
    </div>
  );
};

export { Home };
