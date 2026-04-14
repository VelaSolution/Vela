import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.velasolution.vela',
  appName: 'VELA',
  webDir: 'out',
  server: {
    url: 'https://velaanalytics.com?app=1',
    cleartext: true,
    allowNavigation: ['velaanalytics.com', '*.velaanalytics.com', '*.supabase.co', '*.r2.dev', '*.tosspayments.com'],
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    allowsLinkPreview: false,
  },
};

export default config;
