import { createModuleFederationConfig } from '@module-federation/modern-js';

export default createModuleFederationConfig({
  name: 'host',
  remotes: {
    medplum: 'medplum@http://localhost:3051/static/mf-manifest.json',
    thingsboard: 'thingsboard@http://localhost:3052/static/mf-manifest.json',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
