declare module 'medplum/App' {
  import type * as React from 'react';
  interface MedplumAppProps {
    initialEntry?: string;
    mode?: 'standalone' | 'microfrontend';
  }
  const MedplumApp: React.FC<MedplumAppProps>;
  export default MedplumApp;
}

declare module 'thingsboard/App' {
  import type * as React from 'react';
  interface ThingsBoardAppProps {
    initialEntry?: string;
    mode?: 'standalone' | 'microfrontend';
  }
  const ThingsBoardApp: React.FC<ThingsBoardAppProps>;
  export default ThingsBoardApp;
}
