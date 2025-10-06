import { Route } from '@modern-js/runtime/router';
import * as React from 'react';

// Webpack require.context type definition
interface WebpackContext {
  keys(): string[];
  (id: string): any;
}
declare const require: NodeRequire & {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp,
  ): WebpackContext;
};
const ctx = (require as any).context(
  '../routes',
  true,
  /page\.(tsx|ts|jsx|js)$/,
);

const toRoute = (fp: string) => {
  if (fp === './page.tsx') return { path: undefined, index: true };
  return {
    path: fp
      .replace(/^\.\//, '')
      .replace(/\/page\.(tsx|ts|jsx|js)$/, '')
      .replace(/^__/, '')
      .replace(/\[([^\]]+)\]/g, ':$1'),
    index: false,
  };
};

export const generatedRouteElements = ctx
  .keys()
  .map((fp: string, i: number) => {
    const { path, index } = toRoute(fp);
    const Component = React.lazy(() =>
      Promise.resolve({ default: ctx(fp).default || ctx(fp) }),
    );
    return (
      <Route
        key={i}
        path={index ? undefined : path}
        index={index}
        element={
          <React.Suspense fallback={<div>Loading {path || '/'}...</div>}>
            <Component />
          </React.Suspense>
        }
      />
    );
  });
