import { useState } from 'react';
import medplum_logo from '@/assets/images/medplum_logo.png';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMedplumStatus } from '../hooks/useConnections';
import EstablishMedplumConnectionForm from './EstablishMedplumConnectionForm';

const MedplumConnection = () => {
  const { data, isLoading, error, mutate } = useMedplumStatus();

  const isConnected = data?.status === 'Connected';

  const [establishButtonClicked, setEstablishButtonClicked] = useState(false);
  return (
    <>
      {establishButtonClicked && (
        // biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop click handler
        // biome-ignore lint/a11y/useKeyWithClickEvents: modal backdrop has keyboard support
        <div
          onClick={() => setEstablishButtonClicked(false)}
          className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <EstablishMedplumConnectionForm
            onClose={() => setEstablishButtonClicked(false)}
            onSuccess={() => mutate()}
          />
        </div>
      )}

      <Card
        className={`w-full max-w-md shadow-lg bg-white flex flex-col h-[520px] overflow-y-auto ${isConnected ? 'border-2 border-solid border-green-500' : null}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6 pt-6">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Medplum
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Connection</p>
          </div>
          <div className=" p-2 rounded-lg">
            <img
              src={medplum_logo}
              alt="Thingsboard Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-4 flex-1 flex flex-col">
          <div className="space-y-4 flex-1 flex flex-col">
            <p className="text-sm text-gray-600 leading-relaxed">
              Check your connection status below
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Status:
                </span>
                {isLoading && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-500">Checking...</span>
                  </div>
                )}
              </div>

              {!isLoading && (
                <div
                  className={`p-4 rounded-lg text-center font-medium transition-all duration-200 flex flex-col justify-center items-center min-h-[80px] max-h-[80px] h-20 ${
                    isConnected
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></div>
                      <span className="text-sm font-medium">
                        {isConnected ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                    {isConnected && data?.clientId && (
                      <div className="mt-1">
                        <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-1 rounded break-all">
                          Client id: {data.clientId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">
                  <span className="font-medium">Error:</span> {error.message}
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-3 px-6 pb-6 mt-auto">
          <Button
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 transition-colors duration-200"
            disabled={isLoading || isConnected}
            onClick={() => setEstablishButtonClicked(!establishButtonClicked)}
          >
            {isConnected ? 'Your connection is valid' : 'Establish connection'}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};
export default MedplumConnection;
