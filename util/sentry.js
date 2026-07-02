import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: 'https://a947a297ac3033cdf5b6ccb014a14ab5@o4511552937852928.ingest.us.sentry.io/4511552939163648',
  debug: false,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  integrations: [navigationIntegration],
  enableNativeFramesTracking: !isRunningInExpoGo(),
});

export { Sentry };
