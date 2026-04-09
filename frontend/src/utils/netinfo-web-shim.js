/**
 * Web shim for @react-native-community/netinfo
 * The real package is native-only. On web, navigator.onLine provides connectivity.
 */
const NetInfo = {
  fetch: () =>
    Promise.resolve({
      isConnected: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isInternetReachable: typeof navigator !== 'undefined' ? navigator.onLine : true,
      type: 'wifi',
      details: null,
    }),
  addEventListener: (callback) => {
    const handler = () =>
      callback({
        isConnected: navigator.onLine,
        isInternetReachable: navigator.onLine,
        type: navigator.onLine ? 'wifi' : 'none',
        details: null,
      });
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handler);
      window.addEventListener('offline', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handler);
        window.removeEventListener('offline', handler);
      }
    };
  },
  useNetInfo: () => ({
    isConnected: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInternetReachable: typeof navigator !== 'undefined' ? navigator.onLine : true,
    type: 'wifi',
    details: null,
  }),
};

export default NetInfo;
