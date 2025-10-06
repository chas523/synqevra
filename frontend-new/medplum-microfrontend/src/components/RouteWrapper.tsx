import React, { Suspense } from 'react';

interface RouteWrapperProps {
  children: React.ReactNode;
  routePath: string;
}

// Error boundary for route loading
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ children, routePath }) => {
  return (
    <RouteErrorBoundary 
      fallback={
        <div className="p-4 border border-orange-200 bg-orange-50 rounded">
          <p className="text-orange-800 font-semibold">Route Error</p>
          <p className="text-orange-600 text-sm">
            Failed to load route: <code>{routePath}</code>
          </p>
        </div>
      }
    >
      <Suspense fallback={
        <div className="p-4 text-gray-500">
          Loading route: {routePath}...
        </div>
      }>
        {children}
      </Suspense>
    </RouteErrorBoundary>
  );
};

export default RouteWrapper;