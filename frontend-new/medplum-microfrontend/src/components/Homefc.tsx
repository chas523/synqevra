import type React from 'react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';

export const Homefc: React.FC = () => {
  const [_count, _setCountt] = useState(0);
  const [showCard, setShowCard] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-500">
            Medplum Microfrontend
          </h1>
          <span className="text-sm px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
            Tailwind OK
          </span>
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
          <Switch />

          <button
            type="button"
            onClick={() => setShowCard(s => !s)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            {showCard ? 'Ukryj' : 'Pokaż'} kartę
          </button>
        </div>

        {showCard && (
          <div className="flex items-center gap-4 p-4 border rounded-md bg-gradient-to-r from-white to-gray-50">
            <div className="w-16 h-16 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
              M
            </div>
            <div>
              <div className="font-semibold text-gray-800">Medplum</div>
              <div className="text-sm text-gray-500">Microfrontend demo</div>
            </div>
            <div className="ml-auto text-sm text-gray-500">
              Status: <span className="text-green-600 font-medium">Active</span>
            </div>
          </div>
        )}

        <footer className="text-xs text-gray-400 text-right">
          TailwindCSS styles are applied — powinno być widoczne.
        </footer>
      </div>
    </div>
  );
};

// export { Homef };
