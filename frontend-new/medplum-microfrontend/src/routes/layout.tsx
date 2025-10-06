import { Outlet, useNavigate } from '@modern-js/runtime/router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './index.css';

const NavigationControls = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleForward = () => {
    navigate(1);
  };

  return (
    <div className="fixed top-4 left-4 z-10 bg-white rounded-full shadow-lg px-3 py-2 border">
      <div className="flex items-center gap-2">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors duration-200"
          title="Go Back"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        {/* Forward Button */}
        <button
          onClick={handleForward}
          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors duration-200"
          title="Go Forward"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default function Layout() {
  return (
    <div className="min-h-screen">
      <NavigationControls />
      {/* Main content area with top padding to avoid overlap */}
      <main className="pt-16 px-4">
        <Outlet />
      </main>
    </div>
  );
}
