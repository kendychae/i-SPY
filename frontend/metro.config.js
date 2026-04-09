// metro.config.js — fixes module resolution in npm workspaces monorepo
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Do NOT set watchFolders to the monorepo root — on Windows this causes Metro
// to construct doubled-drive-letter paths like C:\c:\Projects\... which crash.
// Metro finds root node_modules via hierarchical lookup (nodeModulesPaths below).

// Tell Metro to also look in the monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Ensure Metro uses root workspace node_modules properly
config.resolver.disableHierarchicalLookup = false;

// Fallback: if AppEntry.js still runs (e.g. as the Metro bundle entry),
// redirect its `../../App` import to the correct frontend App component.
// Use normalized slashes for Windows/Mac/Linux compatibility.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const originNorm = context.originModulePath.replace(/\\/g, '/');

  // Web shim: @react-native-community/netinfo doesn't support web
  if (moduleName === '@react-native-community/netinfo' && platform === 'web') {
    return {
      filePath: path.resolve(projectRoot, 'src', 'utils', 'netinfo-web-shim.js'),
      type: 'sourceFile',
    };
  }

  // Web shim: react-native-uuid uses crypto.randomUUID() on web
  if (moduleName === 'react-native-uuid' && platform === 'web') {
    return {
      filePath: path.resolve(projectRoot, 'src', 'utils', 'uuid-web-shim.js'),
      type: 'sourceFile',
    };
  }

  if (
    moduleName === '../../App' &&
    originNorm.includes('node_modules/expo/AppEntry')
  ) {
    return {
      filePath: path.resolve(projectRoot, 'src', 'App.js'),
      type: 'sourceFile',
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
