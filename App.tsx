import { StatusBar } from 'react-native';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/tokens';

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: false,
    },
  },
});

function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: colors.canvas }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar
          backgroundColor={colors.canvas}
          barStyle="dark-content"
        />
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
