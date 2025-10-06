import { Suspense } from 'react';
import { useLocation, useParams } from '@modern-js/runtime/router';
import MedplumApp from 'medplum/App';

const MedplumCatchAll = () => {
  const location = useLocation();
  const params = useParams();
  
  //cut the part after "/medplum/... and match it inside consumer microfrontend"
  //with this practice we can isolate adding new subpages inside consumer app 
  //and delegate the responsibility of routing there
  const medplumPath = location.pathname.replace(/^\/medplum/, '') || '/';

  
  return (
    <div className="min-h-screen w-full">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen text-gray-500">
            Loading Medplum App...
          </div>
        }
      >
        <MedplumApp 
          initialEntry={medplumPath} 
          mode="microfrontend"
        />
      </Suspense>
    </div>
  );
};

export default MedplumCatchAll;