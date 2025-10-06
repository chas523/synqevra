import { Outlet } from '@modern-js/runtime/router';
import { NavigationControls } from '@/components/NavigationControls';
import './index.css';

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
