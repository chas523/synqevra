import {
  MemoryRouter,
  Route,
  Routes,
  useRoutes,
} from '@modern-js/runtime/router';
import Layout from '@/routes/layout';
import { generatedRouteElements } from '../lib/route-generator';

interface MedplumAppProps {
  initialEntry?: string;
  mode?: 'standalone' | 'microfrontend';
}

const ThingsBoardApp = ({
  initialEntry = '/',
  mode = 'microfrontend',
}: MedplumAppProps) => {
  console.log(`MedplumApp - Mode: ${mode}, InitialEntry: ${initialEntry}`);

  if (mode === 'microfrontend') {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/" element={<Layout />}>
            {generatedRouteElements}
            {/* ✅ Auto-generated routes using render function */}
            {/* {renderGeneratedRoutes()} */}
            {/* or just add by hand */}
            {/* <Route index element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="medplum" element={<MedplumPage />} /> */}
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  //for standalone mode
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <h2 className="text-xl font-bold text-blue-800 mb-2">Standalone Mode</h2>
      <p className="text-blue-600">
        Running as standalone app. Use Modern.js file-based routing instead.
      </p>
    </div>
  );
};

export default ThingsBoardApp;
