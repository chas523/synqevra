import { Outlet, useNavigate } from '@modern-js/runtime/router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './index.css';
import NavigationControls from '@/components/NavigationControls';


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
