import { createModuleFederationConfig } from '@module-federation/modern-js';

export default createModuleFederationConfig({
  name: 'thingsboard',
  manifest: {
    filePath: 'static',
  },
  filename: 'static/remoteEntry.js',
  exposes: {
    './App': './src/components/ThingsBoardApp.tsx',
    //  './styles': './src/routes/index.css',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  dts: false,
});
