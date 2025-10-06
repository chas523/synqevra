import { Suspense } from 'react';
import { useLocation, useParams } from '@modern-js/runtime/router';
import ThingsBoardApp from 'thingsboard/App';

const ThingsboardCatchAll = () => {
  const location = useLocation();
  const params = useParams();
  
  const thingsboardPath = location.pathname.replace(/^\/thingsboard/, '') || '/';
  return (
    <div className="min-h-screen w-full">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen text-gray-500">
            Loading ThingsBoard...
          </div>
        }
      >
        <ThingsBoardApp 
          initialEntry={thingsboardPath} 
          mode="microfrontend"
        />
      </Suspense>
    </div>
  );
};

export default ThingsboardCatchAll;